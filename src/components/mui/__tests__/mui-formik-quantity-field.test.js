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
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import MuiFormikQuantityField from "../formik-inputs/mui-formik-quantity-field";

const renderWithFormik = (props, initialValues = { testField: [] }) =>
  render(
    <Formik initialValues={initialValues} onSubmit={props.onSubmit}>
      <Form>
        <MuiFormikQuantityField name="testField" {...props} />
        <button type="submit">submit</button>
      </Form>
    </Formik>
  );

describe("MuiFormikQuantityField", () => {
  it("must accept user input", async () => {
    const onSubmit = jest.fn();

    renderWithFormik({
      label: "some field",
      onSubmit
    });

    const field = screen.getByLabelText("some field");
    expect(field).toBeInTheDocument();

    const submitButton = screen.getByText("submit");
    await act(async () => {
      await userEvent.type(field, "12345");
      await userEvent.click(submitButton);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        testField: 12345
      }),
      expect.anything()
    );
  });

  it("must filter invalid characters", async () => {
    const onSubmit = jest.fn();

    renderWithFormik({
      label: "some field",
      onSubmit
    });

    const field = screen.getByLabelText("some field");
    expect(field).toBeInTheDocument();

    const submitButton = screen.getByText("submit");
    await act(async () => {
      await userEvent.type(field, "123eEe45");
      await userEvent.click(submitButton);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        testField: 12345
      }),
      expect.anything()
    );
  });
});
