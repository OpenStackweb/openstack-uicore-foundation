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
import MuiFormikAsyncAutocomplete from "../formik-inputs/mui-formik-async-select";

const mockQueryFunction = jest.fn((input, callback) => {
  callback([
    { id: 1, name: "Option A" },
    { id: 2, name: "Option B" }
  ]);
  return Promise.resolve();
});

const renderWithFormik = (props, initialValues = { field: null }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikAsyncAutocomplete
          name="field"
          queryFunction={mockQueryFunction}
          placeholder="Search..."
          {...props}
        />
      </Form>
    </Formik>
  );

describe("MuiFormikAsyncAutocomplete", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renders with placeholder", () => {
    renderWithFormik({});
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  test("calls queryFunction on mount with empty string", async () => {
    renderWithFormik({});
    await waitFor(() => {
      expect(mockQueryFunction).toHaveBeenCalledWith(
        "",
        expect.any(Function)
      );
    });
  });

  test("renders with preselected single value", () => {
    renderWithFormik(
      {},
      { field: { value: "1", label: "Option A" } }
    );
    expect(screen.getByDisplayValue("Option A")).toBeInTheDocument();
  });

  test("renders with multiple preselected values when multiple is true", () => {
    renderWithFormik(
      { isMulti: true },
      {
        field: [
          { value: "1", label: "Option A" },
          { value: "2", label: "Option B" }
        ]
      }
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ field: null }}
        initialErrors={{ field: "Required" }}
        initialTouched={{ field: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikAsyncAutocomplete
            name="field"
            queryFunction={mockQueryFunction}
            placeholder="Search..."
          />
        </Form>
      </Formik>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
