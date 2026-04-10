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

/**
 * REACT 19 USAGE:
 *
 * For React 19 projects (where ReactDOM.render() was removed), wrap your app with the provider:
 *
 * import { ConfirmDialogProvider } from 'openstack-uicore-foundation';
 *
 * function App() {
 *   return (
 *     <ConfirmDialogProvider>
 *       <YourApp />
 *     </ConfirmDialogProvider>
 *   );
 * }
 *
 * Then use showConfirmDialog() anywhere in your app:
 *
 * import { MuiShowConfirmDialog } from 'openstack-uicore-foundation';
 *
 * const confirmed = await MuiShowConfirmDialog({
 *   title: 'Delete Item?',
 *   text: 'This cannot be undone'
 * });
 *
 * The provider renders dialogs inside the React tree using hooks (no createRoot or ReactDOM.render needed).
 *
 * WITHOUT PROVIDER (React 16/17/18 fallback):
 * Falls back to ReactDOM.render() - works on React 16/17/18, logs warning suggesting provider migration.
 * Not compatible with React 19 - provider is required.
 */

import ReactDOM from "react-dom";
import React from "react";
import ConfirmDialog from "./confirm-dialog";

// Bridge pattern: module-level variable to hold the provider's callback
let bridgeFn = null;

/**
 * Register the bridge callback (called by ConfirmDialogProvider on mount)
 * @private - exported for testing only
 */
export function _registerBridge(callback) {
  bridgeFn = callback;
}

/**
 * Unregister the bridge callback (called by ConfirmDialogProvider on unmount)
 * @private - exported for testing only
 */
export function _unregisterBridge() {
  bridgeFn = null;
}

/**
 * @param param0
 * @param param0.title
 * @param param0.text
 * @param param0.iconType
 * @param param0.confirmButtonText
 * @param param0.cancelButtonText
 * @param param0.confirmButtonColor
 * @param param0.cancelButtonColor
 * @returns {*|Promise<unknown>}
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
  const options = {
    title,
    text,
    iconType,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor
  };

  // If bridge is registered (provider is mounted), use it
  if (bridgeFn) {
    return bridgeFn(options);
  }

  // Fallback to ReactDOM.render for backward compatibility
  // This path is used when consuming apps haven't migrated to ConfirmDialogProvider yet
  console.warn(
    "[openstack-uicore-foundation] showConfirmDialog: ConfirmDialogProvider is not mounted. " +
      "For better React 16/17/18/19 compatibility, wrap your app with <ConfirmDialogProvider>. " +
      "Falling back to ReactDOM.render."
  );

  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const close = (answer) => {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
      resolve(answer);
    };

    const handleConfirm = () => close(true);
    const handleCancel = () => close(false);

    const element = (
      <ConfirmDialog
        open
        title={title}
        text={text}
        iconType={iconType}
        confirmButtonText={confirmButtonText}
        cancelButtonText={cancelButtonText}
        confirmButtonColor={confirmButtonColor}
        cancelButtonColor={cancelButtonColor}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    ReactDOM.render(element, container);
  });
};

export default showConfirmDialog;
