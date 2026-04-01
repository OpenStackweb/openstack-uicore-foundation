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

jest.mock("../../inputs/upload-input-v2", () => {
  const React = require("react");
  const MockUploadInputV2 = ({ value, canAdd }) => (
    <div data-testid="upload-input" data-can-add={canAdd}>
      {value.length} file(s)
    </div>
  );
  return { __esModule: true, default: MockUploadInputV2 };
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikUpload from "../formik-inputs/mui-formik-upload";

const renderWithFormik = (props, initialValues = { images: [] }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <MuiFormikUpload name="images" id="images-upload" {...props} />
      </Form>
    </Formik>
  );

describe("MuiFormikUpload", () => {
  test("renders the upload input component", () => {
    renderWithFormik({});
    expect(screen.getByTestId("upload-input")).toBeInTheDocument();
  });

  test("shows 0 files when initial value is empty", () => {
    renderWithFormik({});
    expect(screen.getByText("0 file(s)")).toBeInTheDocument();
  });

  test("shows file count matching initial value", () => {
    const images = [
      { id: 1, file_name: "a.jpg" },
      { id: 2, file_name: "b.jpg" }
    ];
    renderWithFormik({}, { images });
    expect(screen.getByText("2 file(s)")).toBeInTheDocument();
  });

  test("canAdd is true when file count is below maxFiles", () => {
    renderWithFormik({ maxFiles: 5 }, { images: [] });
    expect(screen.getByTestId("upload-input")).toHaveAttribute(
      "data-can-add",
      "true"
    );
  });

  test("canAdd is false when file count equals maxFiles", () => {
    const images = [{ id: 1 }, { id: 2 }];
    renderWithFormik({ maxFiles: 2 }, { images });
    expect(screen.getByTestId("upload-input")).toHaveAttribute(
      "data-can-add",
      "false"
    );
  });

  test("shows error when touched and has error", () => {
    render(
      <Formik
        initialValues={{ images: [] }}
        initialErrors={{ images: "Required" }}
        initialTouched={{ images: true }}
        onSubmit={jest.fn()}
      >
        <Form>
          <MuiFormikUpload name="images" id="images-upload" />
        </Form>
      </Formik>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
