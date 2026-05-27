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
import { useField } from "formik";
import MuiFormikTextField from "./mui-formik-textfield";

const BLOCKED_KEYS = ["e", "E", "+", "-"];

const MuiFormikQuantityField = ({ name, min, max, ...props }) => {
  const [, , helpers] = useField(name);

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    const effectiveMin = min ?? 0;
    // React intentionally skips syncing controlled number inputs during typing
    // to avoid cursor/composition issues. Setting e.target.value directly
    // forces the DOM to normalize the displayed value (e.g. strip leading zeros,
    // clamp to max) before React's reconciliation runs.
    if (isNaN(val)) { e.target.value = effectiveMin; helpers.setValue(effectiveMin); return; }
    const clamped = max != null ? Math.min(Math.max(val, effectiveMin), max) : Math.max(val, effectiveMin);
    e.target.value = clamped;
    helpers.setValue(clamped);
  };

  return (
    <MuiFormikTextField
      name={name}
      type="number"
      onKeyDown={(e) => {
        if (BLOCKED_KEYS.includes(e.key)) {
          e.nativeEvent.preventDefault();
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
      onChange={handleChange}
      slotProps={{
        htmlInput: {
          min: min ?? 0,
          ...(max != null ? { max } : {})
        }
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

MuiFormikQuantityField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};

export default MuiFormikQuantityField;
