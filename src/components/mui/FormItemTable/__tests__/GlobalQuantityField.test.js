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
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import GlobalQuantityField from "../components/GlobalQuantityField";

const row = { form_item_id: 1, quantity_limit_per_sponsor: 5 };
const fieldName = `i-${row.form_item_id}-c-global-f-quantity`;

const renderField = (props = {}) =>
  render(
    <Formik initialValues={{ [fieldName]: 0 }} onSubmit={jest.fn()}>
      <Form>
        <GlobalQuantityField
          row={row}
          extraColumns={[]}
          value={0}
          {...props}
        />
      </Form>
    </Formik>
  );

describe("GlobalQuantityField", () => {
  test("renders a number input", () => {
    renderField();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  test("input is not disabled by default", () => {
    renderField();
    expect(screen.getByRole("spinbutton")).not.toBeDisabled();
  });

  test("input is disabled when disabled prop is true", () => {
    renderField({ disabled: true });
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  test("input has readOnly when extraColumns includes Quantity type", () => {
    renderField({ extraColumns: [{ type: "Quantity" }] });
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("readonly");
  });

  test("input does not have readOnly when extraColumns has no Quantity", () => {
    renderField({ extraColumns: [{ type: "Text" }] });
    const input = screen.getByRole("spinbutton");
    expect(input).not.toHaveAttribute("readonly");
  });
});
