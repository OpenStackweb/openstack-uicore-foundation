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
import ConfirmDeleteDialog from "../ConfirmDeleteDialog/index";

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  message: "Are you sure you want to delete this?"
};

beforeEach(() => jest.clearAllMocks());

describe("ConfirmDeleteDialog", () => {
  test("renders title and message when open", () => {
    render(<ConfirmDeleteDialog {...defaultProps} />);
    expect(screen.getByText("alerts.confirm_delete_title")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this?")).toBeInTheDocument();
  });

  test("does not render content when closed", () => {
    render(<ConfirmDeleteDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("alerts.confirm_delete_title")).not.toBeInTheDocument();
  });

  test("calls onClose when cancel button is clicked", async () => {
    render(<ConfirmDeleteDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /general\.cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when delete button is clicked", async () => {
    render(<ConfirmDeleteDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /general\.delete/i }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test("shows default message when no message prop provided", () => {
    render(<ConfirmDeleteDialog {...defaultProps} message="" />);
    expect(screen.getByText("alerts.confirm_delete")).toBeInTheDocument();
  });
});
