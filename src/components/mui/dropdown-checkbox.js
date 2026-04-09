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

import React from "react";
import {
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select
} from "@mui/material";

const DropdownCheckbox = ({
  name,
  label,
  allLabel,
  value = [],
  options,
  onChange,
  ...rest
}) => {
  const handleChange = (ev) => {
    const rawValue = ev.target.value;
    const selected = Array.isArray(rawValue)
      ? rawValue
      : typeof rawValue === "string"
      ? rawValue.split(",")
      : [];

    if (selected.includes("all")) {
      if (!value.includes("all")) {
        // if all changed from unselected to selected we remove the rest of selections
        onChange({ target: { name, value: ["all"] } });
      } else if (selected.length > 1) {
        // if all was selected and now select an item, we remove "all" from selections
        onChange({
          target: { name, value: selected.filter((v) => v !== "all") }
        });
      } else {
        onChange({ target: { name, value: ["all"] } });
      }
    } else {
      // else if "all" is not selected we just send selection
      onChange({ target: { name, value: selected } });
    }
  };

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id={`${name}_label`}>{label}</InputLabel>
      <Select
        labelId={`${name}_label`}
        name={name}
        multiple
        value={value}
        onChange={handleChange}
        {...rest}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => {
          if (selected.includes("all")) {
            return allLabel; // Display allLabel when all options are selected
          }
          const selectedNames = options
            .filter(({ id }) => selected.includes(id))
            .map(({ name: opName }) => opName);
          return selectedNames.join(", ");
        }}
      >
        <MenuItem key="all" value="all">
          <Checkbox checked={value.includes("all")} />
          <ListItemText primary={allLabel} />
        </MenuItem>
        <Divider />
        {options.map(({ name: opName, id }) => (
          <MenuItem key={id} value={id}>
            <Checkbox checked={value.includes(id)} />
            <ListItemText primary={opName} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DropdownCheckbox;
