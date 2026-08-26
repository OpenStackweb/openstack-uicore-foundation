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
import { FormikProvider, useFormik } from "formik";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CustomDialog from "../../CustomDialog";
import MuiFormikQuantityField from "../../formik-inputs/mui-formik-quantity-field";
import MuiFormikTextField from "../../formik-inputs/mui-formik-textfield";

const ChangeQuantityModal = ({
  open,
  onClose,
  item,
  onCancelForm,
  onUndoCancelForm
}) => {
  const originalQuantity = item.quantity;
  const currentQuantity = originalQuantity - (item.canceled_quantity ?? 0);

  const formik = useFormik({
    initialValues: {
      quantity: currentQuantity,
      reason: ""
    },
    onSubmit: ({ quantity, reason }) => {
      if (quantity < currentQuantity) {
        return onCancelForm(item, currentQuantity - quantity, reason).then(onClose);
      }
      // can only call undo if quantity restored to original
      if (quantity === originalQuantity) {
        return onUndoCancelForm(item).then(onClose);
      }
      onClose();
    },
    enableReinitialize: true
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleReset = () => {
    formik.setFieldValue("quantity", originalQuantity);
    formik.setFieldValue("reason", "");
  };

  const canReset = originalQuantity !== currentQuantity;
  const hasChanged = formik.values.quantity !== currentQuantity;
  const isRestoring = formik.values.quantity === originalQuantity;
  // between currentQuantity and originalQuantity there is no valid action
  const isInGap = !isRestoring && formik.values.quantity > currentQuantity;

  return (
    <CustomDialog
      title={T.translate("sponsor_order_grid.change_quantity_modal.title")}
      open={open}
      onClose={handleClose}
      primaryAction={{
        label: T.translate("general.apply"),
        onClick: formik.submitForm,
        disabled: !hasChanged || isInGap
      }}
      secondaryAction={{
        label: T.translate("general.cancel"),
        onClick: handleClose
      }}
    >
      <FormikProvider value={formik}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <MuiFormikQuantityField
                name="quantity"
                fullWidth
                size="small"
                margin="none"
                // if fully canceled you can only reset to original quantity
                disabled={currentQuantity === 0}
                min={0}
                max={currentQuantity}
                label={T.translate("sponsor_order_grid.change_quantity_modal.quantity")}
                sx={{ flex: 1 }}
              />
            </Box>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={!canReset}
              size="small"
              sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {T.translate("sponsor_order_grid.change_quantity_modal.reset")}
            </Button>
          </Box>
          <MuiFormikTextField
            name="reason"
            fullWidth
            multiline
            minRows={3}
            disabled={isRestoring}
            label={T.translate("sponsor_order_grid.change_quantity_modal.reason")}
          />
        </Box>
      </FormikProvider>
    </CustomDialog>
  );
};

export default ChangeQuantityModal;
