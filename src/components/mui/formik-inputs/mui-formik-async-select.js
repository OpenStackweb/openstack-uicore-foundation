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

import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Checkbox,
  CircularProgress
} from "@mui/material";
import { useField } from "formik";
import { DEBOUNCE_WAIT_250 } from "../../../utils/constants";

const MuiFormikAsyncAutocomplete = ({
  name,
  queryFunction,
  multiple = false,
  placeholder = "Select...",
  plainValue = false,
  hiddenOptions = [],
  formatOption = (item) => ({ value: item.id.toString(), label: item.name }),
  formatSelectedValue = null,
  queryParams = [],
  isMulti = false,
  defaultOptions
}) => {
  const [field, meta, helpers] = useField(name);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const value = field.value || (multiple ? [] : null);
  const error = meta.touched && meta.error;

  const fetchOptions = async (input = "") => {
    setLoading(true);
    try {
      await queryFunction(input, ...queryParams, (results) => {
        const normalized = results
          .filter((r) => !hiddenOptions.includes(r.id))
          .map(formatOption);
        setOptions(normalized);
        setLoading(false);
      });
    } catch (err) {
      console.error("Error fetching options:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!defaultOptions && searchTerm) {
      const delayDebounce = setTimeout(() => {
        fetchOptions(searchTerm);
      }, DEBOUNCE_WAIT_250);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchTerm]);

  // preload empty
  useEffect(() => {
    fetchOptions("");
  }, []);

  const handleChange = (event, selected) => {
    if (!multiple) {
      const selectedValue = plainValue ? selected?.value || "" : selected;
      helpers.setValue(selectedValue);
      return;
    }

    const selectedItems = plainValue
      ? selected.map((s) => s.value)
      : selected.map((s) =>
          formatSelectedValue
            ? formatSelectedValue(s)
            : { id: parseInt(s.value), name: s.label }
        );

    helpers.setValue(selectedItems);
  };

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={handleChange}
      loading={loading}
      multiple={isMulti}
      fullWidth
      getOptionLabel={(option) => option.label || ""}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      onInputChange={!defaultOptions ? (e, newInput) => setSearchTerm(newInput) : undefined}
      filterOptions={
        // only apply filterOptions for "local" search
        defaultOptions
          ? (options, { inputValue }) =>
            options.filter((opt) =>
              opt.label.toLowerCase().includes(inputValue.toLowerCase())
            )
          : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          error={Boolean(error)}
          helperText={error || ""}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps?.endAdornment}
                </>
              )
            },
            inputLabel: { shrink: false }
          }}
          sx={{
            "& input::placeholder": {
              color: "#00000061",
              opacity: 1
            }
          }}
        />
      )}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          {multiple && <Checkbox checked={selected} sx={{ mr: 1 }} />}
          {option.label}
        </li>
      )}
    />
  );
};

export default MuiFormikAsyncAutocomplete;
