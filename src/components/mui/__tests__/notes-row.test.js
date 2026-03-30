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
import NotesRow from "../table/extra-rows/NotesRow";

const renderInTable = (props) =>
  render(
    <table>
      <tbody>
        <NotesRow {...props} />
      </tbody>
    </table>
  );

describe("NotesRow", () => {
  test("renders the note text", () => {
    renderInTable({ colCount: 3, note: "This is a note" });
    expect(screen.getByText("This is a note")).toBeInTheDocument();
  });

  test("renders a single table row", () => {
    const { container } = renderInTable({ colCount: 3, note: "Note" });
    expect(container.querySelectorAll("tr")).toHaveLength(1);
  });

  test("renders a single cell spanning colCount columns", () => {
    const { container } = renderInTable({ colCount: 5, note: "Note" });
    const cell = container.querySelector("td");
    expect(cell).toHaveAttribute("colspan", "5");
  });

  test("renders empty note text", () => {
    const { container } = renderInTable({ colCount: 2, note: "" });
    expect(container.querySelector("td")).toBeInTheDocument();
  });
});
