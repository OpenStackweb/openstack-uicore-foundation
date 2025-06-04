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

const CompanyInputV2 = ({ summitId, isRequired, sx, onChange, id, name, label, value, error, helperText, onBlur, placeholder, options2Show, disableShrink }) => {
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

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
  }, [value, inputValue]);

  return (
    <Autocomplete
      sx={sx}
      id={id}
      name={name}
      options={options}
      autoComplete
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
        const tmpValue = newValue?.inputValue || newValue;
        setOptions(tmpValue ? [tmpValue, ...options] : options);
        let ev = {
          target: {
            id: name,
            value: tmpValue,
            type: 'companyinput'
          }
        };
        onChange(ev);
      }}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;
        const filtered = [...options];
        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => inputValue === option.title
        );
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            name: `Select "${inputValue}"`
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
          InputLabelProps={{ shrink: disableShrink }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <li key={key} {...optionProps}>
            <Typography
              variant="body2"
              sx={{ fontSize: "1rem", color: "text.secondary" }}
            >
              {option.name}
            </Typography>
          </li>
        );
      }}
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
