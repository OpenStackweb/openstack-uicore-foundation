jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

import allFiltersReducer from "../GridFilter/reducers/all-filters-reducer";
import { JOIN_OPERATORS } from "../GridFilter/utils";
import { SAVE_FILTERS } from "../GridFilter/actions/filter-actions";
import { LOGOUT_USER } from "../../security/actions";

// ─── helpers ─────────────────────────────────────────────────────────────────

const saveAction = (id, filters = [], joinOperator = JOIN_OPERATORS.ALL) => ({
  type: SAVE_FILTERS,
  payload: { id, filters, joinOperator }
});

const withFilters = [
  { criteria: "name",  operator: "==", value: "alice", parsed: ["name==alice"] },
  { criteria: "track", operator: "==", value: [1, 2],  parsed: ["track==1||2"] }
];

// ─── add new entry ────────────────────────────────────────────────────────────

describe("allFiltersReducer – SAVE_FILTERS: add new entry", () => {
  test("appends an entry when the id is not yet in allFilters", () => {
    const next = allFiltersReducer(undefined, saveAction("grid-a", withFilters, JOIN_OPERATORS.ALL));

    expect(next.allFilters).toHaveLength(1);
    expect(next.allFilters[0]).toMatchObject({
      id: "grid-a",
      filterValues: withFilters,
      joinOperator: JOIN_OPERATORS.ALL,
      parsedFilter: ["name==alice", "track==1||2"]
    });
  });

  test("new entry is created via filterReducer(null, …): null bypasses INITIAL_STATE default and spreads as {}", () => {
    // Default parameters only substitute for `undefined`, not `null`.
    // allFiltersReducer passes null (not undefined) to filterReducer for new entries,
    // so `...state` inside filterReducer is `...null`, which is a no-op in JS.
    // The entry should contain exactly the four keys set by the return statement —
    // no stale id: null or other INITIAL_STATE properties leaking through.
    const { allFilters } = allFiltersReducer(
      undefined,
      saveAction("new-id", withFilters, JOIN_OPERATORS.ALL)
    );
    const entry = allFilters[0];

    expect(entry.id).toBe("new-id");
    expect(entry.filterValues).toBe(withFilters);
    expect(Object.keys(entry).sort()).toEqual([
      "filterValues",
      "id",
      "joinOperator",
      "parsedFilter"
    ]);
  });
});

// ─── update existing entry ────────────────────────────────────────────────────

describe("allFiltersReducer – SAVE_FILTERS: update existing entry", () => {
  const initial = {
    allFilters: [
      { id: "grid-a", filterValues: [],   joinOperator: JOIN_OPERATORS.ALL, parsedFilter: [] },
      { id: "grid-b", filterValues: [],   joinOperator: JOIN_OPERATORS.ALL, parsedFilter: [] }
    ]
  };

  test("replaces the matching entry and passes current state into filterReducer", () => {
    const updated = [{ criteria: "sponsor", operator: "=@", value: "bob", parsed: ["sponsor=@bob"] }];
    const next = allFiltersReducer(initial, saveAction("grid-a", updated, JOIN_OPERATORS.ANY));

    expect(next.allFilters).toHaveLength(2);
    expect(next.allFilters.find((f) => f.id === "grid-a")).toMatchObject({
      filterValues: updated,
      joinOperator: JOIN_OPERATORS.ANY,
      parsedFilter: ["or(sponsor=@bob)"]
    });
  });

  test("leaves other entries untouched (same object reference)", () => {
    const next = allFiltersReducer(initial, saveAction("grid-a", withFilters));

    expect(next.allFilters.find((f) => f.id === "grid-b")).toBe(initial.allFilters[1]);
  });
});

// ─── empty reset via saveFilters(id) ─────────────────────────────────────────

describe("allFiltersReducer – SAVE_FILTERS: empty reset", () => {
  test("saveFilters(id) with no args clears filterValues, parsedFilter, and resets joinOperator to ALL", () => {
    // saveFilters(id) calls saveFilters(id, [], JOIN_OPERATORS.ALL) — the no-arg defaults.
    const initial = {
      allFilters: [
        {
          id: "grid-a",
          filterValues: withFilters,
          joinOperator: JOIN_OPERATORS.ANY,
          parsedFilter: ["or(name==alice)", "or(track==1||2)"]
        }
      ]
    };

    const next = allFiltersReducer(initial, saveAction("grid-a")); // ← no filters, no joinOperator
    const entry = next.allFilters[0];

    expect(entry.filterValues).toEqual([]);
    expect(entry.parsedFilter).toEqual([]);
    expect(entry.joinOperator).toBe(JOIN_OPERATORS.ALL);
  });
});

// ─── LOGOUT_USER ─────────────────────────────────────────────────────────────

describe("allFiltersReducer – LOGOUT_USER", () => {
  test("resets to DEFAULT_STATE regardless of how much was stored", () => {
    const populated = {
      allFilters: [
        { id: "grid-a", filterValues: withFilters, joinOperator: JOIN_OPERATORS.ANY, parsedFilter: [] }
      ]
    };

    expect(allFiltersReducer(populated, { type: LOGOUT_USER })).toEqual({ allFilters: [] });
  });
});

// ─── default case ─────────────────────────────────────────────────────────────

describe("allFiltersReducer – default case", () => {
  test("returns the same state reference for unknown action types", () => {
    const state = allFiltersReducer(undefined, { type: "@@INIT" });
    expect(allFiltersReducer(state, { type: "UNKNOWN" })).toBe(state);
  });
});
