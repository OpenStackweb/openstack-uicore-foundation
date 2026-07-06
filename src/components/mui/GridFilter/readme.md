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
| `setFilters`   | Function `(filters, joinOperator?) => void` — pushes filters into the store from outside the dialog |

The hook reads from `allGridFiltersState` in the Redux store, so it stays in sync with whatever was last applied via the dialog.

# setting filters from the host (e.g. applying a saved filter)

`setFilters(filters, joinOperator)` lets the host populate a `GridFilter`'s state without going through the dialog UI — for example, when the user picks a previously saved filter from some other "saved filters" feature. It writes straight to the Redux store under the hook's `id`, the same place `GridFilter` itself writes to on Apply.

`filters` must be an array shaped like `[{ criteria, operator, value, parsed }]` — the same shape `GridFilter` produces internally and the shape returned in `onApply`. `parsed` should already contain the resolved API filter strings (`GridFilter` does not re-run `customParser` for filters set this way, since it has no React component instance to read `criterias`/`customParser` from at that point).

If your saved filters are persisted via an API that round-trips exactly what `onApply` produced (criteria/operator/value/parsed per row), the saved `criteria` array can be passed to `setFilters` unmodified:

```js
import useGridFilter from "components/GridFilter/hooks/useGridFilter";

const { setFilters } = useGridFilter("speakers-filter");

const applySavedFilter = (savedFilter) => {
  setFilters(savedFilter.criteria);
};
```

Once set, `GridFilter`'s badge count and dialog rows pick the values up automatically (same as if the user had applied them by hand), and `parsedFilter` from the hook is immediately available to refetch data with — `setFilters` does not call `onApply`, so trigger any necessary refetch yourself after calling it.

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

# datetime values

For date/time criteria, use `type: "datetime"`. It renders a single MUI `DateTimePicker` and stores the value as a unix timestamp (seconds), consistent with how dates are represented elsewhere in this app. Use `props.mode` to control which views are shown — the stored value is always a unix timestamp regardless of mode.

| `mode`     | Shows         |
| ---------- | ------------- |
| `date`     | date only     |
| `time`     | time only     |
| `datetime` | date and time (default) |

A stored epoch carries no timezone of its own, so by default the picker displays and edits it in the browser's local zone. When the value actually represents a moment-specific time (e.g. a summit's schedule), pass `props.timezone` (an IANA zone name) so the admin sees and edits summit wall-clock time regardless of where their browser is:

```jsx
{
  key: "created",
  label: "Created",
  operators: [OPERATORS.BEFORE, OPERATORS.AFTER],
  values: {
    type: "datetime",
    props: { mode: "date", timezone: summit.time_zone_id }
  }
}
```

# numeric values

For numeric criteria, use `type: "number"`. It renders a `TextField` of `type="number"` and stores/emits the value as an actual `Number` (not a string). Optional props: `min`, `max` (clamped on change), and `integer` (blocks decimal entry and the `e`/`E` exponent keys).

```jsx
{
  key: "attendees",
  label: "Attendees",
  operators: [OPERATORS.GREATER, OPERATORS.LESS],
  values: {
    type: "number",
    props: { min: 0, integer: true }
  }
}
```

# async select values

For criteria backed by a remote search-as-you-type lookup, use `type: "asyncSelect"` (generic) or one of the preset entity types: `type: "speaker"` or `type: "company"`. These render a MUI `Autocomplete` and **always store the full selected option object** (or array of objects, when `multiple`) as `{ value, label, raw }` — `raw` is the untouched API entity, so a `customParser` can pull whatever field it needs (`.raw.id`, `.raw.name`, etc.).

**`customParser` is mandatory for these types** — there is no default/shipped parser, even for `speaker`/`company`. The default `parseFilter` only knows how to serialize plain scalars; an object run through it produces `criteria==[object Object]`. If a criteria uses an async type and has no `customParser`, `GridFilter` logs a `console.error` to catch the mistake early — it does not throw or block applying filters.

Common props (generic `asyncSelect`):

| Prop | Description |
| --- | --- |
| `queryFunction(input, callback)` | required — fetches results; `callback(rawItems)` receives a plain array of raw API objects |
| `formatOption(item) => {value, label}` | maps a raw item to display shape (default: `{value: item.id, label: item.name}`) |
| `multiple` | allow selecting more than one option |
| `debounceWait` | debounce delay in ms before querying on typing (default: `DEBOUNCE_WAIT_250`) |
| `minSearchLength` | skip querying until the input reaches this length (default: `0`) |

```jsx
{
  key: "created_by_company",
  label: "Submitter Company",
  operators: [OPERATORS.IS],
  values: {
    type: "company",
    props: { multiple: true }
  },
  customParser: (f) => [
    `created_by_company==${f.value.map((c) => escapeFilterValue(c.raw.name)).join("||")}`
  ]
}
```

`speaker` additionally accepts `summitId` (scopes the default query to a summit) and `company`/`speaker` both accept a `queryFunction` override for non-default scoped queries (e.g. `querySpeakerCompany`, `queryAllCompanies`):

```jsx
{
  key: "speaker_id",
  label: "Speaker",
  operators: [OPERATORS.IS],
  values: {
    type: "speaker",
    props: { summitId: currentSummit.id, multiple: true }
  },
  customParser: (f) => [
    `speaker_id==${f.value.map((s) => s.value).join("||")}`
  ]
}
```

# custom parser

For criteria that require non-standard API encoding, provide a `customParser` function on the criteria object. It receives the filter and must return an array of API filter strings. See the `selection_status` example in the usage section above.
