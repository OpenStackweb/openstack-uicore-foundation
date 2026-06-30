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
import { Box, Grid2, TextField } from "@mui/material";
import { useField } from "formik";
import T from "i18n-react/dist/i18n-react";
import { SPONSOR_FORMS_METAFIELD_CLASS } from "../../../../utils/constants";
import ItemTableField from "./ItemTableField";

const InlineNotesField = ({ rowId, disabled }) => {
  const name = `i-${rowId}-c-global-f-notes`;
  const [field] = useField(name);
  return (
    <TextField
      {...field}
      label={T.translate("sponsor_edit_form.notes")}
      fullWidth
      size="small"
      multiline
      rows={3}
      disabled={disabled}
      slotProps={{ inputLabel: { shrink: true } }}
      margin="none"
    />
  );
};

const ExpandedRowContent = ({ row, extraColumns, timeZone, disabled }) => {
  const itemFields = (row.meta_fields ?? []).filter(
    (f) => f.class_field === SPONSOR_FORMS_METAFIELD_CLASS.ITEM
  );

  return (
    <Box sx={{ p: 2, backgroundColor: "grey.50" }}>
      <Grid2 container spacing={3}>
        {extraColumns.map((exc) => (
          <Grid2 key={`col-${exc.type_id}`} size={3}>
            <ItemTableField
              field={exc}
              rowId={row.form_item_id}
              timeZone={timeZone}
              disabled={disabled}
              label={exc.name}
            />
          </Grid2>
        ))}
        {itemFields.map((f) => (
          <Grid2 key={`item-${f.type_id}`} size={3}>
            <ItemTableField
              field={f}
              rowId={row.form_item_id}
              timeZone={timeZone}
              disabled={disabled}
              label={f.name}
            />
          </Grid2>
        ))}
        <Grid2 size={3}>
          <InlineNotesField rowId={row.form_item_id} disabled={disabled} />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default ExpandedRowContent;
