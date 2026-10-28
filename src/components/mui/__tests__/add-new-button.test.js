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

jest.mock("i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AddNewButton from "../AddNewButton/index";

describe("AddNewButton", () => {
  test("renders the label and calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<AddNewButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "general.add_new" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("renders children instead of the default label", () => {
    render(<AddNewButton onClick={jest.fn()}>Add Sponsorship</AddNewButton>);
    expect(
      screen.getByRole("button", { name: "Add Sponsorship" })
    ).toBeInTheDocument();
  });

  test("forwards extra props to the button", () => {
    render(<AddNewButton onClick={jest.fn()} disabled data-testid="add-new" />);
    expect(screen.getByTestId("add-new")).toBeDisabled();
  });
});
