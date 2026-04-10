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

jest.mock("react-dom", () => ({
  render: jest.fn(),
  unmountComponentAtNode: jest.fn()
}));

jest.mock("../confirm-dialog", () => {
  const React = require("react");
  return { __esModule: true, default: () => <div /> };
});

import showConfirmDialog, { _registerBridge, _unregisterBridge } from "../showConfirmDialog";
import ReactDOM from "react-dom";

describe("showConfirmDialog", () => {
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    _unregisterBridge(); // Clear any registered bridge
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test("regression: does not reference react-dom/client", () => {
    // This test verifies that importing showConfirmDialog does not trigger
    // any reference to react-dom/client, which would cause build errors on React 16
    const moduleCode = showConfirmDialog.toString();
    expect(moduleCode).not.toContain("react-dom/client");
  });

  describe("fallback mode (no provider)", () => {
    test("returns a Promise", () => {
      const result = showConfirmDialog({ title: "Test", text: "Body" });
      expect(result).toBeInstanceOf(Promise);
    });

    test("calls ReactDOM.render to mount the dialog", () => {
      showConfirmDialog({ title: "Test", text: "Body" });
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    test("appends a container div to the document body", () => {
      const initialChildCount = document.body.children.length;
      showConfirmDialog({ title: "Test", text: "Body" });
      expect(document.body.children.length).toBeGreaterThan(initialChildCount);
    });

    test("passes title and text to ConfirmDialog", () => {
      showConfirmDialog({
        title: "My Title",
        text: "My Text",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      });
      const [element] = ReactDOM.render.mock.calls[0];
      expect(element.props.title).toBe("My Title");
      expect(element.props.text).toBe("My Text");
      expect(element.props.confirmButtonText).toBe("Yes");
      expect(element.props.cancelButtonText).toBe("No");
    });

    test("logs console warning suggesting provider migration", () => {
      showConfirmDialog({ title: "Test", text: "Body" });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("ConfirmDialogProvider")
      );
    });
  });

  describe("bridge mode (with provider)", () => {
    test("delegates to registered bridge", async () => {
      const mockBridge = jest.fn().mockResolvedValue(true);
      _registerBridge(mockBridge);

      const promise = showConfirmDialog({
        title: "Bridge Test",
        text: "Using bridge"
      });

      expect(mockBridge).toHaveBeenCalledWith({
        title: "Bridge Test",
        text: "Using bridge",
        iconType: "",
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        confirmButtonColor: "primary",
        cancelButtonColor: "primary"
      });

      const result = await promise;
      expect(result).toBe(true);
      expect(ReactDOM.render).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("does not use ReactDOM.render when bridge is registered", () => {
      const mockBridge = jest.fn().mockResolvedValue(false);
      _registerBridge(mockBridge);

      showConfirmDialog({ title: "Test", text: "Body" });

      expect(ReactDOM.render).not.toHaveBeenCalled();
    });
  });
});
