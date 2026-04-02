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
import { useFormikContext, getIn } from "formik";
import T from "i18n-react";
import AdditionalInput from "./additional-input";
import showConfirmDialog from "../../showConfirmDialog";
import { METAFIELD_TYPES_WITH_OPTIONS } from "../../../../utils/constants";

const DEFAULT_META_FIELD = {
  name: "",
  type: "",
  is_required: false,
  minimum_quantity: 0,
  maximum_quantity: 0,
  values: []
};

const AdditionalInputList = ({ name, onDelete, onDeleteValue, entityId }) => {
  const { values, setFieldValue, errors, setFieldTouched } = useFormikContext();

  const metaFields = values[name] || [];

  useEffect(() => {
    if (metaFields.length === 0) {
      setFieldValue(name, [
        { ...DEFAULT_META_FIELD, _key: `draft_${Date.now()}` }
      ]);
    }
  }, [metaFields.length]);

  const handleAddItem = () => {
    setFieldValue(name, [
      ...metaFields,
      { ...DEFAULT_META_FIELD, _key: `draft_${Date.now()}` }
    ]);
  };

  const handleRemove = async (item, index) => {
    const isConfirmed = await showConfirmDialog({
      title: T.translate("general.are_you_sure"),
      text: `${T.translate("additional_inputs.delete_warning")} ${
        item.name
      }`,
      type: "warning",
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    });

    if (!isConfirmed) return;

    const removeFromUI = () => {
      const newValues = metaFields.filter((_, idx) => idx !== index);
      if (newValues.length === 0) {
        newValues.push({ ...DEFAULT_META_FIELD, _key: `draft_${Date.now()}` });
      }
      setFieldValue(name, newValues);
    };
    setFieldTouched(name, [], false);

    if (item.id && onDelete) {
      onDelete(entityId, item.id)
        .then(() => removeFromUI())
        .catch((err) => console.error("Error deleting field from API", err));
    } else {
      removeFromUI();
    }
  };

  const areMetafieldsIncomplete = () => {
    const fieldErrors = getIn(errors, name);
    if (fieldErrors && Array.isArray(fieldErrors)) {
      const hasRealErrors = fieldErrors.some(
        (err) => err && Object.keys(err).length > 0
      );
      if (hasRealErrors) return true;
    }

    return metaFields.some((field) => {
      if (!field.name?.trim() || !field.type) return true;
      if (METAFIELD_TYPES_WITH_OPTIONS.includes(field.type)) {
        if (!field.values || field.values.length === 0) return true;
        const hasIncompleteValues = field.values.some(
          (v) => !v.name?.trim() || !v.value?.trim()
        );
        if (hasIncompleteValues) return true;
      }

      return false;
    });
  };

  return (
    <>
      {metaFields.map((item, itemIdx) => (
        <AdditionalInput
          key={item.id || item._key}
          item={item}
          itemIdx={itemIdx}
          baseName={name}
          onAdd={handleAddItem}
          onDelete={handleRemove}
          onDeleteValue={onDeleteValue}
          entityId={entityId}
          isAddDisabled={areMetafieldsIncomplete()}
        />
      ))}
    </>
  );
};

export default AdditionalInputList;
