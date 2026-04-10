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
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AlertButton from "../AlertButton/index";

describe("AlertButton", () => {
  test("renders the label", () => {
    render(<AlertButton label="Send Alert" onClick={jest.fn()} />);
    expect(screen.getByText("Send Alert")).toBeInTheDocument();
  });

  test("calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<AlertButton label="Send Alert" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("renders a button element", () => {
    render(<AlertButton label="Test" onClick={jest.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
