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
  Select,
  FormHelperText,
  FormControl,
  InputAdornment,
  IconButton,
  InputLabel
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useField } from "formik";

const MuiFormikSelect = ({
  name,
  label,
  placeholder,
  children,
  isClearable,
  ...rest
}) => {
  const [field, meta, helpers] = useField(name);

  const handleClear = (ev) => {
    ev.stopPropagation();
    helpers.setValue("");
  };

  const hasValue = field?.value && field.value !== "";
  const shouldShrink = hasValue || Boolean(placeholder);

  return (
    <FormControl fullWidth error={meta.touched && Boolean(meta.error)}>
      {label && (
        <InputLabel htmlFor={name} id={`${name}-label`} shrink={shouldShrink}>
          {label}
        </InputLabel>
      )}
      <Select
        name={name}
        id={name}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...field}
        labelId={`${name}-label`}
        label={label}
        notched={shouldShrink}
        displayEmpty
        renderValue={(selected) => {
          if (!selected || selected === "") {
            return <span style={{ color: "#aaa" }}>{placeholder}</span>;
          }
          return selected;
        }}
        endAdornment={
          isClearable && field.value ? (
            <InputAdornment position="end" sx={{ mr: 2 }}>
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      >
        {children}
      </Select>
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
};

MuiFormikSelect.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  placeholder: PropTypes.string,
  isClearable: PropTypes.bool
};

export default MuiFormikSelect;
