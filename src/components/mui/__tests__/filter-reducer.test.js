jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

import filterReducer from "../GridFilter/reducers/filter-reducer";
import { JOIN_OPERATORS } from "../GridFilter/utils";
import { SAVE_FILTERS } from "../GridFilter/actions/filter-actions";

const FIL_SAVE = `FIL_${SAVE_FILTERS}`;

// Convenience: dispatch FIL_SAVE_FILTERS and return the next state.
const save = (filters, joinOperator, { id = "test", prev = undefined } = {}) =>
  filterReducer(prev, { type: FIL_SAVE, payload: { id, filters, joinOperator } });

// ─── parsedFilter construction ───────────────────────────────────────────────

describe("filter-reducer – parsedFilter construction", () => {
  const twoFilters = [
    { criteria: "name",  operator: "==", value: "alice", parsed: ["name==alice"] },
    { criteria: "track", operator: "==", value: [1, 2],  parsed: ["track==1||2"] }
  ];

  test("ALL: clauses are stored verbatim", () => {
    const { parsedFilter } = save(twoFilters, JOIN_OPERATORS.ALL);
    expect(parsedFilter).toEqual(["name==alice", "track==1||2"]);
  });

  test("ANY: every clause is wrapped in or(...)", () => {
    const { parsedFilter } = save(twoFilters, JOIN_OPERATORS.ANY);
    expect(parsedFilter).toEqual(["or(name==alice)", "or(track==1||2)"]);
  });

  test("flatMap skips filters whose parsed is null or absent", () => {
    const mixed = [
      { criteria: "name",   operator: "==", value: "alice",  parsed: ["name==alice"] },
      { criteria: "status", operator: "==", value: "active", parsed: null },   // null → ?? []
      { criteria: "count",  operator: ">",  value: "5" },                      // key absent → ?? []
      { criteria: "track",  operator: "==", value: [1],      parsed: ["track==1"] }
    ];

    expect(save(mixed, JOIN_OPERATORS.ALL).parsedFilter).toEqual([
      "name==alice",
      "track==1"
    ]);

    expect(save(mixed, JOIN_OPERATORS.ANY).parsedFilter).toEqual([
      "or(name==alice)",
      "or(track==1)"
    ]);
  });
});

// ─── state shape ─────────────────────────────────────────────────────────────

describe("filter-reducer – state shape", () => {
  test("stores id, filterValues, and joinOperator", () => {
    const filters = [{ criteria: "name", operator: "==", value: "a", parsed: ["name==a"] }];
    const state = save(filters, JOIN_OPERATORS.ALL, { id: "my-filter" });

    expect(state.id).toBe("my-filter");
    expect(state.filterValues).toBe(filters);
    expect(state.joinOperator).toBe(JOIN_OPERATORS.ALL);
  });

  test("treats non-array filters as empty via safeFilters fallback", () => {
    const state = save(null, JOIN_OPERATORS.ALL);
    expect(state.filterValues).toEqual([]);
    expect(state.parsedFilter).toEqual([]);
  });
});

// ─── default case ─────────────────────────────────────────────────────────────

describe("filter-reducer – default case", () => {
  test("returns the existing state reference unchanged for unknown actions", () => {
    const initial = filterReducer(undefined, { type: "@@INIT" });
    expect(filterReducer(initial, { type: "UNKNOWN" })).toBe(initial);
  });
});
