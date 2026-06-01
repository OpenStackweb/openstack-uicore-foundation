## GRID FILTER

# set up

- Add `all-filters-reducer` to the host app store under the key `allGridFiltersState`
- The reducer is at `GridFilter/reducers/all-filters-reducer.js`

# usage

Mount `<GridFilter>` with a unique `id` and a `criterias` array. Each criteria defines the column key, display label, which operators are allowed, and how the value input should render.

| Prop               | Type      | Default | Description                                                   |
| ------------------ | --------- | ------- | ------------------------------------------------------------- |
| `id`               | `string`  | —       | Unique identifier; scopes filter state in the Redux store     |
| `criterias`        | `array`   | —       | Criteria definitions (see below)                              |
| `hideJoinOperators`| `bool`    | `false` | Hides the All / Any toggle so the join operator is fixed      |
| `onApply`          | `func`    | `()=>{}`| Called with `(filters, joinOperator)` when the user applies   |

```jsx
import { GridFilter, OPERATORS } from "components/GridFilter";

<GridFilter
  id="speakers-filter"
  criterias={[
    {
      key: "tracks",
      label: "Tracks",
      operators: [OPERATORS.IS, OPERATORS.LIKE],
      values: {
        type: "select",
        props: {
          options: [
            { value: 1, label: "OpenStack" },
            { value: 2, label: "FnTech" }
          ],
          multiple: true,
          placeholder: "Select Tracks"
        }
      }
    },
    {
      key: "selection_status",
      label: "Selection Status",
      operators: [OPERATORS.IS],
      values: {
        type: "select",
        props: {
          // options can also be a function — see "dynamic options" section below
          options: [...selectionStatusOptions],
          placeholder: "Filter by Selection Status"
        }
      },
      customParser: (f) => {
        const filter = [];
        if (f.value) {
          switch (f.value) {
            case "only_rejected":
              filter.push("has_rejected_presentations==true");
              filter.push("has_accepted_presentations==false");
              filter.push("has_alternate_presentations==false");
              break;
            case "only_accepted":
              filter.push("has_rejected_presentations==false");
              filter.push("has_accepted_presentations==true");
              filter.push("has_alternate_presentations==false");
              break;
            case "only_alternate":
              filter.push("has_rejected_presentations==false");
              filter.push("has_accepted_presentations==false");
              filter.push("has_alternate_presentations==true");
              break;
          }
        }
        return filter;
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
  ]}
  onApply={(filters, joinOperator) => {
    // joinOperator: "all" | "any"
    // filters: [{ criteria, operator, value, parsed }]
    // e.g.:
    // [
    //   { criteria: "tracks", operator: "==", value: [1, 2], parsed: ["tracks==1||2"] },
    //   { criteria: "sponsor", operator: "=@", value: "openstack", parsed: ["sponsor=@openstack"] }
    // ]
  }}
/>;
```

Use `OPERATORS` from `utils.js` when building `criterias` — this ensures only valid operator values are passed and avoids PropTypes warnings.

Available operators:

| Key              | Value | Label                    |
| ---------------- | ----- | ------------------------ |
| IS               | `==`  | is                       |
| IS_NOT           | `<>`  | is not                   |
| LIKE             | `=@`  | like                     |
| LIKE_START       | `@@`  | like start               |
| HAS              | `>>`  | has                      |
| HAS_NOT          | `!>>` | has not                  |
| LESS             | `<`   | less than                |
| LESS_OR_EQUAL    | `<=`  | less than or equal to    |
| GREATER          | `>`   | greater than             |
| GREATER_OR_EQUAL | `>=`  | greater than or equal to |
| BETWEEN          | `[]`  | between                  |
| BETWEEN_STRICT   | `()`  | between strict           |

# reading filter state (hook)

If you need to read the current filter state outside of `onApply` — for example to rehydrate the UI or build an API query — use the `useGridFilter` hook:

```js
import useGridFilter from "components/GridFilter/hooks/useGridFilter";

const { filterValues, parsedFilter, joinOperator, filterCount } =
  useGridFilter("speakers-filter");
```

| Return value   | Description                                         |
| -------------- | --------------------------------------------------- |
| `filterValues` | Raw filter array `[{ criteria, operator, value }]`  |
| `parsedFilter` | API-ready strings e.g. `["full_name=@john"]`        |
| `joinOperator` | `"all"` or `"any"`                                  |
| `filterCount`  | Number of active filters (useful for badge counts)  |
| `resetFilters` | Function — clears all active filters from the store |

The hook reads from `allGridFiltersState` in the Redux store, so it stays in sync with whatever was last applied via the dialog.

# hideJoinOperators

By default the dialog shows an **All / Any** toggle that lets the user choose whether filters are ANDed or ORed together. Pass `hideJoinOperators` to hide the toggle UI — but note that this **only removes the control from the dialog; it does not change the active join operator**. The dialog always initializes from the join operator last persisted in the Redux store (which defaults to `"all"` on first load). If the user previously applied filters with `"any"` and that value is still in the store, it will continue to be used when the toggle is hidden — silently producing OR-joined results.

If you need a guaranteed fixed join behavior after hiding the toggle, call `resetFilters()` (from `useGridFilter`) before or after mounting the component to flush the store back to `"all"`.

```jsx
<GridFilter
  id="speakers-filter"
  criterias={criterias}
  hideJoinOperators
  onApply={handleApply}
/>
```

# dynamic options

`values.props.options` accepts either a static array or a **function** `(currentValue) => options[]`. When a function is provided it is called on every render with the current filter value, so individual options can be disabled based on what the user has already selected.

Each option in the returned array may include a `disabled: true` field; the corresponding menu item will be rendered as non-selectable.

```jsx
{
  key: "selection_status",
  label: "Selection Status",
  operators: [OPERATORS.IS],
  values: {
    type: "select",
    props: {
      options: (currentValue) => {
        const combinedOptions = [
          "only_rejected", "only_accepted", "only_alternate",
          "accepted_alternate", "accepted_rejected", "alternate_rejected"
        ];
        const hasCombined =
          Array.isArray(currentValue) &&
          currentValue.some((v) => combinedOptions.includes(v));
        const hasSingle =
          Array.isArray(currentValue) &&
          currentValue.some((v) => !combinedOptions.includes(v));

        return selectionStatusOptions.map((opt) => ({
          ...opt,
          disabled:
            (hasCombined && !currentValue.includes(opt.value)) ||
            (hasSingle && combinedOptions.includes(opt.value))
        }));
      },
      placeholder: "Filter by Selection Status",
      multiple: true
    }
  }
}
```

A static array still works exactly as before — the function form is opt-in.

# custom parser

For criteria that require non-standard API encoding, provide a `customParser` function on the criteria object. It receives the filter and must return an array of API filter strings. See the `selection_status` example in the usage section above.
