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
import PropTypes from "prop-types";
import ConfirmDialog from "./confirm-dialog";
import { _registerBridge, _unregisterBridge } from "./showConfirmDialog";

/**
 * Provider component that manages ConfirmDialog state within the React tree.
 * This eliminates the need for react-dom/client and works with React 16/17/18/19.
 *
 * Usage:
 *   <ConfirmDialogProvider>
 *     <App />
 *   </ConfirmDialogProvider>
 *
 * Then call showConfirmDialog() anywhere in the app.
 */
const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState(null);

  useEffect(() => {
    // Register the bridge callback when the provider mounts
    const bridgeCallback = (options) => {
      return new Promise((resolve) => {
        setDialogState({
          ...options,
          open: true,
          onResolve: resolve
        });
      });
    };

    _registerBridge(bridgeCallback);

    // Unregister when the provider unmounts
    return () => {
      _unregisterBridge();
    };
  }, []);

  const handleConfirm = () => {
    if (dialogState?.onResolve) {
      dialogState.onResolve(true);
    }
    setDialogState(null);
  };

  const handleCancel = () => {
    if (dialogState?.onResolve) {
      dialogState.onResolve(false);
    }
    setDialogState(null);
  };

  return (
    <>
      {children}
      {dialogState && (
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
      )}
    </>
  );
};

ConfirmDialogProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ConfirmDialogProvider;
