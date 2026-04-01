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
import PropTypes from "prop-types";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel
} from "@mui/material";
import { useField } from "formik";
import { INT_BASE } from "../../../utils/constants";

const MuiFormikCheckboxGroup = ({ name, label, options, ...props }) => {
  const [field, meta, helpers] = useField({ name });

  // Ensure field.value is an array
  const values = Array.isArray(field.value) ? field.value : [];

  const handleChange = (ev) => {
    const { value, checked } = ev.target;

    if (checked) {
      // Add the value to the array if it's checked
      helpers.setValue([...values, parseInt(value, INT_BASE)]);
    } else {
      // Remove the value from the array if it's unchecked
      helpers.setValue(
        values.filter((val) => val !== parseInt(value, INT_BASE))
      );
    }
  };

  return (
    <FormControl
      fullWidth
      margin="normal"
      error={meta.touched && Boolean(meta.error)}
    >
      {label && <FormLabel id="checkbox-group-label">{label}</FormLabel>}
      <FormGroup
        aria-labelledby="checkbox-group-label"
        row
        name={name}
        {...props}
      >
        {options.map((op) => (
          <FormControlLabel
            key={`chk-box-${op.value}`}
            control={
              <Checkbox
                checked={values.includes(op.value)}
                onChange={handleChange}
                value={op.value}
                sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
              />
            }
            label={op.label}
          />
        ))}
      </FormGroup>
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
};

MuiFormikCheckboxGroup.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.array.isRequired
};

export default MuiFormikCheckboxGroup;
