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
import { BYTES_PER_MB } from "../../../utils/constants";

const BLOCKED_KEYS = ["e", "E", "+", "-", ".", ","];

const bytesToMb = (bytes) => Math.floor(bytes / BYTES_PER_MB);

const MuiFormikFilesizeField = ({ name, label, ...props }) => {
  const [field, meta, helpers] = useField(name);
  const [cleared, setCleared] = useState(false);

  const emptyValue = meta.initialValue === null ? null : 0;

  const getDisplayValue = () => {
    if (cleared) return "";
    if (field.value == null || field.value === 0) {
      return field.value === 0 ? 0 : "";
    }
    return bytesToMb(field.value);
  };

  const handleChange = (e) => {
    const mbValue = e.target.value;

    if (mbValue === "") {
      setCleared(true);
      helpers.setValue(emptyValue);
      return;
    }

    setCleared(false);
    const bytes = Number(mbValue) * BYTES_PER_MB;
    helpers.setValue(bytes);
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
          endAdornment: <InputAdornment position="end">MB</InputAdornment>
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
  label: PropTypes.string.isRequired
};

export default MuiFormikFilesizeField;
