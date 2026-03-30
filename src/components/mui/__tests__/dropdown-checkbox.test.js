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
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DropdownCheckbox from "../dropdown-checkbox";

describe("DropdownCheckbox", () => {
  const options = [
    { id: 1, name: "Option A" },
    { id: 2, name: "Option B" }
  ];

  const defaultProps = {
    name: "test",
    label: "Test Label",
    allLabel: "All Options",
    value: [],
    options,
    onChange: jest.fn()
  };

  test("renders with label", () => {
    render(<DropdownCheckbox {...defaultProps} />);
    expect(screen.getByText("Test Label", { selector: "label" })).toBeInTheDocument();
  });

  test("renders without crashing when value is empty", () => {
    const { container } = render(<DropdownCheckbox {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test("renders allLabel when value contains 'all'", () => {
    render(<DropdownCheckbox {...defaultProps} value={["all"]} />);
    expect(screen.getByText("All Options")).toBeInTheDocument();
  });

  test("renders combobox role", () => {
    render(<DropdownCheckbox {...defaultProps} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
