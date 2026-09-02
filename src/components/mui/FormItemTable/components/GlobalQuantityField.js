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

import React, { useEffect } from "react";
import { useField } from "formik";
import MuiFormikTextField from "../../formik-inputs/mui-formik-textfield";
import { hasDrivingQuantityField, itemHasStock } from "../helpers";

const GlobalQuantityField = ({
  row,
  extraColumns,
  value,
  disabled = false
}) => {
  const name = `i-${row.form_item_id}-c-global-f-quantity`;
  // eslint-disable-next-line
  const [field, meta, helpers] = useField(name);

  // using readOnly since formik won't validate disabled fields
  const isReadOnly = hasDrivingQuantityField(extraColumns);

  // A row with no remaining stock can't accept a higher quantity, but a
  // sponsor who already holds a non-zero quantity here must still be able
  // to lower it - fully disabling the field would leave them unable to
  // shed a stale quantity the backend will otherwise reject on save.
  const hasStock = itemHasStock(row);
  const sponsorLimit = row.quantity_limit_per_sponsor;

  useEffect(() => {
    helpers.setValue(value);
  }, [value]);

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    // React intentionally skips syncing controlled number inputs during typing
    // to avoid cursor/composition issues. Setting e.target.value directly
    // forces the DOM to normalize the displayed value (e.g. strip leading zeros,
    // clamp to max) before React's reconciliation runs.
    if (isNaN(val)) { e.target.value = 0; helpers.setValue(0); return; }
    let clamped = Math.max(val, 0);
    if (hasStock) {
      if (sponsorLimit) clamped = Math.min(clamped, sponsorLimit);
    } else {
      clamped = Math.min(clamped, value);
    }
    e.target.value = clamped;
    helpers.setValue(clamped);
  };

  return (
    <MuiFormikTextField
      name={name}
      fullWidth
      size="small"
      type="number"
      disabled={disabled}
      onChange={handleChange}
      slotProps={{
        htmlInput: {
          readOnly: isReadOnly,
          min: 0,
          ...(hasStock
            ? sponsorLimit
              ? { max: sponsorLimit }
              : {}
            : { max: value })
        }
      }}
      sx={
        isReadOnly
          ? {
              "& .MuiInputBase-root": {
                backgroundColor: "action.disabledBackground",
                color: "text.disabled",
                pointerEvents: "none"
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "action.disabled"
              }
            }
          : {}
      }
    />
  );
};

export default GlobalQuantityField;
