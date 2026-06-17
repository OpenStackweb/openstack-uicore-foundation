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

const BLOCKED_KEYS = ["e", "E"];

const NumberInput = ({
  id,
  value,
  label,
  placeholder,
  disabled,
  min,
  max,
  integer,
  onChange,
  ...rest
}) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange({ target: { value: null } });
      return;
    }

    const parsed = integer ? parseInt(raw, 10) : parseFloat(raw);
    // React skips forcing the DOM value of a focused number input back to the
    // controlled value when the typed string doesn't parse yet (e.g. "-" or
    // "1."), so just wait for more input instead of clobbering it.
    if (Number.isNaN(parsed)) return;

    let clamped = parsed;
    if (min != null) clamped = Math.max(clamped, min);
    if (max != null) clamped = Math.min(clamped, max);
    // only force-normalize the DOM when clamping changed the typed value;
    // otherwise leave it alone so e.g. a trailing "." isn't stripped mid-typing
    if (clamped !== parsed) e.target.value = clamped;
    onChange({ target: { value: clamped } });
  };

  const finalPlaceholder =
    placeholder || T.translate("grid_filter.placeholders.number");

  return (
    <TextField
      id={id}
      type="number"
      value={value ?? ""}
      label={label}
      placeholder={finalPlaceholder}
      disabled={disabled}
      fullWidth
      size="small"
      onChange={handleChange}
      onKeyDown={(e) => {
        if (BLOCKED_KEYS.includes(e.key)) e.preventDefault();
        if (integer && (e.key === "." || e.key === ",")) e.preventDefault();
      }}
      slotProps={{
        htmlInput: {
          ...(min != null ? { min } : {}),
          ...(max != null ? { max } : {}),
          ...(integer ? { step: 1 } : {})
        }
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  );
};

NumberInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.number,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  integer: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

NumberInput.defaultProps = {
  value: null,
  label: "",
  placeholder: "",
  disabled: false,
  min: null,
  max: null,
  integer: false
};

export default NumberInput;
