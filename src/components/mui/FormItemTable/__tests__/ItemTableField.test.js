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

jest.mock("../../formik-inputs/mui-formik-checkbox", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ name }) => <div data-testid="checkbox" data-name={name} />
  };
});

jest.mock("../../formik-inputs/mui-formik-dropdown-checkbox", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ name }) => (
      <div data-testid="dropdown-checkbox" data-name={name} />
    )
  };
});

jest.mock("../../formik-inputs/mui-formik-dropdown-radio", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ name }) => (
      <div data-testid="dropdown-radio" data-name={name} />
    )
  };
});

jest.mock("../../formik-inputs/mui-formik-datepicker", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ name }) => <div data-testid="datepicker" data-name={name} />
  };
});

jest.mock("../../formik-inputs/mui-formik-timepicker", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ name }) => <div data-testid="timepicker" data-name={name} />
  };
});

jest.mock("../../formik-inputs/mui-formik-textfield", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ name, multiline }) => (
      <div
        data-testid={multiline ? "textarea" : "textfield"}
        data-name={name}
      />
    )
  };
});

jest.mock("../../formik-inputs/mui-formik-select", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ name, children }) => (
      <div data-testid="select" data-name={name}>
        {children}
      </div>
    )
  };
});

jest.mock("../../formik-inputs/mui-formik-select-v2", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ name }) => <div data-testid="select" data-name={name} />
  };
});

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ItemTableField from "../components/ItemTableField";

const rowId = 1;
const baseField = { class_field: "Item", type_id: 10, values: [] };

const renderField = (fieldOverrides = {}) =>
  render(
    <ItemTableField
      rowId={rowId}
      field={{ ...baseField, ...fieldOverrides }}
    />
  );

describe("ItemTableField", () => {
  test("renders MuiFormikCheckbox for CheckBox type", () => {
    renderField({ type: "CheckBox" });
    expect(screen.getByTestId("checkbox")).toBeInTheDocument();
  });

  test("renders MuiFormikDropdownCheckbox for CheckBoxList type", () => {
    renderField({ type: "CheckBoxList" });
    expect(screen.getByTestId("dropdown-checkbox")).toBeInTheDocument();
  });

  test("renders MuiFormikDropdownRadio for RadioButtonList type", () => {
    renderField({ type: "RadioButtonList" });
    expect(screen.getByTestId("dropdown-radio")).toBeInTheDocument();
  });

  test("renders MuiFormikDatepicker for DateTime type", () => {
    renderField({ type: "DateTime" });
    expect(screen.getByTestId("datepicker")).toBeInTheDocument();
  });

  test("renders MuiFormikTimepicker for Time type", () => {
    renderField({ type: "Time" });
    expect(screen.getByTestId("timepicker")).toBeInTheDocument();
  });

  test("renders MuiFormikTextField for Quantity type", () => {
    renderField({ type: "Quantity", minimum_quantity: 0, maximum_quantity: 0 });
    expect(screen.getByTestId("textfield")).toBeInTheDocument();
  });

  test("renders MuiFormikSelect for ComboBox type", () => {
    renderField({ type: "ComboBox" });
    expect(screen.getByTestId("select")).toBeInTheDocument();
  });

  test("renders MuiFormikTextField for Text type", () => {
    renderField({ type: "Text" });
    expect(screen.getByTestId("textfield")).toBeInTheDocument();
  });

  test("renders MuiFormikTextField multiline for TextArea type", () => {
    renderField({ type: "TextArea" });
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
  });

  test("uses correct field name based on rowId, class_field, and type_id", () => {
    renderField({ type: "Text" });
    expect(screen.getByTestId("textfield")).toHaveAttribute(
      "data-name",
      `i-${rowId}-c-Item-f-10`
    );
  });
});
