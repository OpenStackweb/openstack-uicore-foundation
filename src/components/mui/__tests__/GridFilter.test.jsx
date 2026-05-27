/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { GridFilter, OPERATORS } from "../GridFilter";
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
