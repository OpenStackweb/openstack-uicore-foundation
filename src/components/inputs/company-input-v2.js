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
import T from "i18n-react/dist/i18n-react";
import { TextField, Autocomplete, Typography } from "@mui/material";
import { queryRegistrationCompanies } from "../../utils/query-actions";

const CompanyInputV2 = ({ summitId, isRequired, sx, onChange, id, name, label, value, error, helperText, onBlur, placeholder, options2Show, disableShrink, ...rest }) => {
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const noCompanyMatchText = T.translate("request_modal.no_company_match");
  const createAccessRequestText = (companyName) =>
    T.translate("request_modal.create_company_access_request", {
      companyName: `"${companyName}"`
    });

  React.useEffect(() => {
    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    queryRegistrationCompanies(summitId, inputValue, (results) => {
      let newOptions = [];

      if (value) {
        newOptions = [value];
      }

      if (results) {
        newOptions = [...newOptions, ...results];
      }

      setOptions(newOptions);
    }, options2Show);
    return undefined;
  }, [value, inputValue, summitId, options2Show]);

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
      value={value}
      onBlur={() => { if (onBlur) onBlur(name) }}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.name;
      }}
      onChange={(_, newValue) => {
        let tmpValue = newValue?.inputValue || newValue;
        // if new option is selected ...
        if (newValue && typeof newValue === "object" && newValue.inputValue) {
          tmpValue = {
            id: 0,
            name: newValue.inputValue
          };
        }
        // autoSelect commits the raw typed/autofilled string on blur; normalize to {id, name}.
        if (typeof tmpValue === "string" && tmpValue.trim()) {
          tmpValue = { id: 0, name: tmpValue.trim() };
        }
        setOptions(tmpValue ? [tmpValue, ...options] : options);
        let ev = {
          target: {
            id: name,
            value: tmpValue,
            type: "companyinput"
          }
        };
        onChange(ev);
      }}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;
        const trimmedInput = inputValue.trim();
        const filtered = [...options];

        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => {
            if (typeof option === "string") {
              return option.toLowerCase() === trimmedInput.toLowerCase();
            }

            return option.name?.toLowerCase() === trimmedInput.toLowerCase();
          }
        );

        if (trimmedInput !== "" && !isExisting) {
          filtered.push({
            inputValue: trimmedInput,
            name: noCompanyMatchText
          });
        }

        return filtered;
      }}
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
            inputLabel: disableShrink ? { shrink: false } : undefined
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const isCreateOption = Boolean(option.inputValue);

        return (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <li
            key={key}
            {...optionProps}
            style={{
              ...(isCreateOption
                ? {
                    borderTop: "1px solid rgba(0,0,0,0.12)",
                    display: "block",
                    padding: "10px 15px"
                  }
                : {})
            }}
          >
            {isCreateOption ? (
              <>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {noCompanyMatchText}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "primary.main", fontWeight: 500 }}
                >
                  {createAccessRequestText(option.inputValue)}
                </Typography>
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", padding: "5px 0" }}
              >
                {option.name}
              </Typography>
            )}
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
