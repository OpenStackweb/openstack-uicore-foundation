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
import T from "i18n-react/dist/i18n-react";
import { useFormikContext } from "formik";
import { Box, Button, Grid2, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DragAndDropList from "../../DragNDropList";
import showConfirmDialog from "../../showConfirmDialog";
import MuiFormikTextField from "../mui-formik-textfield";
import MuiFormikCheckbox from "../mui-formik-checkbox";

const MetaFieldValuesV2 = ({
  field,
  fieldIndex,
  baseName = "meta_fields",
  onMetaFieldTypeValueDeleted,
  entityId
}) => {
  const { values, setFieldValue } = useFormikContext();

  const metaFields = values[baseName] || [];
  const sortedValues = [...field.values].sort((a, b) => a.order - b.order);

  const buildValueFieldName = (valueIndex, fieldName) =>
    `${baseName}[${fieldIndex}].values[${valueIndex}].${fieldName}`;

  const onReorder = (newValues) => {
    const newMetaFields = metaFields.map((f, i) =>
      i === fieldIndex ? { ...f, values: newValues } : f
    );
    setFieldValue(baseName, newMetaFields);
  };

  const handleAddValue = () => {
    const newFields = metaFields.map((f, i) => {
      const nextOrder = Math.max(0, ...f.values.map((v) => v.order ?? 0)) + 1;
      return i === fieldIndex
        ? {
          ...f,
          values: [
            ...f.values,
            { value: "", name: "", is_default: false, order: nextOrder }
          ]
        }
        : f
    }
    );
    setFieldValue(baseName, newFields);
  };

  const handleDefaultChange = (valueIndex, checked) => {
    const newFields = metaFields.map((f, i) => {
      if (i !== fieldIndex) return f;
      return {
        ...f,
        values: f.values.map((v, vi) => {
          if (checked) return { ...v, is_default: vi === valueIndex };
          return vi === valueIndex ? { ...v, is_default: false } : v;
        })
      };
    });
    setFieldValue(baseName, newFields);
  };

  const isMetafieldValueIncomplete = () => {
    if (field.values.length > 0) {
      return field.values.some((v) => !v.name?.trim() || !v.value?.trim());
    }
    return false;
  };

  const handleRemoveValue = async (metaFieldValue, valueIndex) => {
    const isConfirmed = await showConfirmDialog({
      title: T.translate("general.are_you_sure"),
      text: T.translate("meta_fields.delete_value_warning"),
      iconType: "warning",
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    });

    if (!isConfirmed) return;

    const removeValueFromFields = () => {
      const newFields = metaFields.map((f, i) =>
        i === fieldIndex
          ? { ...f, values: f.values.filter((_, index) => index !== valueIndex) }
          : f
      );
      setFieldValue(baseName, newFields);
    };

    if (field.id && metaFieldValue.id && onMetaFieldTypeValueDeleted) {
      onMetaFieldTypeValueDeleted(entityId, field.id, metaFieldValue.id)
      .then(() => removeValueFromFields())
      .catch(() => {});
    } else {
      removeValueFromFields();
    }
  };

  const renderMetaFieldValue = (val, sortedIndex, { isDragging, dragHandleProps } = {}) => {
    const originalIndex = field.values.findIndex(
      (v) => (v.id && v.id === val.id) || v === val
    );
    const valueIndex = originalIndex !== -1 ? originalIndex : sortedIndex;

    return (
      <Box key={val.id || `value-${valueIndex}`}>
        <Grid2
          container
          spacing={2}
          sx={{
            alignItems: "start",
            background: isDragging ? "#ebebeb" : "inherit",
            boxShadow: isDragging
              ? "0px 5px 15px rgba(0,0,0,0.3)"
              : "none",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            transform: isDragging ? "scale(1.02)" : "none",
            py: 2
          }}
        >
          <Grid2 size={1} sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              {...dragHandleProps}
              aria-label="drag to reorder"
              sx={{ cursor: "grab" }}
            >
              <DragIndicatorIcon />
            </IconButton>
          </Grid2>
          <Grid2 size={4}>
            <MuiFormikTextField
              name={buildValueFieldName(valueIndex, "name")}
              placeholder={T.translate(
                "meta_fields.placeholders.name"
              )}
              margin="none"
              fullWidth
            />
          </Grid2>
          <Grid2 size={4}>
            <MuiFormikTextField
              name={buildValueFieldName(valueIndex, "value")}
              placeholder={T.translate(
                "meta_fields.placeholders.value"
              )}
              margin="none"
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => handleRemoveValue(val, valueIndex)}
                    aria-label="remove value"
                  >
                    <CloseIcon />
                  </IconButton>
                )
              }}
            />
          </Grid2>
          <Grid2 size={3}>
            <MuiFormikCheckbox
              name={buildValueFieldName(valueIndex, "is_default")}
              label={T.translate("meta_fields.is_default")}
              onChange={(e) =>
                handleDefaultChange(valueIndex, e.target.checked)
              }
            />
          </Grid2>
        </Grid2>
        <Divider />
      </Box>
    );
  };

  return (
    <Box>
      <DragAndDropList
        items={sortedValues}
        onReorder={onReorder}
        renderItem={renderMetaFieldValue}
        idKey="id"
        updateOrderKey="order"
      />
      <Grid2 container spacing={2} sx={{ mt: 2 }} offset={4}>
        <Button
          startIcon={<AddIcon />}
          disabled={isMetafieldValueIncomplete()}
          onClick={handleAddValue}
          variant="text"
        >
          {T.translate("meta_fields.add_value")}
        </Button>
      </Grid2>
    </Box>
  );
};

export default MetaFieldValuesV2;
