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
import { Formik, Form } from "formik";
import "@testing-library/jest-dom";
import NotesModal from "../NotesModal/index";

const item = { form_item_id: 1, name: "Test Item" };
const fieldName = `i-${item.form_item_id}-c-global-f-notes`;

const renderModal = (props) =>
  render(
    <Formik
      initialValues={{ [fieldName]: "" }}
      onSubmit={jest.fn()}
    >
      <Form>
        <NotesModal
          id={item.form_item_id}
          label={item.name}
          title="sponsor_edit_form.notes"
          open={true}
          onClose={jest.fn()}
          {...props}
        />
      </Form>
    </Formik>
  );

describe("NotesModal", () => {
  test("renders dialog title when open", () => {
    renderModal({});
    expect(
      screen.getByText("sponsor_edit_form.notes")
    ).toBeInTheDocument();
  });

  test("renders item name", () => {
    renderModal({});
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  test("renders a textarea for notes", () => {
    renderModal({});
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("calls onClose when close icon button is clicked", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    const closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onClose when save button is clicked", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    const saveBtn = screen.getByText("general.save");
    await userEvent.click(saveBtn);
    expect(onClose).toHaveBeenCalled();
  });

  test("does not render dialog content when open is false", () => {
    renderModal({ open: false });
    expect(
      screen.queryByText("sponsor_edit_form.notes")
    ).not.toBeInTheDocument();
  });
});
