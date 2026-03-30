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
  FormHelperText
} from "@mui/material";
import { useField } from "formik";

const MuiFormikCheckbox = ({ name, label, ...props }) => {
  const [field, meta] = useField({ name, type: "checkbox" });

  return (
    <FormControl
      fullWidth
      margin="normal"
      error={meta.touched && Boolean(meta.error)}
    >
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            {...field}
            checked={field.value}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          />
        }
        label={label}
      />
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
};

MuiFormikCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

export default MuiFormikCheckbox;
