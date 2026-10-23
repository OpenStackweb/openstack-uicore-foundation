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
import userEvent from "@testing-library/user-event";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react";
import BulkEditTable from "../BulkEditTable";
import showConfirmDialog from "../../showConfirmDialog";

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

jest.mock("../../showConfirmDialog", () => ({
  __esModule: true,
  default: jest.fn()
}));

describe("BulkEditTable", () => {
  const baseProps = {
    options: {
      className: "test-table",
      actions: {}
    },
    columns: [
      { columnKey: "id", value: "id", sortable: true },
      { columnKey: "title", value: "title", sortable: true }
    ],
    onSort: jest.fn(),
    data: [
      { id: 1, title: "Event 1" },
      { id: 2, title: "Event 2" }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("delete from the row menu confirms, then passes the row's idKey value", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    showConfirmDialog.mockResolvedValueOnce(true);

    render(
      <BulkEditTable
        {...baseProps}
        idKey="uuid"
        data={[
          { uuid: "a-1", title: "Event 1", name: "Event 1" },
          { uuid: "a-2", title: "Event 2", name: "Event 2" }
        ]}
        onUpdate={jest.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getAllByTestId("row-actions-menu-trigger")[1]);
    await user.click(screen.getByRole("menuitem", { name: "general.delete" }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("a-2"));
    expect(showConfirmDialog).toHaveBeenCalledWith(
      expect.objectContaining({ text: "general.row_remove_warning Event 2" })
    );
  });

  test("applies bulk updates to selected rows", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn(() => Promise.resolve());

    render(<BulkEditTable {...baseProps} onUpdate={onUpdate} />);

    const checkboxes = screen.getAllByRole("checkbox");

    await user.click(checkboxes[1]);
    await user.click(screen.getByText(/^bulk_edit_table\.edit_selected/));
    await act(async () => {
      await user.click(screen.getByText("bulk_edit_table.apply_changes"));
    });

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 1 })])
      );
    });
  });

  test("changing the selection while editing preserves in-progress edits", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn(() => Promise.resolve());
    const editableColumns = [
      { columnKey: "id", value: "id", sortable: true },
      { columnKey: "title", value: "title", sortable: true, editableField: true }
    ];

    render(
      <BulkEditTable {...baseProps} columns={editableColumns} onUpdate={onUpdate} />
    );

    const checkboxes = screen.getAllByRole("checkbox");

    // select row 1 and enter edit mode
    await user.click(checkboxes[1]);
    await user.click(screen.getByText(/^bulk_edit_table\.edit_selected/));

    // type an edit into row 1's editable title cell
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Edited title" }
    });

    // widen the selection via "select all" while still editing
    fireEvent.click(checkboxes[0]);

    await act(async () => {
      await user.click(screen.getByText("bulk_edit_table.apply_changes"));
    });

    await waitFor(() => {
      // selection is frozen while editing, so "select all" is a no-op and
      // the in-progress edit on row 1 survives to onUpdate
      expect(onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, title: "Edited title" })
        ])
      );
    });
  });
});
