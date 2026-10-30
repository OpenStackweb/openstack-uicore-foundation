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
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Button } from "@mui/material";
import GridToolbar from "../grid-toolbar";

// grid items (excluding the outer container) in render order
const getItems = (container) =>
  Array.from(container.querySelectorAll(".MuiGrid-root:not(.MuiGrid-container)"));

const sizeClasses = (el) =>
  Array.from(el.classList)
    .filter((c) => c.startsWith("MuiGrid-grid-"))
    .sort();

describe("GridToolbar", () => {
  const searchProps = { term: "", onSearch: jest.fn(), placeholder: "Find" };

  beforeEach(() => jest.clearAllMocks());

  test("renders only a full-width actions cell without search or checkbox", () => {
    const { container } = render(
      <GridToolbar>
        <Button>Add</Button>
      </GridToolbar>
    );
    const items = getItems(container);
    expect(items).toHaveLength(1);
    expect(sizeClasses(items[0])).toEqual(["MuiGrid-grid-xs-12"]);
    expect(screen.queryByPlaceholderText("Find")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  test("uses the fixed md layout when both search and checkbox are present", () => {
    const { container } = render(
      <GridToolbar
        searchProps={searchProps}
        checkboxProps={{ checked: false, onChange: jest.fn(), label: "Show all" }}
        splitAt="lg"
      >
        <Button>Add</Button>
      </GridToolbar>
    );
    const [search, checkbox, actions] = getItems(container);
    expect(sizeClasses(search)).toEqual([
      "MuiGrid-grid-md-4",
      "MuiGrid-grid-sm-6",
      "MuiGrid-grid-xs-12"
    ]);
    expect(sizeClasses(checkbox)).toEqual([
      "MuiGrid-grid-md-2",
      "MuiGrid-grid-sm-6",
      "MuiGrid-grid-xs-12"
    ]);
    expect(sizeClasses(actions)).toEqual(["MuiGrid-grid-md-6", "MuiGrid-grid-xs-12"]);
  });

  test("splits search and actions 4/8 at sm by default", () => {
    const { container } = render(
      <GridToolbar searchProps={searchProps}>
        <Button>Add</Button>
      </GridToolbar>
    );
    const [search, actions] = getItems(container);
    expect(sizeClasses(search)).toEqual(["MuiGrid-grid-sm-4", "MuiGrid-grid-xs-12"]);
    expect(sizeClasses(actions)).toEqual(["MuiGrid-grid-sm-8", "MuiGrid-grid-xs-12"]);
  });

  test("splits checkbox and actions at the splitAt breakpoint", () => {
    const { container } = render(
      <GridToolbar
        checkboxProps={{ checked: false, onChange: jest.fn(), label: "Show all" }}
        splitAt="lg"
      >
        <Button>Add</Button>
      </GridToolbar>
    );
    const [checkbox, actions] = getItems(container);
    expect(sizeClasses(checkbox)).toEqual(["MuiGrid-grid-lg-4", "MuiGrid-grid-xs-12"]);
    expect(sizeClasses(actions)).toEqual(["MuiGrid-grid-lg-8", "MuiGrid-grid-xs-12"]);
  });

  test("forwards searchProps to the search input", () => {
    render(<GridToolbar searchProps={{ ...searchProps, term: "abc" }} />);
    expect(screen.getByPlaceholderText("Find")).toHaveValue("abc");
  });

  test("renders a controlled checkbox labelled by label", async () => {
    const onChange = jest.fn();
    render(
      <GridToolbar checkboxProps={{ checked: true, onChange, label: "Show all" }} />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Show all" });
    expect(checkbox).toBeChecked();
    expect(screen.getByText("Show all")).toBeInTheDocument();
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("uses ariaLabel over label for the checkbox aria-label", () => {
    render(
      <GridToolbar
        checkboxProps={{
          checked: false,
          onChange: jest.fn(),
          label: <span>Show all</span>,
          ariaLabel: "Show all items"
        }}
      />
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-label", "Show all items");
  });

  // jsdom ignores media queries, so assert the sx handed to each child instead
  const SxProbe = ({ name, sx }) => <div data-testid={name} data-sx={JSON.stringify(sx)} />;
  const sxOf = (name) => JSON.parse(screen.getByTestId(name).dataset.sx);

  test("gives children full width at xs and auto from sm, skipping null children", () => {
    render(
      <GridToolbar>
        <SxProbe name="add" />
        {null}
        <SxProbe name="export" />
      </GridToolbar>
    );
    expect(sxOf("add")).toEqual({ width: { xs: "100%", sm: "auto" } });
    expect(sxOf("export")).toEqual({ width: { xs: "100%", sm: "auto" } });
  });

  test("adds the fill tier between sm and md when search and checkbox share the row", () => {
    render(
      <GridToolbar
        searchProps={searchProps}
        checkboxProps={{ checked: false, onChange: jest.fn(), label: "Show all" }}
      >
        <SxProbe name="add" />
      </GridToolbar>
    );
    expect(sxOf("add")).toEqual({
      width: { xs: "100%", md: "auto" },
      flexGrow: { sm: 1, md: 0 },
      flexBasis: { sm: 0, md: "auto" }
    });
  });

  test("lets a child's own sx override the toolbar's", () => {
    render(
      <GridToolbar>
        <SxProbe name="export" sx={{ width: "50%", mr: 1 }} />
      </GridToolbar>
    );
    expect(sxOf("export")).toEqual({ width: "50%", mr: 1 });
  });
});
