/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React from "react";
import PropTypes from "prop-types";
import { TextField, Autocomplete, Typography } from "@mui/material";
import { queryRegistrationCompanies } from "../../utils/query-actions";
import useEventCallback from "../../utils/use-event-callback";

// Any well-formed company object (has a name string).
export const isCompanyObject = (o) =>
  !!o && typeof o === "object" && typeof o.name === "string";

// A company already in the database (positive id assigned by the API).
export const isExistingCompany = (o) => isCompanyObject(o) && o.id > 0;

// A company name the user typed that isn't in the database yet
// (id === 0 is the sentinel autoSelect uses for free-text values).
export const isNewCompany = (o) => isCompanyObject(o) && o.id === 0 && !!o.name.trim();

// Find an existing company in `candidates` whose name matches `name`
// case-insensitively. Returns null if `name` is empty or no match found.
export const findExistingByName = (candidates, name) => {
  const trimmed = name?.trim().toLowerCase();
  if (!trimmed) return null;
  return (candidates || []).find(
    (c) => isExistingCompany(c) && c.name.toLowerCase() === trimmed
  ) || null;
};

// Treat empty strings, null/undefined, and empty-name objects as no selection.
// MUI's Autocomplete renders the clear (x) icon whenever value is truthy, so
// without this an empty-name object would keep the clear icon visible on hover
// of an apparently empty field.
export const normalizeCompanyValue = (v) => {
  if (!v) return null;
  if (typeof v === "string") return v.trim() ? v : null;
  if (typeof v === "object" && typeof v.name === "string" && v.name.trim()) return v;
  return null;
};

const CompanyInputV2 = ({ summitId, isRequired, sx, onChange, id, name, label, value, error, helperText, onBlur, placeholder, options2Show, disableShrink, ...rest }) => {
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  // Memoised so the effect below doesn't re-run on every render.
  const normalizedValue = React.useMemo(() => normalizeCompanyValue(value), [value]);

  // Stable wrapper around the parent's onChange. Consumers commonly pass an
  // inline arrow function (new identity each render), so depending on
  // `onChange` directly in the effect below would re-run it every render and
  // cause an infinite loop of network calls.
  const fireChange = useEventCallback((nextValue) => {
    onChange({ target: { id: name, value: nextValue, type: "companyinput" } });
  });

  React.useEffect(() => {
    if (inputValue === "") {
      setOptions(normalizedValue ? [normalizedValue] : []);
      return undefined;
    }

    // Guard against the in-flight callback firing after the user clears the
    // field (or types something else): without this, a late response would
    // call onChange with the previous typed value and clobber the clear.
    let cancelled = false;
    queryRegistrationCompanies(summitId, inputValue, (results) => {
      if (cancelled) return;

      let newOptions = [];

      if (normalizedValue) {
        newOptions = [normalizedValue];
      }

      if (results) {
        newOptions = [...newOptions, ...results];
      }

      setOptions(newOptions);

      // If the user typed and blurred faster than the API responded, the
      // free-text commit already happened. Once the response arrives, if
      // there is a case-insensitive existing match, replace the free-text
      // value with the canonical option.
      if (isNewCompany(normalizedValue)) {
        const match = findExistingByName(results, normalizedValue.name);
        if (match) {
          fireChange(match);
        }
      }
    }, options2Show);
    return () => { cancelled = true; };
  }, [normalizedValue, inputValue, summitId, options2Show, fireChange]);

  return (
    <Autocomplete
      sx={sx}
      id={id}
      name={name}
      options={options}
      autoComplete
      autoSelect
      freeSolo
      includeInputInList
      filterSelectedOptions
      value={normalizedValue}
      onBlur={() => { if (onBlur) onBlur(name) }}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        return option.name;
      }}
      onChange={(_, newValue) => {
        let tmpValue = newValue;
        // autoSelect commits the raw typed/autofilled string on blur. If the
        // string matches an existing company case-insensitively, pick that
        // option (so typing "tipit" tabs out to "Tipit"). Otherwise commit
        // the typed value as a free-text {id: 0, name} entry.
        if (typeof tmpValue === "string" && tmpValue.trim()) {
          const trimmed = tmpValue.trim();
          tmpValue = findExistingByName(options, trimmed) || { id: 0, name: trimmed };
        }
        // Prepend the committed value but drop any existing entry with
        // the same id; otherwise resolving to an existing company would
        // produce a duplicate row when the dropdown next opens.
        setOptions(tmpValue
          ? [tmpValue, ...options.filter((o) => o?.id !== tmpValue?.id)]
          : options);
        onChange({
          target: {
            id: name,
            value: tmpValue,
            type: "companyinput"
          }
        });
      }}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      // The API already filters server-side; disable MUI's client-side filtering
      // so all returned matches stay visible regardless of substring match.
      filterOptions={(opts) => opts}
      renderInput={(params) => (
        <TextField
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...params}
          label={label}
          placeholder={placeholder}
          fullWidth
          required={isRequired}
          helperText={helperText}
          error={error}
          margin="normal"
          slotProps={{
            ...params.slotProps,
            inputLabel: disableShrink ? { shrink: false } : undefined
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        // Mirror getOptionLabel: string options come through when the
        // consumer passes value as a plain string. Without this guard
        // those rows render empty.
        const label = typeof option === "string" ? option : option?.name;
        return (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <li key={key} {...optionProps}>
            <Typography
              variant="body2"
              sx={{ fontSize: "1em", color: "text.secondary", padding: "5px 0" }}
            >
              {label}
            </Typography>
          </li>
        );
      }}
      {...rest}
    />
  );
};

CompanyInputV2.defaultProps = {
  name: "GENERAL",
  label: "Company",
  options2Show: 20,
  disableShrink: false
};

CompanyInputV2.propTypes = {
  summitId: PropTypes.number.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func.isRequired,
  isRequired: PropTypes.bool,
  name: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  onBlur: PropTypes.func,
  options2Show: PropTypes.number,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  disableShrink: PropTypes.bool
};

export default CompanyInputV2;
