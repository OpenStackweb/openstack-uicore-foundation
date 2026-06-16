import { createAction } from "../../../../utils/actions";

export const SAVE_COLUMNS = "SAVE_COLUMNS";

export const saveColumns =
  (id, selectedColumns = []) =>
  (dispatch) => {
    dispatch(createAction(SAVE_COLUMNS)({ id, selectedColumns }));
  };
