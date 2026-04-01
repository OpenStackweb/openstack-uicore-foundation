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

    const close = (answer) => {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
      resolve(answer);
    };

    const handleConfirm = () => close(true);
    const handleCancel = () => close(false);

    ReactDOM.render(
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
      />,
      container
    );
  });

export default showConfirmDialog;
