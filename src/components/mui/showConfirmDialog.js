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

import React, { useState, useEffect } from "react";
import ConfirmDialog from "./confirm-dialog";

/**
 * Imperative confirm dialog API.
 *
 * SETUP (required):
 * Place <GlobalConfirmDialog /> at the root of your app:
 *
 *   import { GlobalConfirmDialog } from
 *     'openstack-uicore-foundation/lib/components/mui/show-confirm-dialog';
 *
 *   function App() {
 *     return (
 *       <>
 *         <YourApp />
 *         <GlobalConfirmDialog />
 *       </>
 *     );
 *   }
 *
 * USAGE (works from any file — the bridge is shared via globalThis):
 *   import showConfirmDialog from
 *     'openstack-uicore-foundation/lib/components/mui/show-confirm-dialog';
 *
 *   const confirmed = await showConfirmDialog({
 *     title: 'Delete Item?',
 *     text: 'This cannot be undone'
 *   });
 */

// Shared bridge reference stored on globalThis so that all webpack bundles
// (table, sortable-table, show-confirm-dialog, index, etc.) read/write the
// same callback. A module-level variable would be duplicated per bundle.
const BRIDGE_KEY = "__oif_confirm_dialog_bridge__";
const _global = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};

/**
 * @param param0
 * @param param0.title
 * @param param0.text
 * @param param0.iconType
 * @param param0.confirmButtonText
 * @param param0.cancelButtonText
 * @param param0.confirmButtonColor
 * @param param0.cancelButtonColor
 * @returns {Promise<boolean>}
 */
const showConfirmDialog = ({
  title,
  text,
  iconType = "",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  confirmButtonColor = "primary",
  cancelButtonColor = "primary"
}) => {
  if (!_global[BRIDGE_KEY]) {
    throw new Error(
      "[openstack-uicore-foundation] showConfirmDialog: <GlobalConfirmDialog /> is not mounted. " +
        "Add <GlobalConfirmDialog /> to the root of your app."
    );
  }

  return _global[BRIDGE_KEY]({
    title,
    text,
    iconType,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor
  });
};

/**
 * Global confirm dialog component. Place at the root of your app:
 *
 *   <App>
 *     ...
 *     <GlobalConfirmDialog />
 *   </App>
 *
 * Then call showConfirmDialog() anywhere.
 */
export const GlobalConfirmDialog = () => {
  const [dialogState, setDialogState] = useState(null);

  useEffect(() => {
    _global[BRIDGE_KEY] = (options) => {
      return new Promise((resolve) => {
        setDialogState({ ...options, open: true, onResolve: resolve });
      });
    };
    return () => { _global[BRIDGE_KEY] = null; };
  }, []);

  const handleConfirm = () => {
    if (dialogState?.onResolve) dialogState.onResolve(true);
    setDialogState(null);
  };

  const handleCancel = () => {
    if (dialogState?.onResolve) dialogState.onResolve(false);
    setDialogState(null);
  };

  if (!dialogState) return null;

  return (
    <ConfirmDialog
      open={dialogState.open}
      title={dialogState.title}
      text={dialogState.text}
      iconType={dialogState.iconType}
      confirmButtonText={dialogState.confirmButtonText}
      cancelButtonText={dialogState.cancelButtonText}
      confirmButtonColor={dialogState.confirmButtonColor}
      cancelButtonColor={dialogState.cancelButtonColor}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};

export default showConfirmDialog;
