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

import ReactDOM from "react-dom";
import React from "react";
import ConfirmDialog from "./confirm-dialog";

// Lazy-loaded createRoot for React 18+.
// Cached after first call so the dynamic import only runs once.
let createRootFn = undefined; // undefined = not yet checked

async function getCreateRoot() {
  if (createRootFn !== undefined) return createRootFn;
  try {
    // webpackIgnore prevents webpack from resolving this at build time,
    // so consuming projects on React 16/17 won't get a "Module not found" error.
    const mod = await import(/* webpackIgnore: true */ "react-dom/client");
    createRootFn = mod.createRoot || null;
  } catch (_) {
    createRootFn = null;
  }
  return createRootFn;
}

const showConfirmDialog = ({
  title,
  text,
  iconType = "",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  confirmButtonColor = "primary",
  cancelButtonColor = "primary"
}) =>
  new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    let root = null;

    const close = (answer) => {
      if (root) {
        root.unmount();
      } else {
        ReactDOM.unmountComponentAtNode(container);
      }
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

    getCreateRoot().then((createRoot) => {
      if (createRoot) {
        root = createRoot(container);
        root.render(element);
      } else {
        ReactDOM.render(element, container);
      }
    });
  });

export default showConfirmDialog;
