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

jest.mock("../../../utils/query-actions", () => ({
  fetchAllSummits: jest.fn(() =>
    Promise.resolve([
      { id: 10, name: "Summit Alpha" },
      { id: 11, name: "Summit Beta" }
    ])
  )
}));

jest.mock("i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SummitsDropdown from "../summits-dropdown";

describe("SummitsDropdown", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renders provided summits as options", () => {
    const summits = [
      { id: 1, name: "Summit One" },
      { id: 2, name: "Summit Two" }
    ];
    render(<SummitsDropdown summits={summits} onChange={jest.fn()} />);
    fireEvent.mouseDown(screen.getByRole("combobox"));
    expect(screen.getByText("Summit One")).toBeInTheDocument();
    expect(screen.getByText("Summit Two")).toBeInTheDocument();
  });

  test("renders the label", () => {
    render(
      <SummitsDropdown
        summits={[{ id: 1, name: "Summit" }]}
        onChange={jest.fn()}
        label="Choose Summit"
      />
    );
    expect(screen.getByText("Choose Summit")).toBeInTheDocument();
  });

  test("fetches summits when summits prop is empty", async () => {
    render(<SummitsDropdown summits={[]} onChange={jest.fn()} />);
    await waitFor(() => {
      expect(
        require("../../../utils/query-actions").fetchAllSummits
      ).toHaveBeenCalled();
    });
  });

  test("does not fetch summits when summits prop is provided", () => {
    render(
      <SummitsDropdown
        summits={[{ id: 1, name: "Summit" }]}
        onChange={jest.fn()}
      />
    );
    expect(
      require("../../../utils/query-actions").fetchAllSummits
    ).not.toHaveBeenCalled();
  });

  test("renders a select combobox", () => {
    render(
      <SummitsDropdown
        summits={[{ id: 1, name: "Summit" }]}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
