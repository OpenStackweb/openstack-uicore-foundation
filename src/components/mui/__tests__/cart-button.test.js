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
import CartButton from "../CartButton/index";

beforeEach(() => jest.clearAllMocks());

describe("CartButton", () => {
  test("renders the button", () => {
    render(<CartButton itemCount={3} onClick={jest.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("shows item count when not disabled", () => {
    render(<CartButton itemCount={5} onClick={jest.fn()} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("hides item count when disabled", () => {
    render(<CartButton itemCount={5} onClick={jest.fn()} disabled />);
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });

  test("calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<CartButton itemCount={1} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("is disabled when disabled prop is true", () => {
    render(<CartButton itemCount={1} onClick={jest.fn()} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
