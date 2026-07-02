jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import useGridFilter from "../GridFilter/hooks/useGridFilter";
import { JOIN_OPERATORS } from "../GridFilter/utils";
import { SAVE_FILTERS } from "../GridFilter/actions/filter-actions";

const mockStore = configureStore([thunk]);

// @testing-library/react v12 doesn't ship renderHook; this minimal wrapper
// captures the hook result synchronously during the first render.
function renderHookWithStore(hook, store) {
  const result = { current: null };

  function HookCapture() {
    result.current = hook();
    return null;
  }

  render(
    <Provider store={store}>
      <HookCapture />
    </Provider>
  );

  return result;
}

// Build a store that has the named filter pre-populated.
const storeWith = (id, filterValues, joinOperator = JOIN_OPERATORS.ALL, parsedFilter = []) =>
  mockStore({
    allGridFiltersState: {
      allFilters: [{ id, filterValues, joinOperator, parsedFilter }]
    }
  });

// ─── valuesWithIds id derivation ─────────────────────────────────────────────

describe("useGridFilter – valuesWithIds id derivation", () => {
  test("id is '${criteria}-${index}' for each filter value", () => {
    const store = storeWith("f", [
      { criteria: "name",  operator: "==", value: "alice" },
      { criteria: "track", operator: "==", value: "1" },
      { criteria: "name",  operator: "==", value: "bob" }   // duplicate criteria → different index
    ]);

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);

    expect(current.valuesWithIds[0].id).toBe("name-0");
    expect(current.valuesWithIds[1].id).toBe("track-1");
    expect(current.valuesWithIds[2].id).toBe("name-2");
  });

  test("original filter fields are preserved alongside the injected id", () => {
    const original = { criteria: "sponsor", operator: "=@", value: "acme" };
    const store = storeWith("f", [original]);

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);

    expect(current.valuesWithIds[0]).toMatchObject({ ...original, id: "sponsor-0" });
  });
});

// ─── filterCount ─────────────────────────────────────────────────────────────

describe("useGridFilter – filterCount", () => {
  test("equals filterValues.length", () => {
    const store = storeWith("f", [
      { criteria: "name",  operator: "==", value: "alice" },
      { criteria: "track", operator: "==", value: "1" }
    ]);

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);

    expect(current.filterCount).toBe(2);
  });

  test("is 0 when filterValues is empty", () => {
    const store = storeWith("f", []);

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);

    expect(current.filterCount).toBe(0);
  });
});

// ─── defaults when id is absent ──────────────────────────────────────────────

describe("useGridFilter – defaults when id is absent", () => {
  test("returns empty arrays, filterCount 0, and JOIN_OPERATORS.ALL when id not found", () => {
    const store = mockStore({ allGridFiltersState: { allFilters: [] } });

    const { current } = renderHookWithStore(() => useGridFilter("missing"), store);

    expect(current.filterValues).toEqual([]);
    expect(current.filterCount).toBe(0);
    expect(current.joinOperator).toBe(JOIN_OPERATORS.ALL);
    expect(current.parsedFilter).toEqual([]);
    expect(current.valuesWithIds).toEqual([]);
  });

  test("does not match a different id that happens to be in the store", () => {
    const store = storeWith("other-filter", [{ criteria: "name", operator: "==", value: "x" }]);

    const { current } = renderHookWithStore(() => useGridFilter("target-filter"), store);

    expect(current.filterCount).toBe(0);
    expect(current.filterValues).toEqual([]);
  });
});

// ─── state-key contract ───────────────────────────────────────────────────────

describe("useGridFilter – state-key contract", () => {
  // The hook reads state.allGridFiltersState?.allFilters ?? [].
  // If the consumer mounts the reducer under a different key, the selector
  // silently falls back to [] and the hook behaves as if no filters exist.
  // This is a footgun: everything renders without error but filters are ignored.

  test("reads from state.allGridFiltersState.allFilters", () => {
    const store = storeWith("f", [{ criteria: "name", operator: "==", value: "alice" }]);

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);

    expect(current.filterCount).toBe(1);
  });

  test("falls back to [] when allGridFiltersState key is missing (wrong reducer key)", () => {
    const store = mockStore({
      wrongKey: { allFilters: [{ id: "f", filterValues: [{ criteria: "name", operator: "==", value: "alice" }] }] }
    });

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);

    // No crash, but the filter is silently invisible.
    expect(current.filterCount).toBe(0);
    expect(current.filterValues).toEqual([]);
    expect(current.parsedFilter).toEqual([]);
  });

  test("falls back to [] when allGridFiltersState exists but allFilters is absent", () => {
    const store = mockStore({ allGridFiltersState: {} });

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);

    expect(current.filterCount).toBe(0);
    expect(current.valuesWithIds).toEqual([]);
  });
});

// ─── resetFilters ─────────────────────────────────────────────────────────────

describe("useGridFilter – resetFilters", () => {
  test("dispatches SAVE_FILTERS with the hook's id and no filters", () => {
    const store = storeWith("f", []);

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);
    current.resetFilters();

    const actions = store.getActions();
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      type: SAVE_FILTERS,
      payload: { id: "f", filters: [], joinOperator: JOIN_OPERATORS.ALL }
    });
  });
});

// ─── setFilters ────────────────────────────────────────────────────────────

describe("useGridFilter – setFilters", () => {
  test("dispatches SAVE_FILTERS with the hook's id and the given filters/joinOperator", () => {
    const store = storeWith("f", []);
    const savedCriteria = [
      { id: "track_id-0", criteria: "track_id", operator: "==", value: [36333], parsed: ["track_id==36333"] }
    ];

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);
    current.setFilters(savedCriteria, JOIN_OPERATORS.ANY);

    const actions = store.getActions();
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      type: SAVE_FILTERS,
      payload: { id: "f", filters: savedCriteria, joinOperator: JOIN_OPERATORS.ANY }
    });
  });

  test("defaults joinOperator to JOIN_OPERATORS.ALL when omitted", () => {
    const store = storeWith("f", []);
    const savedCriteria = [
      { criteria: "selection_status", operator: "==", value: ["accepted"], parsed: ["selection_status==accepted"] }
    ];

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);
    current.setFilters(savedCriteria);

    const actions = store.getActions();
    expect(actions[0]).toMatchObject({
      type: SAVE_FILTERS,
      payload: { id: "f", filters: savedCriteria, joinOperator: JOIN_OPERATORS.ALL }
    });
  });

  test("defaults filters to [] when called with no arguments", () => {
    const store = storeWith("f", []);

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);
    current.setFilters();

    const actions = store.getActions();
    expect(actions[0]).toMatchObject({
      type: SAVE_FILTERS,
      payload: { id: "f", filters: [], joinOperator: JOIN_OPERATORS.ALL }
    });
  });

  test("falls back to JOIN_OPERATORS.ALL when given an invalid joinOperator", () => {
    const store = storeWith("f", []);
    const savedCriteria = [
      { criteria: "track_id", operator: "==", value: [36333], parsed: ["track_id==36333"] }
    ];

    const { current } = renderHookWithStore(() => useGridFilter("f"), store);
    current.setFilters(savedCriteria, "garbage");

    const actions = store.getActions();
    expect(actions[0]).toMatchObject({
      type: SAVE_FILTERS,
      payload: { id: "f", filters: savedCriteria, joinOperator: JOIN_OPERATORS.ALL }
    });
  });
});
