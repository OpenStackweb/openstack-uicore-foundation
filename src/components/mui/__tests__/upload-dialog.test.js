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

jest.mock("../../inputs/upload-input-v3", () => () => (
  <div data-testid="upload-input" />
));

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import UploadDialog from "../UploadDialog/index";

global.window = { ...global.window, FILE_UPLOAD_API_BASE_URL: "https://api.example.com" };

const defaultProps = {
  name: "doc",
  value: [],
  open: true,
  fileMeta: {
    name: "My Document",
    description: "Upload your document here",
    max_file_size: 5,
    allowed_extensions: ".pdf,.docx"
  },
  maxFiles: 1,
  onClose: jest.fn(),
  onUpload: jest.fn(() => Promise.resolve())
};

beforeEach(() => jest.clearAllMocks());

describe("UploadDialog", () => {
  test("renders the dialog when open", () => {
    render(<UploadDialog {...defaultProps} />);
    // "upload_input.upload_file" appears in both the title and the submit button
    expect(screen.getAllByText("upload_input.upload_file").length).toBeGreaterThan(0);
  });

  test("renders fileMeta name and description", () => {
    render(<UploadDialog {...defaultProps} />);
    expect(screen.getByText("My Document")).toBeInTheDocument();
    expect(screen.getByText("Upload your document here")).toBeInTheDocument();
  });

  test("does not render content when closed", () => {
    render(<UploadDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("My Document")).not.toBeInTheDocument();
  });

  test("calls onClose when close icon button is clicked", async () => {
    render(<UploadDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("renders the upload input", () => {
    render(<UploadDialog {...defaultProps} />);
    expect(screen.getByTestId("upload-input")).toBeInTheDocument();
  });

  test("upload button is disabled when no file is selected", () => {
    render(<UploadDialog {...defaultProps} />);
    // The upload button is the one that is not the close button
    const buttons = screen.getAllByRole("button");
    const uploadBtn = buttons.find((btn) => btn.textContent.includes("upload_input.upload_file"));
    expect(uploadBtn).toBeDisabled();
  });
});
