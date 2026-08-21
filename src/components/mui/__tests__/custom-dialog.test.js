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
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CustomDialog from "../CustomDialog/index";

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const defaultProps = {
  title: "Dialog Title",
  open: true,
  onClose: jest.fn()
};

const getPrimaryButton = () =>
  screen.getByRole("button", { name: "Primary" });

const getCloseButton = () => screen.getByRole("button", { name: /close/i });

beforeEach(() => jest.clearAllMocks());

describe("CustomDialog", () => {
  test("a pending onClick promise disables the primary button and the close icon, and ignores backdrop/Escape", async () => {
    const { promise, resolve } = deferred();
    const onClick = jest.fn(() => promise);

    render(
      <CustomDialog {...defaultProps} primaryAction={{ label: "Primary", onClick }}>
        content
      </CustomDialog>
    );

    await userEvent.click(getPrimaryButton());

    expect(getPrimaryButton()).toBeDisabled();
    expect(getCloseButton()).toBeDisabled();

    fireEvent.keyDown(screen.getByRole("dialog"), {
      key: "Escape",
      code: "Escape"
    });
    expect(defaultProps.onClose).not.toHaveBeenCalled();

    fireEvent.click(document.querySelector(".MuiBackdrop-root"));
    expect(defaultProps.onClose).not.toHaveBeenCalled();

    await act(async () => {
      resolve();
      await promise;
    });
  });

  test("a resolved onClick re-enables the primary button and the close icon", async () => {
    const { promise, resolve } = deferred();
    const onClick = jest.fn(() => promise);

    render(
      <CustomDialog {...defaultProps} primaryAction={{ label: "Primary", onClick }}>
        content
      </CustomDialog>
    );

    await userEvent.click(getPrimaryButton());
    expect(getPrimaryButton()).toBeDisabled();

    await act(async () => {
      resolve();
      await promise;
    });

    expect(getPrimaryButton()).toBeEnabled();
    expect(getCloseButton()).toBeEnabled();
  });

  test("a rejected onClick re-enables the primary button and the close icon", async () => {
    const { promise, reject } = deferred();
    const onClick = jest.fn(() => promise);

    render(
      <CustomDialog {...defaultProps} primaryAction={{ label: "Primary", onClick }}>
        content
      </CustomDialog>
    );

    await userEvent.click(getPrimaryButton());
    expect(getPrimaryButton()).toBeDisabled();

    await act(async () => {
      reject(new Error("save failed"));
      await promise.catch(() => {});
    });

    expect(getPrimaryButton()).toBeEnabled();
    expect(getCloseButton()).toBeEnabled();
  });

  test("a sync onClick never enters the locked state", async () => {
    const onClick = jest.fn();

    render(
      <CustomDialog {...defaultProps} primaryAction={{ label: "Primary", onClick }}>
        content
      </CustomDialog>
    );

    await userEvent.click(getPrimaryButton());

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getPrimaryButton()).toBeEnabled();
    expect(getCloseButton()).toBeEnabled();
  });

  test("renders DialogActions as a direct child of the dialog paper", () => {
    render(
      <CustomDialog
        {...defaultProps}
        primaryAction={{ label: "Primary", onClick: jest.fn() }}
      >
        content
      </CustomDialog>
    );

    const paper = document.querySelector(".MuiDialog-paper");
    const actions = document.querySelector(".MuiDialogActions-root");
    expect(actions).toBeInTheDocument();
    expect(actions.parentElement).toBe(paper);
  });
});
