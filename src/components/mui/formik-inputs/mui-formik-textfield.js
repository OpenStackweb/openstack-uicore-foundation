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
import { Box, TextField, Typography } from "@mui/material";
import { useField } from "formik";

const MuiFormikTextField = ({
  name,
  label,
  maxLength,
  required = false,
  ...props
}) => {
  const [field, meta] = useField(name);
  const currentLength = field.value?.length || 0;

  let finalLabel = "";

  if (label) {
    finalLabel = required ? `${label} *` : label;
  }

  return (
    <Box>
      <TextField
        name={name}
        label={finalLabel}
        {...field}
        onBlur={field.onBlur}
        margin="normal"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        slotProps={{
          htmlInput: {
            maxLength
          }
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
      {maxLength && (
        <Typography sx={{ fontSize: "1.2rem", color: "#00000099", pl: 2 }}>
          {`${maxLength - currentLength} characters left`}
        </Typography>
      )}
    </Box>
  );
};

MuiFormikTextField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  maxLength: PropTypes.number,
  required: PropTypes.bool
};

export default MuiFormikTextField;
