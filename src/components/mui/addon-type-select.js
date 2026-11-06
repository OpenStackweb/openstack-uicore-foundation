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

import React, { useEffect, useState } from "react";
import { FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import PropTypes from "prop-types";
import { querySummitAddons } from "../../utils/query-actions";

const AddonTypeSelect = ({
  value,
  name,
  placeholder = "Select...",
  onChange,
  error = false,
  helperText = ""
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    querySummitAddons((results) => {
      const normalized = results.map((r) => ({
        value: r.name,
        label: r.name
      }));
      setOptions(normalized);
    });
  }, []);

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth error={error}>
      <Select
        fullWidth
        name={name}
        value={value}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ color: "#aaa" }}>{placeholder}</span>;
          }
          const match = options.find((opt) => opt.value === selected);
          return match ? match.label : selected;
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

AddonTypeSelect.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string
};

export default AddonTypeSelect;
