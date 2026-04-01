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
import ChipNotify from "../chip-notify";

describe("ChipNotify", () => {
  test("renders the label in uppercase", () => {
    render(<ChipNotify label="alert" />);
    expect(screen.getByText("ALERT")).toBeInTheDocument();
  });

  test("renders uppercase for mixed-case label", () => {
    render(<ChipNotify label="New Update" />);
    expect(screen.getByText("NEW UPDATE")).toBeInTheDocument();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<ChipNotify label="test" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test("renders with custom icon", () => {
    const CustomIcon = () => <svg data-testid="custom-icon" />;
    render(<ChipNotify label="test" Icon={CustomIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  test("renders with custom color", () => {
    const { container } = render(<ChipNotify label="test" color="error" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
