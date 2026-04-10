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

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AlertModal from "../AlertModal/index";

const defaultProps = {
  title: "Alert Title",
  message: "Something happened",
  open: true,
  onClose: jest.fn()
};

beforeEach(() => jest.clearAllMocks());

describe("AlertModal", () => {
  test("renders title and message when open", () => {
    render(<AlertModal {...defaultProps} />);
    expect(screen.getByText("Alert Title")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  test("does not show content when open is false", () => {
    render(<AlertModal {...defaultProps} open={false} />);
    expect(screen.queryByText("Alert Title")).not.toBeInTheDocument();
  });

  test("calls onClose when close icon button is clicked", async () => {
    render(<AlertModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when OK button is clicked", async () => {
    render(<AlertModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /general\.ok/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
