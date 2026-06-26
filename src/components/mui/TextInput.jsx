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
import TextField from "@mui/material/TextField";
import T from "i18n-react/dist/i18n-react";

const TextInput = ({
  id,
  value,
  label,
  placeholder,
  disabled,
  onChange,
  ...rest
}) => {
  const finalPlaceholder =
    placeholder || T.translate("placeholders.text");

  return (
    <TextField
      id={id}
      value={value ?? ""}
      label={label}
      placeholder={finalPlaceholder}
      disabled={disabled}
      fullWidth
      size="small"
      onChange={onChange}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  );
};

TextInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

TextInput.defaultProps = {
  value: null,
  label: "",
  placeholder: "",
  disabled: false
};

export default TextInput;
