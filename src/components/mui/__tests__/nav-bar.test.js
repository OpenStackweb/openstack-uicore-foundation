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
import NavBar from "../NavBar/index";

const defaultProps = {
  title: "My App",
  profilePic: "",
  isLoggedUser: false,
  onClickLogin: jest.fn(),
  initLogOut: jest.fn()
};

beforeEach(() => jest.clearAllMocks());

describe("NavBar", () => {
  test("renders the title", () => {
    render(<NavBar {...defaultProps} />);
    expect(screen.getByText("My App")).toBeInTheDocument();
  });

  test("renders login button when user is not logged in", () => {
    render(<NavBar {...defaultProps} isLoggedUser={false} />);
    expect(screen.getByRole("button", { name: /buttons\.log_in/i })).toBeInTheDocument();
  });

  test("does not show login button when user is logged in", () => {
    render(<NavBar {...defaultProps} isLoggedUser={true} />);
    expect(screen.queryByRole("button", { name: /buttons\.log_in/i })).not.toBeInTheDocument();
  });

  test("renders without crashing", () => {
    const { container } = render(<NavBar {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
