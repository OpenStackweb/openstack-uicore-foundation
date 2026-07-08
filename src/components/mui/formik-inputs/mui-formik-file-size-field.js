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

import React, { useState } from "react";
import PropTypes from "prop-types";
import { InputAdornment } from "@mui/material";
import { useField } from "formik";
import MuiFormikTextField from "./mui-formik-textfield";

const BLOCKED_KEYS = ["e", "E", "+", "-", ".", ","];

// bytes = value * 1024 ** UNIT_POWERS[unit]
const UNIT_POWERS = { B: 0, KB: 1, MB: 2 };

const unitToBytesFactor = (unit) => 1024 ** UNIT_POWERS[unit];

const MuiFormikFilesizeField = ({
  name,
  label,
  displayUnit,
  valueUnit,
  ...props
}) => {
  const [field, meta, helpers] = useField(name);
  const [cleared, setCleared] = useState(false);

  const emptyValue = meta.initialValue === null ? null : 0;
  // value (in valueUnit) -> displayed number (in displayUnit)
  const conversionFactor =
    unitToBytesFactor(valueUnit) / unitToBytesFactor(displayUnit);

  const getDisplayValue = () => {
    if (cleared) return "";
    if (field.value == null || field.value === 0) {
      return field.value === 0 ? 0 : "";
    }
    return Math.floor(field.value * conversionFactor);
  };

  const handleChange = (e) => {
    const displayValue = e.target.value;

    if (displayValue === "") {
      setCleared(true);
      helpers.setValue(emptyValue);
      return;
    }

    setCleared(false);
    helpers.setValue(Number(displayValue) / conversionFactor);
  };

  const handleKeyDown = (e) => {
    if (BLOCKED_KEYS.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Block "0" as first character — only 1-9 are valid leading digits.
    // When value is empty or already "0", prevent any "0" keypress.
    if (e.key === "0" && (e.target.value === "" || e.target.value === "0")) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <MuiFormikTextField
      name={name}
      label={label}
      type="number"
      value={getDisplayValue()}
      onChange={handleChange}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">{displayUnit}</InputAdornment>
          )
        },
        htmlInput: {
          min: 0,
          inputMode: "numeric",
          step: 1
        }
      }}
      onKeyDown={handleKeyDown}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

MuiFormikFilesizeField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  displayUnit: PropTypes.oneOf(Object.keys(UNIT_POWERS)),
  valueUnit: PropTypes.oneOf(Object.keys(UNIT_POWERS))
};

MuiFormikFilesizeField.defaultProps = {
  displayUnit: "MB",
  valueUnit: "B"
};

export default MuiFormikFilesizeField;
