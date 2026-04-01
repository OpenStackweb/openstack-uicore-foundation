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

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SnackbarNotificationContext, {
  useSnackbarMessage
} from "../SnackbarNotification/Context";

const TestConsumer = () => {
  const ctx = useSnackbarMessage();
  return <div>{ctx ? "has-context" : "no-context"}</div>;
};

describe("SnackbarNotificationContext", () => {
  test("provides null by default (no provider)", () => {
    render(<TestConsumer />);
    expect(screen.getByText("no-context")).toBeInTheDocument();
  });

  test("provides value when wrapped in provider", () => {
    const value = {
      successMessage: jest.fn(),
      errorMessage: jest.fn()
    };
    render(
      <SnackbarNotificationContext.Provider value={value}>
        <TestConsumer />
      </SnackbarNotificationContext.Provider>
    );
    expect(screen.getByText("has-context")).toBeInTheDocument();
  });

  test("useSnackbarMessage returns the context value", () => {
    const value = { successMessage: jest.fn(), errorMessage: jest.fn() };
    let captured = null;
    const Capturer = () => {
      captured = useSnackbarMessage();
      return null;
    };
    render(
      <SnackbarNotificationContext.Provider value={value}>
        <Capturer />
      </SnackbarNotificationContext.Provider>
    );
    expect(captured).toBe(value);
  });
});
