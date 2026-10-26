import { Provider } from "react-redux";
import {
  legacy_createStore as createStore,
  combineReducers,
  applyMiddleware
} from "redux";
import thunk from "redux-thunk";
import { ThemeProvider, createTheme } from "@mui/material";
// Legacy (non-MUI) components render `fa fa-*` icons and bootstrap classes. The
// consuming apps supply both: summit-admin imports this same font-awesome css in
// src/index.js, and links bootstrap 3.3.7 from its index.ejs — mirrored for the
// preview iframe in .storybook/preview-head.html.
import "font-awesome/css/font-awesome.css";
import "../src/i18n/i18n"; // side-effect: T.setTexts, else components render raw keys
import { genericReducers } from "../src/utils/reducers";
import allFiltersReducer from "../src/components/mui/GridFilter/reducers/all-filters-reducer";
import { MuiBaseCustomTheme } from "../src/components/mui/MuiBaseCustomTheme";

const theme = createTheme(MuiBaseCustomTheme);

// GridFilter reads allGridFiltersState; SnackbarNotification reads baseState and
// dispatches clearSnackbarMessage, which is a thunk — hence the middleware.
export const store = createStore(
  combineReducers({
    baseState: genericReducers,
    allGridFiltersState: allFiltersReducer
  }),
  applyMiddleware(thunk)
);

export const decorators = [
  (Story) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    </Provider>
  )
];

export const parameters = { controls: { expanded: true } };

// gives every component a generated Docs page (props table + live controls)
export const tags = ["autodocs"];
