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
 *   import { GlobalConfirmDialog } from 'openstack-uicore-foundation';
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
 * USAGE:
 *   import { MuiShowConfirmDialog } from 'openstack-uicore-foundation';
 *
 *   const confirmed = await MuiShowConfirmDialog({
 *     title: 'Delete Item?',
 *     text: 'This cannot be undone'
 *   });
 */

// Module-level bridge: holds the callback registered by GlobalConfirmDialog
let bridgeFn = null;

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
  if (!bridgeFn) {
    throw new Error(
      "[openstack-uicore-foundation] showConfirmDialog: <GlobalConfirmDialog /> is not mounted. " +
        "Add <GlobalConfirmDialog /> to the root of your app."
    );
  }

  return bridgeFn({
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
    bridgeFn = (options) => {
      return new Promise((resolve) => {
        setDialogState({ ...options, open: true, onResolve: resolve });
      });
    };
    return () => { bridgeFn = null; };
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
