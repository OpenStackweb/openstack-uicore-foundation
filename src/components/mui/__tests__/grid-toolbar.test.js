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

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

// grid items (excluding the outer container) in render order
const getItems = (container) =>
  Array.from(container.querySelectorAll(".MuiGrid2-root:not(.MuiGrid2-container)"));

const sizeClasses = (el) =>
  Array.from(el.classList)
    .filter((c) => c.startsWith("MuiGrid2-grid-"))
    .sort();

describe("GridToolbar", () => {
  const searchProps = { term: "", onSearch: jest.fn(), placeholder: "Find" };

  beforeEach(() => jest.clearAllMocks());

  test("renders only a full-width actions cell without search or filter", () => {
    const { container } = render(
      <GridToolbar>
        <Button>Add</Button>
      </GridToolbar>
    );
    const items = getItems(container);
    expect(items).toHaveLength(1);
    expect(sizeClasses(items[0])).toEqual(["MuiGrid2-grid-xs-12"]);
    expect(screen.queryByPlaceholderText("Find")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "general.archived" })
    ).not.toBeInTheDocument();
  });

  test("uses the fixed md/lg layout when both search and filter are present", () => {
    const { container } = render(
      <GridToolbar
        searchProps={searchProps}
        archiveToggleProps={{ showArchived: false, onChange: jest.fn() }}
        splitAt="lg"
      >
        <Button>Add</Button>
      </GridToolbar>
    );
    const [search, filter, actions] = getItems(container);
    expect(sizeClasses(search)).toEqual([
      "MuiGrid2-grid-lg-4",
      "MuiGrid2-grid-md-3",
      "MuiGrid2-grid-sm-6",
      "MuiGrid2-grid-xs-12"
    ]);
    expect(sizeClasses(filter)).toEqual([
      "MuiGrid2-grid-lg-2",
      "MuiGrid2-grid-md-3",
      "MuiGrid2-grid-sm-6",
      "MuiGrid2-grid-xs-12"
    ]);
    expect(sizeClasses(actions)).toEqual(["MuiGrid2-grid-md-6", "MuiGrid2-grid-xs-12"]);
  });

  test("splits search and actions 4/8 at sm by default", () => {
    const { container } = render(
      <GridToolbar searchProps={searchProps}>
        <Button>Add</Button>
      </GridToolbar>
    );
    const [search, actions] = getItems(container);
    expect(sizeClasses(search)).toEqual(["MuiGrid2-grid-sm-4", "MuiGrid2-grid-xs-12"]);
    expect(sizeClasses(actions)).toEqual(["MuiGrid2-grid-sm-8", "MuiGrid2-grid-xs-12"]);
  });

  test("splits filter and actions at the splitAt breakpoint", () => {
    const { container } = render(
      <GridToolbar filter={<span>Hide past events</span>} splitAt="lg">
        <Button>Add</Button>
      </GridToolbar>
    );
    const [filter, actions] = getItems(container);
    expect(sizeClasses(filter)).toEqual(["MuiGrid2-grid-lg-4", "MuiGrid2-grid-xs-12"]);
    expect(sizeClasses(actions)).toEqual(["MuiGrid2-grid-lg-8", "MuiGrid2-grid-xs-12"]);
  });

  test("forwards searchProps to the search input", () => {
    render(<GridToolbar searchProps={{ ...searchProps, term: "abc" }} />);
    expect(screen.getByPlaceholderText("Find")).toHaveValue("abc");
  });

  test("renders the archive toggle when archiveToggleProps is set, and forwards its changes", async () => {
    const onChange = jest.fn();
    render(
      <GridToolbar archiveToggleProps={{ showArchived: false, onChange }} />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "general.archived" })
    );
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test("renders a page's own filter in the filter slot", () => {
    render(<GridToolbar filter={<span>Hide past events</span>} />);
    expect(screen.getByText("Hide past events")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "general.archived" })
    ).not.toBeInTheDocument();
  });

  test("shows the archive toggle instead of the filter when both are given", () => {
    render(
      <GridToolbar
        archiveToggleProps={{ showArchived: false, onChange: jest.fn() }}
        filter={<span>Hide past events</span>}
      />
    );
    expect(
      screen.getByRole("button", { name: "general.archived" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Hide past events")).not.toBeInTheDocument();
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

  test("adds the fill tier between sm and md when search and filter share the row", () => {
    render(
      <GridToolbar
        searchProps={searchProps}
        archiveToggleProps={{ showArchived: false, onChange: jest.fn() }}
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
