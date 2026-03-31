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
import { ONE_HUNDRED, DECIMAL_DIGITS } from "../../../utils/constants";

const BLOCKED_KEYS = ["e", "E", "+", "-"];

const MuiFormikPriceField = ({
  name,
  label,
  inCents = false,
  inputProps = { step: 0.01 },
  ...props
}) => {
  // eslint-disable-next-line no-unused-vars
  const [field, meta, helpers] = useField(name);
  const [cleared, setCleared] = useState(false);

  const emptyValue = meta.initialValue === null ? null : 0;

  const getDisplayValue = () => {
    if (cleared) return "";
    if (field.value == null || field.value === 0) {
      return field.value === 0 ? 0 : "";
    }
      const raw = inCents ? field.value / ONE_HUNDRED : field.value;
      const str = String(Number(raw.toFixed(DECIMAL_DIGITS)));
      const dotIdx = str.indexOf(".");
      if (dotIdx !== -1 && str.length - dotIdx - 1 === 1) return `${str}0`;
      return str;
  };

  const handleChange = (e) => {
    const newVal = e.target.value;

    if (newVal === "") {
      setCleared(true);
      helpers.setValue(emptyValue);
      return;
    }

    setCleared(false);
    const numericValue = Number(newVal);
      const newPrice = inCents
          ? Math.round(numericValue * ONE_HUNDRED)
          : numericValue;

    helpers.setValue(newPrice);
  };

  const handleKeyDown = (e) => {
    if (BLOCKED_KEYS.includes(e.key)) {
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
          startAdornment: <InputAdornment position="start">$</InputAdornment>
        }
      }}
      inputProps={{
        min: 0,
        inputMode: "decimal",
        ...inputProps
      }}
      onKeyDown={handleKeyDown}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

MuiFormikPriceField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};

export default MuiFormikPriceField;
