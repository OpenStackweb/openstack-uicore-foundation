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
import AuthButton from "../AuthButton/index";

beforeEach(() => jest.clearAllMocks());

describe("AuthButton", () => {
  test("shows login button when user is not logged in", () => {
    render(
      <AuthButton
        isLoggedUser={false}
        doLogin={jest.fn()}
        initLogOut={jest.fn()}
        picture=""
      />
    );
    expect(screen.getByRole("button", { name: /buttons\.log_in/i })).toBeInTheDocument();
  });

  test("calls doLogin when login button is clicked", async () => {
    const doLogin = jest.fn();
    render(
      <AuthButton
        isLoggedUser={false}
        doLogin={doLogin}
        initLogOut={jest.fn()}
        picture=""
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /buttons\.log_in/i }));
    expect(doLogin).toHaveBeenCalledTimes(1);
  });

  test("does not show login button when user is logged in", () => {
    render(
      <AuthButton
        isLoggedUser={true}
        doLogin={jest.fn()}
        initLogOut={jest.fn()}
        picture="http://example.com/pic.jpg"
      />
    );
    expect(screen.queryByRole("button", { name: /buttons\.log_in/i })).not.toBeInTheDocument();
  });

  test("shows sign out button after clicking user menu", async () => {
    const { container } = render(
      <AuthButton
        isLoggedUser={true}
        doLogin={jest.fn()}
        initLogOut={jest.fn()}
        picture="http://example.com/pic.jpg"
      />
    );
    await userEvent.click(container.firstChild);
    expect(screen.getByRole("button", { name: /buttons\.sign_out/i })).toBeInTheDocument();
  });

  test("calls initLogOut when sign out button is clicked", async () => {
    const initLogOut = jest.fn();
    const { container } = render(
      <AuthButton
        isLoggedUser={true}
        doLogin={jest.fn()}
        initLogOut={initLogOut}
        picture=""
      />
    );
    await userEvent.click(container.firstChild);
    await userEvent.click(screen.getByRole("button", { name: /buttons\.sign_out/i }));
    expect(initLogOut).toHaveBeenCalledTimes(1);
  });
});
