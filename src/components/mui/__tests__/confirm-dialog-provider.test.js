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
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ConfirmDialogProvider from "../ConfirmDialogProvider";
import showConfirmDialog from "../showConfirmDialog";

describe("ConfirmDialogProvider", () => {
  test("renders children", () => {
    render(
      <ConfirmDialogProvider>
        <div>Test Content</div>
      </ConfirmDialogProvider>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("shows dialog when showConfirmDialog is called", async () => {
    render(
      <ConfirmDialogProvider>
        <div>App Content</div>
      </ConfirmDialogProvider>
    );

    // Call showConfirmDialog wrapped in act
    let promise;
    await act(async () => {
      promise = showConfirmDialog({
        title: "Confirm Action",
        text: "Are you sure?"
      });
    });

    // Dialog should appear
    await waitFor(() => {
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    // Promise should not resolve yet
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });
    await new Promise((r) => setTimeout(r, 10));
    expect(resolved).toBe(false);
  });

  test("resolves true when confirm button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialogProvider>
        <div>App Content</div>
      </ConfirmDialogProvider>
    );

    let promise;
    await act(async () => {
      promise = showConfirmDialog({
        title: "Delete Item",
        text: "This cannot be undone",
        confirmButtonText: "Delete"
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Delete Item")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    const result = await promise;
    expect(result).toBe(true);

    // Dialog should be hidden after confirm
    await waitFor(() => {
      expect(screen.queryByText("Delete Item")).not.toBeInTheDocument();
    });
  });

  test("resolves false when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialogProvider>
        <div>App Content</div>
      </ConfirmDialogProvider>
    );

    let promise;
    await act(async () => {
      promise = showConfirmDialog({
        title: "Cancel Operation",
        text: "Do you want to cancel?",
        cancelButtonText: "No"
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Cancel Operation")).toBeInTheDocument();
    });

    const noButton = screen.getByRole("button", { name: "No" });
    await user.click(noButton);

    const result = await promise;
    expect(result).toBe(false);

    // Dialog should be hidden after cancel
    await waitFor(() => {
      expect(screen.queryByText("Cancel Operation")).not.toBeInTheDocument();
    });
  });

  test("handles multiple sequential dialogs", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialogProvider>
        <div>App Content</div>
      </ConfirmDialogProvider>
    );

    // First dialog
    let promise1;
    await act(async () => {
      promise1 = showConfirmDialog({
        title: "First Dialog",
        text: "First message"
      });
    });

    await waitFor(() => {
      expect(screen.getByText("First Dialog")).toBeInTheDocument();
    });

    const confirmButton1 = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton1);

    const result1 = await promise1;
    expect(result1).toBe(true);

    // Second dialog
    let promise2;
    await act(async () => {
      promise2 = showConfirmDialog({
        title: "Second Dialog",
        text: "Second message"
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Second Dialog")).toBeInTheDocument();
    });

    const cancelButton2 = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton2);

    const result2 = await promise2;
    expect(result2).toBe(false);
  });

  test("passes custom button colors and text", async () => {
    render(
      <ConfirmDialogProvider>
        <div>App Content</div>
      </ConfirmDialogProvider>
    );

    await act(async () => {
      showConfirmDialog({
        title: "Custom Dialog",
        text: "Custom buttons",
        confirmButtonText: "Yes, Do It",
        cancelButtonText: "No, Stop",
        confirmButtonColor: "error",
        cancelButtonColor: "secondary"
      });
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Yes, Do It" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "No, Stop" })).toBeInTheDocument();
    });
  });
});
