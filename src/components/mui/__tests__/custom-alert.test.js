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
import CustomAlert from "../custom-alert";

describe("CustomAlert", () => {
  test("renders the message", () => {
    render(<CustomAlert message="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  test("renders without crashing when no props provided", () => {
    const { container } = render(<CustomAlert />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test("renders with error severity", () => {
    render(<CustomAlert severity="error" message="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  test("renders with success severity", () => {
    render(<CustomAlert severity="success" message="Success!" />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
  });

  test("renders with warning severity", () => {
    render(<CustomAlert severity="warning" message="Warning!" />);
    expect(screen.getByText("Warning!")).toBeInTheDocument();
  });
});
