import { createAction } from "../../../../utils/actions";
import { JOIN_OPERATORS } from "../utils";

export const SAVE_FILTERS = "SAVE_FILTERS";
export const RESET_FILTERS = "RESET_FILTERS";

export const saveFilters =
  (id, filters = [], joinOperator = JOIN_OPERATORS.ALL) =>
  (dispatch) => {
    dispatch(createAction(SAVE_FILTERS)({ id, filters, joinOperator }));
  };

// Clears every persisted filter for every GridFilter id, not just one. None
// of them are inherently scoped to a host app's own notion of "context" (e.g.
// summit-admin's current summit), so a host dispatches this whenever that
// context changes instead of resetting each id it happens to know about.
export const resetAllFilters = () => (dispatch) => {
  dispatch(createAction(RESET_FILTERS)({}));
};
