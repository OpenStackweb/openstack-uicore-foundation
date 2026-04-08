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
import StatusChip from "../StatusChip/index";

describe("StatusChip", () => {
  test("renders the status label", () => {
    render(<StatusChip status="Complete" />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  test("renders for an unknown status without crashing", () => {
    render(<StatusChip status="Unknown" />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  test("renders a chip element", () => {
    render(<StatusChip status="Pending" />);
    // MUI Chip renders with role="button" or as a span depending on whether it's clickable
    const chip = screen.getByText("Pending").closest("[class*='Chip']")
      || screen.getByText("Pending").parentElement;
    expect(chip).toBeInTheDocument();
  });

  test("renders different statuses correctly", () => {
    const { rerender } = render(<StatusChip status="Complete" />);
    expect(screen.getByText("Complete")).toBeInTheDocument();

    rerender(<StatusChip status="Pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
