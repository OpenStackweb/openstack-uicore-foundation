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

import showConfirmDialog from "../showConfirmDialog";
import ReactDOM from "react-dom";

describe("showConfirmDialog", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns a Promise", () => {
    const result = showConfirmDialog({ title: "Test", text: "Body" });
    expect(result).toBeInstanceOf(Promise);
  });

  test("calls ReactDOM.render to mount the dialog", async () => {
    showConfirmDialog({ title: "Test", text: "Body" });
    await Promise.resolve();
    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  });

  test("appends a container div to the document body", async () => {
    const initialChildCount = document.body.children.length;
    showConfirmDialog({ title: "Test", text: "Body" });
    await Promise.resolve();
    expect(document.body.children.length).toBeGreaterThan(initialChildCount);
  });

  test("passes title and text to ConfirmDialog", async () => {
    showConfirmDialog({
      title: "My Title",
      text: "My Text",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    });
    await Promise.resolve();
    const [element] = ReactDOM.render.mock.calls[0];
    expect(element.props.title).toBe("My Title");
    expect(element.props.text).toBe("My Text");
    expect(element.props.confirmButtonText).toBe("Yes");
    expect(element.props.cancelButtonText).toBe("No");
  });
});
