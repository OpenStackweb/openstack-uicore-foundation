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
import T from "i18n-react/dist/i18n-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CustomDialog from "../CustomDialog";
import ItemTableField from "../FormItemTable/components/ItemTableField";

const ItemSettingsModal = ({ item, timeZone, open, onClose }) => {
  const itemFields =
    item?.meta_fields.filter((f) => f.class_field === "Item") || [];

  const handleSave = () => {
    onClose();
  };

  return (
    <CustomDialog title={T.translate("general.settings")} open={open} onClose={onClose}>
      <DialogContent>
        <Typography
          variant="body2"
          component="div"
          sx={{ marginBottom: "20px" }}
        >
          {item?.name}
        </Typography>
        <Divider
          sx={{
            marginBottom: "20px",
            marginLeft: "-24px",
            marginRight: "-24px"
          }}
        />
        {itemFields.map((exc) => (
          <Box key={`item-field-${exc.type_id}`} sx={{ mb: 2 }}>
            <ItemTableField
              field={exc}
              rowId={item.form_item_id}
              timeZone={timeZone}
              label={exc.name}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} variant="contained" fullWidth>
          {T.translate("general.save")}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

ItemSettingsModal.propTypes = {
  item: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ItemSettingsModal;
