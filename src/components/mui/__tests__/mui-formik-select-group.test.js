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
import { render, screen, waitFor } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikSelectGroup from "../formik-inputs/mui-formik-select-group";

const mockQueryFunction = jest.fn((callback) => {
  callback([
    { id: 1, name: "Option A" },
    { id: 2, name: "Option B" }
  ]);
  return Promise.resolve();
});

const renderWithFormik = (props, initialValues = { testField: [] }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikSelectGroup
          name="testField"
          queryFunction={mockQueryFunction}
          placeholder="Select options"
          {...props}
        />
      </Form>
    </Formik>
  );

describe("MuiFormikSelectGroup", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renders with placeholder after loading", async () => {
    renderWithFormik({});
    await waitFor(() => {
      expect(screen.getByText("Select options")).toBeInTheDocument();
    });
  });

  test("calls queryFunction on mount", async () => {
    renderWithFormik({});
    await waitFor(() => expect(mockQueryFunction).toHaveBeenCalledTimes(1));
  });

  test("renders a combobox", async () => {
    renderWithFormik({});
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  test("shows error when touched and has error", async () => {
    render(
      <Formik
        initialValues={{ testField: [] }}
        initialErrors={{ testField: "Required" }}
        initialTouched={{ testField: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikSelectGroup
            name="testField"
            queryFunction={mockQueryFunction}
            placeholder="Select"
          />
        </Form>
      </Formik>
    );
    await waitFor(() => {
      expect(screen.getByText("Required")).toBeInTheDocument();
    });
  });

  test("renders disabled when disabled prop is true", async () => {
    renderWithFormik({ disabled: true });
    await waitFor(() => {
      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("aria-disabled", "true");
    });
  });
});
