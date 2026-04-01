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

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

jest.mock("../FormItemTable/components/ItemTableField", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ field }) => (
      <div data-testid={`item-field-${field.type_id}`}>{field.name}</div>
    )
  };
});

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ItemSettingsModal from "../ItemSettingsModal/index";

const item = {
  form_item_id: 1,
  name: "My Item",
  meta_fields: [
    { name: "Field A", class_field: "Item", type_id: 10, type: "Text" },
    { name: "Field B", class_field: "Item", type_id: 11, type: "CheckBox" },
    { name: "Global Field", class_field: "Global", type_id: 12, type: "Text" }
  ]
};

const renderModal = (props) =>
  render(
    <ItemSettingsModal
      item={item}
      open={true}
      onClose={jest.fn()}
      {...props}
    />
  );

describe("ItemSettingsModal", () => {
  test("renders settings title when open", () => {
    renderModal({});
    expect(screen.getByText("general.settings")).toBeInTheDocument();
  });

  test("renders item name", () => {
    renderModal({});
    expect(screen.getByText("My Item")).toBeInTheDocument();
  });

  test("renders only Item class_field meta_fields", () => {
    renderModal({});
    expect(screen.getByTestId("item-field-10")).toBeInTheDocument();
    expect(screen.getByTestId("item-field-11")).toBeInTheDocument();
    // Global field should NOT be rendered
    expect(screen.queryByTestId("item-field-12")).not.toBeInTheDocument();
  });

  test("renders field names", () => {
    renderModal({});
    expect(screen.getByText("Field A")).toBeInTheDocument();
    expect(screen.getByText("Field B")).toBeInTheDocument();
  });

  test("calls onClose when close icon is clicked", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onClose when save button is clicked", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByText("general.save"));
    expect(onClose).toHaveBeenCalled();
  });

  test("does not render dialog when open is false", () => {
    renderModal({ open: false });
    expect(screen.queryByText("general.settings")).not.toBeInTheDocument();
  });
});
