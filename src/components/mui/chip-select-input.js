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

import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select
} from "@mui/material";
import { ClearIcon } from "@mui/x-date-pickers";

const ChipSelectInput = ({
  availableOptions = [],
  canAdd = false,
  canEdit = false,
  inputLabel = "",
  currentSettings = null,
  onGetSettingsMeta,
  onGetSettings,
  onUpsertSettings,
  renderSelectedOptions,
  denormalizeSettings
}) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  // get current selected options
  useEffect(() => {
    if (onGetSettings) {
      onGetSettings();
    }
  }, [onGetSettings]);

  useEffect(() => {
    if (currentSettings) {
      if (onGetSettingsMeta) {
        onGetSettingsMeta();
      }

      if (currentSettings && renderSelectedOptions && denormalizeSettings) {
        const selectedColumnsTmp = renderSelectedOptions(
          denormalizeSettings(currentSettings.columns)
        ).map((c) => c.value);
        setSelectedColumns(selectedColumnsTmp);
      }
    }
  }, [currentSettings]);

  const submitNewColumns = (newValue) => {
    setSelectedColumns(newValue);
    onUpsertSettings(newValue);
    setIsDirty(false);
  };

  const handleColumnChange = (value) => {
    setSelectedColumns(value);
    setIsDirty(true);
  };

  const handleRemoveItem = (value) => {
    const newValues = selectedColumns.filter((c) => c !== value);
    setSelectedColumns(newValues);
    onUpsertSettings(newValues);
  };

  if (!canAdd || !canEdit || availableOptions.length === 0) {
    return null;
  }

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="multi-select-label">{inputLabel}</InputLabel>
        <Select
          labelId="multi-select-label"
          id="multi-select"
          multiple
          fullWidth
          value={selectedColumns}
          onChange={(ev) => handleColumnChange(ev.target.value)}
          onClose={() => (isDirty ? submitNewColumns(selectedColumns) : null)}
          input={<OutlinedInput label={inputLabel} />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => {
                const op = availableOptions.find((opt) => opt.value === value);
                if (!op) return null;
                return (
                  <Chip
                    key={op.value}
                    label={op.label}
                    onDelete={() => {
                      handleRemoveItem(op.value);
                    }}
                    deleteIcon={
                      <ClearIcon
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    }
                  />
                );
              })}
            </Box>
          )}
          endAdornment={
            selectedColumns.length > 0 && (
              <InputAdornment sx={{ marginRight: "10px" }} position="end">
                <IconButton
                  onClick={() => {
                    submitNewColumns([]);
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }
        >
          {availableOptions.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ChipSelectInput;
