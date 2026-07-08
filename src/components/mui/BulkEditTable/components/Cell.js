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

const Cell = ({ col, row, editRow, isEditingRow, onChange }) => {
  if (isEditingRow && col.editableField === true) {
    return (
      <TextField
        id={col.columnKey}
        placeholder={col.placeholder || T.translate("placeholders.text")}
        multiline
        minRows={2}
        fullWidth
        size="small"
        onChange={onChange}
        value={editRow[col.columnKey] ?? ""}
      />
    );
  }

  if (isEditingRow && col.editableField) {
    // editableField functions may short-circuit (e.g. `cond && <Input />`) and
    // return `undefined` rather than `false`, which React rejects as a component return value.
    return (
      col.editableField({
        value:
          editRow[col.columnKey]?.id ??
          editRow[col.columnKey]?.value ??
          editRow[col.columnKey],
        onChange: (ev) => onChange({ target: { value: ev.target.value, id: col.columnKey } }),
        row: editRow,
        rowData: editRow[col.columnKey]
      }) ?? null
    );
  }

  if (col.render) {
    return col.render(row[col.columnKey], row) ?? null;
  }

  return (
    <span style={{ fontWeight: "normal" }}>{row[col.columnKey] ?? null}</span>
  );
};

Cell.propTypes = {
  col: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
  editRow: PropTypes.object.isRequired,
  isEditingRow: PropTypes.bool,
  onChange: PropTypes.func
};

export default Cell;
