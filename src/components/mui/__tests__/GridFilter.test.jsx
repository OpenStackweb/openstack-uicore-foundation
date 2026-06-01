/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { GridFilter, OPERATORS, JOIN_OPERATORS, SAVE_FILTERS } from "../GridFilter";
import Filter from "../GridFilter/components/Filter";

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

// MUI Fade never fires its exit callback in jsdom (no CSS transition events),
// so dialogs stay in the DOM after close. This makes it synchronous.
jest.mock(
  "@mui/material/Fade",
  () =>
    ({ children, in: inProp }) =>
      inProp ? children : null
);

const mockStore = configureStore([thunk]);

const makeStore = (filters = []) =>
  mockStore({ allGridFiltersState: { allFilters: filters } });

const criterias = [
  {
    key: "track",
    label: "Track",
    operators: [OPERATORS.IS],
    values: {
      type: "select",
      props: {
        options: [
          { value: 1, label: "OpenStack" },
          { value: 2, label: "FnTech" }
        ],
        placeholder: "Select Track"
      }
    }
  },
  {
    key: "sponsor",
    label: "Sponsor",
    operators: [OPERATORS.IS, OPERATORS.LIKE],
    values: {
      type: "text",
      props: { placeholder: "Type Sponsor Name" }
    }
  }
];

const renderGridFilter = (props = {}) =>
  render(
    <Provider store={makeStore()}>
      <GridFilter
        id="test-filter"
        criterias={criterias}
        onApply={jest.fn()}
        {...props}
      />
    </Provider>
  );

describe("GridFilter", () => {
  test("renders the filter button", () => {
    renderGridFilter();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("opens the dialog when the filter button is clicked", () => {
    renderGridFilter();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("dialog contains apply and cancel buttons", () => {
    renderGridFilter();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("grid_filter.apply_filters")).toBeInTheDocument();
    expect(screen.getByText("grid_filter.cancel")).toBeInTheDocument();
  });

  test("closes the dialog when cancel is clicked", () => {
    renderGridFilter();
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("grid_filter.cancel"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("GridFilter - hideJoinOperators", () => {
  const openDialog = () =>
    fireEvent.click(
      screen.getByRole("button", { name: "grid_filter.open_filters" })
    );

  test("shows join operator toggle buttons by default", () => {
    renderGridFilter();
    openDialog();
    expect(
      screen.getByText("grid_filter.operators.all")
    ).toBeInTheDocument();
    expect(
      screen.getByText("grid_filter.operators.any")
    ).toBeInTheDocument();
  });

  test("hides join operator toggle buttons when hideJoinOperators is true", () => {
    renderGridFilter({ hideJoinOperators: true });
    openDialog();
    expect(
      screen.queryByText("grid_filter.operators.all")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("grid_filter.operators.any")
    ).not.toBeInTheDocument();
  });
});

describe("Filter - options as a function", () => {
  const combinedValues = ["combined_x", "combined_y"];

  const optionsFn = jest.fn((currentValue) =>
    [
      { value: "single_a", label: "Single A" },
      { value: "combined_x", label: "Combined X" },
      { value: "combined_y", label: "Combined Y" }
    ].map((opt) => ({
      ...opt,
      disabled:
        (Array.isArray(currentValue) &&
          currentValue.some((v) => !combinedValues.includes(v)) &&
          combinedValues.includes(opt.value)) ||
        (Array.isArray(currentValue) &&
          currentValue.some((v) => combinedValues.includes(v)) &&
          !combinedValues.includes(opt.value))
    }))
  );

  const statusCriteria = {
    key: "status",
    label: "Status",
    operators: [OPERATORS.IS],
    values: {
      type: "select",
      props: {
        options: optionsFn,
        placeholder: "Select Status",
        multiple: true
      }
    }
  };

  const renderFilter = (value) =>
    render(
      <Filter
        id="test"
        value={value}
        criterias={[statusCriteria]}
        onChange={jest.fn()}
        onAdd={jest.fn()}
        onDelete={jest.fn()}
      />
    );

  beforeEach(() => optionsFn.mockClear());

  test("calls options function with the current value", () => {
    const currentValue = ["single_a"];
    renderFilter({
      id: "0",
      criteria: "status",
      operator: "==",
      value: currentValue
    });
    expect(optionsFn).toHaveBeenCalledWith(currentValue);
  });

  test("renders the options returned by the function", () => {
    renderFilter({ id: "0", criteria: "status", operator: "==", value: [] });
    const comboboxes = screen.getAllByRole("combobox");
    fireEvent.mouseDown(comboboxes[comboboxes.length - 1]);
    expect(screen.getByRole("option", { name: "Single A" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Combined X" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Combined Y" })).toBeInTheDocument();
  });

  test("disables combined options when a single option is selected", () => {
    renderFilter({
      id: "0",
      criteria: "status",
      operator: "==",
      value: ["single_a"]
    });
    const comboboxes = screen.getAllByRole("combobox");
    fireEvent.mouseDown(comboboxes[comboboxes.length - 1]);
    expect(screen.getByRole("option", { name: "Single A" })).not.toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByRole("option", { name: "Combined X" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByRole("option", { name: "Combined Y" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  test("disables single options when a combined option is selected", () => {
    renderFilter({
      id: "0",
      criteria: "status",
      operator: "==",
      value: ["combined_x"]
    });
    const comboboxes = screen.getAllByRole("combobox");
    fireEvent.mouseDown(comboboxes[comboboxes.length - 1]);
    expect(screen.getByRole("option", { name: "Single A" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByRole("option", { name: "Combined X" })).not.toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });
});

// ─── parseFilter / handleSubmit ──────────────────────────────────────────────
//
// These are private closures; exercised by seeding the Redux store with filter
// values so useGridFilter returns them, opening the dialog, and clicking Apply.

describe("GridFilter – parseFilter / handleSubmit", () => {
  // Build a mock store that makes useGridFilter("test-filter") return the given values.
  const makeFilterStore = (filterValues, joinOperator = JOIN_OPERATORS.ALL) =>
    mockStore({
      allGridFiltersState: {
        allFilters: [{ id: "test-filter", filterValues, joinOperator, parsedFilter: [] }]
      }
    });

  const renderWithFilters = (filterValues, opts = {}) => {
    const { joinOperator = JOIN_OPERATORS.ALL, onApply = jest.fn(), criterias: c } = opts;
    const store = makeFilterStore(filterValues, joinOperator);
    render(
      <Provider store={store}>
        <GridFilter
          id="test-filter"
          criterias={c ?? criterias}
          onApply={onApply}
        />
      </Provider>
    );
    return { onApply, store };
  };

  // FilterButton renders a Chip when filterCount > 0; its label span contains
  // "${n} grid_filter.filters". Clicking the span bubbles to the Chip's onClick.
  const openFilterDialog = () =>
    fireEvent.click(screen.getByText(/\d+ grid_filter\.filters/));

  const applyFilters = () =>
    fireEvent.click(screen.getByText("grid_filter.apply_filters"));

  describe("filter serialization", () => {
    test("single value → criteria+operator+value", () => {
      const { onApply } = renderWithFilters([
        { criteria: "sponsor", operator: "==", value: "alice" }
      ]);

      openFilterDialog();
      applyFilters();

      const [filters, joinOp] = onApply.mock.calls[0];
      expect(filters).toHaveLength(1);
      expect(filters[0].parsed).toEqual(["sponsor==alice"]);
      expect(joinOp).toBe(JOIN_OPERATORS.ALL);
    });

    test("array value → items joined with ||", () => {
      const { onApply } = renderWithFilters([
        { criteria: "track", operator: "==", value: [1, 2, 3] }
      ]);

      openFilterDialog();
      applyFilters();

      const [filters] = onApply.mock.calls[0];
      expect(filters[0].parsed).toEqual(["track==1||2||3"]);
    });

    test("delegates to customParser and uses its return value as parsed", () => {
      const customParser = jest.fn().mockReturnValue(["custom==result"]);
      const c = [
        {
          key: "status",
          label: "Status",
          operators: [OPERATORS.IS],
          values: { type: "text", props: {} },
          customParser
        }
      ];

      const { onApply } = renderWithFilters(
        [{ criteria: "status", operator: "==", value: "active" }],
        { criterias: c }
      );

      openFilterDialog();
      applyFilters();

      expect(customParser).toHaveBeenCalledWith(
        expect.objectContaining({ criteria: "status", operator: "==", value: "active" })
      );
      const [filters] = onApply.mock.calls[0];
      expect(filters[0].parsed).toEqual(["custom==result"]);
    });
  });

  describe("handleSubmit filter predicate", () => {
    test.each([
      // value: null avoids a render crash: with criteria=null there is no type, so ValueInput
      // falls back to Dropdown with options=null; a non-null value would hit options.find(null).
      ["null criteria",  { criteria: null,     operator: "==", value: null }],
      ["null operator",  { criteria: "sponsor", operator: null, value: "v" }],
      ["null value",     { criteria: "sponsor", operator: "==", value: null }],
      ["empty string",   { criteria: "sponsor", operator: "==", value: "" }],
      ["empty array",    { criteria: "track",   operator: "==", value: [] }]
    ])("strips %s; valid sibling survives", (_, badFilter) => {
      const { onApply } = renderWithFilters([
        badFilter,
        { criteria: "sponsor", operator: "==", value: "valid" }
      ]);

      openFilterDialog();
      applyFilters();

      const [filters] = onApply.mock.calls[0];
      expect(filters).toHaveLength(1);
      expect(filters[0].value).toBe("valid");
    });
  });

  describe("action contracts", () => {
    test("saveFilters and onApply both receive the parsed payload and active join operator", () => {
      const onApply = jest.fn();
      const { store } = renderWithFilters(
        [{ criteria: "sponsor", operator: "=@", value: "bob" }],
        { joinOperator: JOIN_OPERATORS.ANY, onApply }
      );

      openFilterDialog();
      applyFilters();

      const expectedFilter = expect.objectContaining({
        criteria: "sponsor",
        operator: "=@",
        value: "bob",
        parsed: ["sponsor=@bob"]
      });

      // The saveFilters thunk dispatches {type: SAVE_FILTERS, payload: {...}} to the store.
      const savedAction = store.getActions().find((a) => a.type === SAVE_FILTERS);
      expect(savedAction).toBeDefined();
      expect(savedAction.payload).toMatchObject({
        id: "test-filter",
        joinOperator: JOIN_OPERATORS.ANY,
        filters: expect.arrayContaining([expectedFilter])
      });

      expect(onApply).toHaveBeenCalledWith(
        expect.arrayContaining([expectedFilter]),
        JOIN_OPERATORS.ANY
      );
    });
  });
});
