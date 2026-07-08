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

import { useState } from "react";

const useRowSelection = (idKey = "id") => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [editEnabled, setEditEnabled] = useState(false);

  const isSelected = (rowId) => selectedRows.some((row) => row[idKey] === rowId);

  const toggleRow = (row) => {
    setSelectedRows((current) =>
      current.some((r) => r[idKey] === row[idKey])
        ? current.filter((r) => r[idKey] !== row[idKey])
        : [...current, row]
    );
  };

  const isAllSelected = (rows) =>
    rows.length > 0 && rows.every((row) => isSelected(row[idKey]));

  const toggleAll = (rows) => {
    setSelectedRows((current) =>
      rows.length > 0 && rows.every((row) => current.some((r) => r[idKey] === row[idKey]))
        ? []
        : rows
    );
  };

  const editField = (rowId, key, value) => {
    setSelectedRows((current) =>
      current.map((row) => (row[idKey] === rowId ? { ...row, [key]: value } : row))
    );
  };

  const reset = () => {
    setSelectedRows([]);
    setEditEnabled(false);
  };

  return {
    selectedRows,
    isSelected,
    toggleRow,
    isAllSelected,
    toggleAll,
    editField,
    editEnabled,
    enterEditMode: () => setEditEnabled(true),
    cancel: reset,
    reset
  };
};

export default useRowSelection;
