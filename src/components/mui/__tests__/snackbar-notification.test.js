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

jest.mock("react-redux", () => ({
  connect: () => (Component) => Component
}));

jest.mock("../../../utils/actions", () => ({
  clearSnackbarMessage: jest.fn()
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SnackbarNotification from "../SnackbarNotification/index";

describe("SnackbarNotification", () => {
  test("renders children", () => {
    render(
      <SnackbarNotification clearSnackbarMessage={jest.fn()}>
        <div>Child content</div>
      </SnackbarNotification>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  test("shows snackbar when snackbarMessage has html content", () => {
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Operation successful!", type: "success" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    expect(screen.getByText("Operation successful!")).toBeInTheDocument();
  });

  test("shows error snackbar when type is warning", () => {
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Something went wrong", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  test("does not show snackbar when snackbarMessage is null", () => {
    render(
      <SnackbarNotification
        snackbarMessage={null}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    // The snackbar should not be open
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("copies an error as plain text with its details", async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <SnackbarNotification
        snackbarMessage={{
          html: "Start date is required.<br>End date is invalid.<br>",
          type: "warning",
          details: "Request: PUT /api/v1/summits/1 (412)"
        }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    fireEvent.click(screen.getByLabelText("general.copy_error"));

    expect(writeText).toHaveBeenCalledWith(
      "Start date is required.\nEnd date is invalid.\n\nRequest: PUT /api/v1/summits/1 (412)"
    );
    // let the copied state settle inside the test
    await screen.findByTestId("CheckIcon");
  });

  test("shows the check mark only after the clipboard accepts the text", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Not found", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    fireEvent.click(screen.getByLabelText("general.copy_error"));

    expect(await screen.findByTestId("CheckIcon")).toBeInTheDocument();
  });

  test("says the copy failed when the clipboard rejects it", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("blocked")) } });
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Not found", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    const button = screen.getByLabelText("general.copy_error");
    fireEvent.click(button);
    fireEvent.mouseOver(button);

    expect(await screen.findByText("general.copy_failed")).toBeInTheDocument();
    expect(screen.queryByTestId("CheckIcon")).not.toBeInTheDocument();
  });

  test("clears the copied state when a new message with the same text shows", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
    const { rerender } = render(
      <SnackbarNotification
        snackbarMessage={{ html: "Not found", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    fireEvent.click(screen.getByLabelText("general.copy_error"));
    await screen.findByTestId("CheckIcon");

    rerender(
      <SnackbarNotification
        snackbarMessage={{ html: "Not found", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    expect(screen.getByLabelText("general.copy_error")).toBeInTheDocument();
    expect(screen.queryByTestId("CheckIcon")).not.toBeInTheDocument();
  });

  test("keeps only the close button on a success message", () => {
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Saved", type: "success" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    expect(screen.queryByLabelText("general.copy_error")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });
});
