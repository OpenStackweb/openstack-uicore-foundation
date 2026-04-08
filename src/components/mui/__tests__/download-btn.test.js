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
import "@testing-library/jest-dom";
import DownloadBtn from "../DownloadBtn/index";

describe("DownloadBtn", () => {
  test("renders a link button", () => {
    render(<DownloadBtn url="https://example.com/file.pdf" />);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  test("has the correct href", () => {
    render(<DownloadBtn url="https://example.com/file.pdf" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://example.com/file.pdf");
  });

  test("opens in a new tab", () => {
    render(<DownloadBtn url="https://example.com/file.pdf" />);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });

  test("has rel noopener noreferrer", () => {
    render(<DownloadBtn url="https://example.com/file.pdf" />);
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  });
});
