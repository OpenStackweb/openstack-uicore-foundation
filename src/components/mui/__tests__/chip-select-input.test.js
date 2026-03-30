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

jest.mock("@mui/x-date-pickers", () => ({
  ClearIcon: () => {
    const React = require("react");
    return <span>X</span>;
  }
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChipSelectInput from "../chip-select-input";

describe("ChipSelectInput", () => {
  const availableOptions = [
    { value: "col1", label: "Column 1" },
    { value: "col2", label: "Column 2" }
  ];

  const baseProps = {
    onGetSettings: jest.fn(),
    onUpsertSettings: jest.fn()
  };

  test("renders null when canAdd is false", () => {
    const { container } = render(
      <ChipSelectInput
        {...baseProps}
        availableOptions={availableOptions}
        canAdd={false}
        canEdit={true}
        inputLabel="Columns"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders null when canEdit is false", () => {
    const { container } = render(
      <ChipSelectInput
        {...baseProps}
        availableOptions={availableOptions}
        canAdd={true}
        canEdit={false}
        inputLabel="Columns"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders null when availableOptions is empty", () => {
    const { container } = render(
      <ChipSelectInput
        {...baseProps}
        availableOptions={[]}
        canAdd={true}
        canEdit={true}
        inputLabel="Columns"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders select when canAdd, canEdit, and options are all present", () => {
    render(
      <ChipSelectInput
        {...baseProps}
        availableOptions={availableOptions}
        canAdd={true}
        canEdit={true}
        inputLabel="Columns"
      />
    );
    expect(screen.getByText("Columns", { selector: "label" })).toBeInTheDocument();
  });

  test("calls onGetSettings on mount", () => {
    const onGetSettings = jest.fn();
    render(
      <ChipSelectInput
        {...baseProps}
        onGetSettings={onGetSettings}
        availableOptions={availableOptions}
        canAdd={true}
        canEdit={true}
        inputLabel="Columns"
      />
    );
    expect(onGetSettings).toHaveBeenCalled();
  });
});
