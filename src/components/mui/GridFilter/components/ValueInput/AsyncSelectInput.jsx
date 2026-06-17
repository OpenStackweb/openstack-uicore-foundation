/**
 * Copyright 2026 OpenStack Foundation
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

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import T from "i18n-react/dist/i18n-react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { DEBOUNCE_WAIT_250 } from "../../../../../utils/constants";

const defaultFormatOption = (item) => ({
  value: item.id,
  label: item.name
});

const optionShape = PropTypes.shape({
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  raw: PropTypes.object
});

const AsyncSelectInput = ({
  id,
  value,
  label,
  placeholder,
  disabled,
  multiple,
  queryFunction,
  formatOption,
  debounceWait,
  minSearchLength,
  onChange,
  ...rest
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Filter.jsx passes `options` generically to every ValueInput type (meant
  // for the sync `select` type); this type fetches its own, so it's stripped
  // out here rather than spread onto the Autocomplete below.
  const { options: _staleOptions, ...autocompleteProps } = rest;

  const fetchOptions = (searchTerm) => {
    if (searchTerm && searchTerm.length < minSearchLength) {
      setOptions([]);
      return;
    }
    setLoading(true);
    queryFunction(searchTerm, (rawResults) => {
      setOptions((rawResults || []).map((item) => ({ ...formatOption(item), raw: item })));
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOptions("");
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (event, newInputValue, reason) => {
    if (reason !== "input") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOptions(newInputValue), debounceWait);
  };

  const handleChange = (event, selected) => {
    onChange({ target: { value: multiple ? selected || [] : selected || null } });
  };

  // Filter.jsx's single-value default is "" (not null); treat it as empty.
  const normalizedValue = multiple ? value || [] : value || null;
  const finalPlaceholder =
    placeholder || T.translate("grid_filter.placeholders.async");

  return (
    <Autocomplete
      id={id}
      options={options}
      value={normalizedValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      loading={loading}
      multiple={multiple}
      disabled={disabled}
      fullWidth
      size="small"
      getOptionLabel={(option) => option?.label || ""}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      renderInput={(params) => (
        <TextField
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...params}
          label={label}
          placeholder={finalPlaceholder}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={16} />}
                  {params.InputProps?.endAdornment}
                </>
              )
            }
          }}
        />
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...autocompleteProps}
    />
  );
};

AsyncSelectInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([optionShape, PropTypes.arrayOf(optionShape), PropTypes.string]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  queryFunction: PropTypes.func.isRequired,
  formatOption: PropTypes.func,
  debounceWait: PropTypes.number,
  minSearchLength: PropTypes.number,
  onChange: PropTypes.func.isRequired
};

AsyncSelectInput.defaultProps = {
  value: null,
  label: "",
  placeholder: "",
  disabled: false,
  multiple: false,
  formatOption: defaultFormatOption,
  debounceWait: DEBOUNCE_WAIT_250,
  minSearchLength: 0
};

export default AsyncSelectInput;
