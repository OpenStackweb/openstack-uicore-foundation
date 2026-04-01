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
import ConfirmDialog from "../confirm-dialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    title: "Confirm Action",
    text: "Are you sure?",
    onConfirm: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders title and text when open", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  test("renders default confirm and cancel buttons", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("calls onConfirm when confirm button is clicked", async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByText("Confirm"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test("calls onCancel when cancel button is clicked", async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test("renders custom button text", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmButtonText="Yes, delete"
        cancelButtonText="No, keep"
      />
    );
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    expect(screen.getByText("No, keep")).toBeInTheDocument();
  });

  test("does not render content when open is false", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });

  test("renders warning icon when iconType is warning", () => {
    render(<ConfirmDialog {...defaultProps} iconType="warning" />);
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  test("renders error icon when iconType is error", () => {
    render(<ConfirmDialog {...defaultProps} iconType="error" />);
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });
});
