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

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Collapse,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import T from "i18n-react/dist/i18n-react";
import { currencyAmountFromCents } from "../../../utils/money";
import {
  DISCOUNT_TYPES,
  ONE_HUNDRED,
  SPONSOR_FORMS_METAFIELD_CLASS
} from "../../../utils/constants";
import GlobalQuantityField from "./components/GlobalQuantityField";
import MuiFormikSelect from "../formik-inputs/mui-formik-select";
import MuiFormikPriceField from "../formik-inputs/mui-formik-pricefield";
import MuiFormikDiscountField from "../formik-inputs/mui-formik-discountfield";
import ExpandedRowContent from "./components/ExpandedRowContent";
import { isItemAvailable } from "./helpers";

const FormItemTable = ({
  data,
  currentApplicableRate,
  timeZone,
  values,
  touched,
  errors
}) => {
  const valuesStr = JSON.stringify(values);
  const [openRows, setOpenRows] = useState({});

  const extraColumns =
    data[0]?.meta_fields?.filter(
      (mf) => mf.class_field === SPONSOR_FORMS_METAFIELD_CLASS.FORM
    ) || [];

  // toggle, code, name, custom_rate, early_bird, standard, onsite, qty, total, details
  const totalColumns = 10;

  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return;
    setOpenRows((prev) => {
      const updates = {};
      data.forEach((row) => {
        const itemFields = (row.meta_fields ?? []).filter(
          (f) => f.class_field === SPONSOR_FORMS_METAFIELD_CLASS.ITEM
        );
        const expandedKeys = new Set([
          ...extraColumns.map(
            (exc) =>
              `i-${row.form_item_id}-c-${exc.class_field}-f-${exc.type_id}`
          ),
          ...itemFields.map(
            (f) => `i-${row.form_item_id}-c-${f.class_field}-f-${f.type_id}`
          ),
          `i-${row.form_item_id}-c-global-f-notes`
        ]);
        const hasVisibleError = Object.keys(errors).some(
          (key) => expandedKeys.has(key) && touched[key]
        );
        if (hasVisibleError) updates[row.form_item_id] = true;
      });
      return { ...prev, ...updates };
    });
  }, [errors, touched]);

  const toggleRow = (rowId) => {
    setOpenRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  const getDetailsIconColor = (row) => {
    const hasIncomplete = (row.meta_fields ?? [])
      .filter((mf) => mf.is_required)
      .some((mf) => {
        const val =
          values[
            `i-${row.form_item_id}-c-${mf.class_field}-f-${mf.type_id}`
          ];
        if (mf.type === "CheckBoxList") return !Array.isArray(val) || val.length === 0;
        if (mf.type === "CheckBox") return val !== true;
        return val === undefined || val === null || val === "";
      });
    if (hasIncomplete) return "error";

    const prefix = `i-${row.form_item_id}-`;
    const isTouched = Object.keys(touched ?? {}).some(
      (key) => key.startsWith(prefix) && touched[key]
    );
    return isTouched ? "success" : "warning";
  };

  const calculateQuantity = useCallback(
    (row) => {
      const qtyEXC = extraColumns.filter((exc) => exc.type === "Quantity");
      const globalQty = values[`i-${row.form_item_id}-c-global-f-quantity`];
      const itemLevelQty = qtyEXC.reduce((res, exc) => {
        const start = res > 0 ? res : 1;
        return (
          start *
          (values?.[
            `i-${row.form_item_id}-c-${exc.class_field}-f-${exc.type_id}`
          ] || 0)
        );
      }, 0);

      return qtyEXC.length > 0 ? itemLevelQty : globalQty;
    },
    [valuesStr, extraColumns]
  );

  const calculateRowTotal = (row) => {
    const qty =
      values[`i-${row.form_item_id}-c-global-f-quantity`] ||
      calculateQuantity(row);

    if (currentApplicableRate === "expired") return 0;

    const customRate = values[`i-${row.form_item_id}-c-global-f-custom_rate`];
    const rate = customRate || row.rates[currentApplicableRate];

    if (rate == null || qty == null) return 0;

    return qty * rate;
  };

  const formatRate = (rate) => {
    if (rate == null) return T.translate("general.n_a");
    return currencyAmountFromCents(rate);
  };

  const totalAmount = useMemo(() => {
    const subtotal = data.reduce((acc, row) => acc + calculateRowTotal(row), 0);
    const discount =
      values.discount_type === DISCOUNT_TYPES.AMOUNT
        ? values.discount_amount
        : subtotal * (values.discount_amount / ONE_HUNDRED / ONE_HUNDRED);

    return subtotal - Math.round(discount);
  }, [data, valuesStr, currentApplicableRate]);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#EAEDF4" }}>
            <TableCell sx={{ width: 40 }} />
            <TableCell sx={{ minWidth: 40 }}>
              {T.translate("sponsor_edit_form.code")}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {T.translate("sponsor_edit_form.description")}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {T.translate("sponsor_edit_form.custom_rate")}
            </TableCell>
            <TableCell sx={{ minWidth: 40 }}>
              {T.translate("sponsor_edit_form.early_bird_rate")}
            </TableCell>
            <TableCell sx={{ minWidth: 40 }}>
              {T.translate("sponsor_edit_form.standard_rate")}
            </TableCell>
            <TableCell sx={{ minWidth: 40 }}>
              {T.translate("sponsor_edit_form.onsite_rate")}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {T.translate("sponsor_edit_form.qty")}
            </TableCell>
            <TableCell sx={{ minWidth: 120 }}>
              {T.translate("sponsor_edit_form.total")}
            </TableCell>
            <TableCell sx={{ minWidth: 40 }} align="center">
              {T.translate("sponsor_edit_form.details")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => {
            const disabled = !isItemAvailable(row, currentApplicableRate);
            const isOpen = !!openRows[row.form_item_id];

            return (
              <React.Fragment key={`fragment-${row.form_item_id}`}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      aria-label="Toggle row details"
                      onClick={() => toggleRow(row.form_item_id)}
                    >
                      {isOpen ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <MuiFormikPriceField
                      name={`i-${row.form_item_id}-c-global-f-custom_rate`}
                      fullWidth
                      label=""
                      size="small"
                      inCents
                      inputProps={{ step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      opacity: currentApplicableRate === "early_bird" ? 1 : "38%"
                    }}
                  >
                    {formatRate(row.rates.early_bird)}
                  </TableCell>
                  <TableCell
                    sx={{
                      opacity: currentApplicableRate === "standard" ? 1 : "38%"
                    }}
                  >
                    {formatRate(row.rates.standard)}
                  </TableCell>
                  <TableCell
                    sx={{
                      opacity: currentApplicableRate === "onsite" ? 1 : "38%"
                    }}
                  >
                    {formatRate(row.rates.onsite)}
                  </TableCell>
                  <TableCell>
                    <GlobalQuantityField
                      row={row}
                      extraColumns={extraColumns}
                      value={calculateQuantity(row)}
                    />
                  </TableCell>
                  <TableCell>
                    {currencyAmountFromCents(calculateRowTotal(row))}
                  </TableCell>
                  <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                    <IconButton
                      size="small"
                      aria-label="Toggle row details"
                      onClick={() => toggleRow(row.form_item_id)}
                    >
                      <InfoOutlinedIcon color={getDetailsIconColor(row)} />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={totalColumns} sx={{ padding: 0 }}>
                    <Collapse in={isOpen} timeout="auto">
                      <ExpandedRowContent
                        row={row}
                        extraColumns={extraColumns}
                        timeZone={timeZone}
                        disabled={disabled}
                      />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
          <TableRow>
            <TableCell sx={{ fontWeight: 500 }}>
              {T.translate("sponsor_edit_form.discount")}
            </TableCell>
            {/* eslint-disable-next-line */}
            {new Array(totalColumns - 4).fill(0).map((_, i) => (
              <TableCell
                // eslint-disable-next-line
                key={`${i}-discountcell`}
              />
            ))}
            <TableCell>
              <MuiFormikSelect
                name="discount_type"
                label=""
                size="small"
                sx={{ width: 110 }}
              >
                {Object.values(DISCOUNT_TYPES).map((p) => (
                  <MenuItem key={`ddopt-${p}`} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </MuiFormikSelect>
            </TableCell>
            <TableCell>
              <MuiFormikDiscountField
                name="discount_amount"
                discountType={values.discount_type}
                label=""
                size="small"
                margin="none"
                inCents
                sx={{ width: 110 }}
              />
            </TableCell>
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 500 }}>
              {T.translate("sponsor_edit_form.total_on_caps")}
            </TableCell>
            {/* eslint-disable-next-line */}
            {new Array(totalColumns - 3).fill(0).map((_, i) => (
              <TableCell
                // eslint-disable-next-line
                key={`${i}-totalcell`}
              />
            ))}
            <TableCell sx={{ fontWeight: 500 }}>
              {currencyAmountFromCents(totalAmount)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FormItemTable;
export { getCurrentApplicableRate, isItemAvailable } from "./helpers";
export { default as GlobalQuantityField } from "./components/GlobalQuantityField";
export { default as ItemTableField } from "./components/ItemTableField";
export { default as UnderlyingAlertNote } from "./components/UnderlyingAlertNote";
export { default as ExpandedRowContent } from "./components/ExpandedRowContent";
