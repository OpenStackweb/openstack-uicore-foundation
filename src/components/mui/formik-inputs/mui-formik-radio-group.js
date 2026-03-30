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
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import { useField } from "formik";

const MuiFormikRadioGroup = ({
  name,
  label,
  marginWrapper = "normal",
  options,
  ...props
}) => {
  const [field, meta] = useField({ name });

  return (
    <FormControl
      fullWidth
      margin={marginWrapper}
      error={meta.touched && Boolean(meta.error)}
    >
      {label && <FormLabel id="radio-group-label">{label}</FormLabel>}
      <RadioGroup
        aria-labelledby="radio-group-label"
        defaultValue={field.value}
        name={name}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...field}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      >
        {options.map((op) => (
          <FormControlLabel
            key={`radio-box-${op.value}`}
            value={op.value}
            control={
              <Radio
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 24
                  }
                }}
              />
            }
            label={op.label}
          />
        ))}
      </RadioGroup>
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
};

MuiFormikRadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  marginWrapper: PropTypes.string,
  options: PropTypes.array.isRequired
};

export default MuiFormikRadioGroup;
