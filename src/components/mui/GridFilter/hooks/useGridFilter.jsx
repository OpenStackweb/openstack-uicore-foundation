import { useDispatch, useSelector } from "react-redux";
import { saveFilters } from "../actions/filter-actions";
import { JOIN_OPERATORS } from "../utils";

const useGridFilter = (id) => {
  const dispatch = useDispatch();
  const allFilters = useSelector(
    (state) => state.allGridFiltersState?.allFilters ?? []
  );
  const filter = allFilters.find((f) => f.id === id) || {};
  const {
    filterValues = [],
    joinOperator = JOIN_OPERATORS.ALL,
    parsedFilter = []
  } = filter;

  const valuesWithIds = filterValues.map((v, i) => ({
    ...v,
    id: `${v.criteria}-${i}`
  }));

  const resetFilters = () => dispatch(saveFilters(id));

  // Lets the host push filters into the store from outside the dialog —
  // e.g. applying a previously saved filter. The shape it expects matches
  // what GridFilter persists itself: [{ criteria, operator, value, parsed }],
  // so a saved filter's `criteria` array (as returned by the API) can be
  // passed through directly.
  const setFilters = (filters = [], joinOperator = JOIN_OPERATORS.ALL) => {
    const validJoinOperator = Object.values(JOIN_OPERATORS).includes(joinOperator)
      ? joinOperator
      : JOIN_OPERATORS.ALL;
    dispatch(saveFilters(id, filters, validJoinOperator));
  };

  return {
    filterValues,
    filterCount: filterValues.length,
    joinOperator,
    parsedFilter,
    valuesWithIds,
    resetFilters,
    setFilters
  };
};

export default useGridFilter;
