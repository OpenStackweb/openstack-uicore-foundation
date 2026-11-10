/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React from "react";
import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, legacy_createStore as createStore } from "redux";
import thunk from "redux-thunk";
import SnackbarNotification from "../SnackbarNotification/index";
import {
  CLEAR_SNACKBAR_MESSAGE,
  SET_SNACKBAR_MESSAGE,
  setSnackbarMessage
} from "../../../utils/actions";

const baseState = (state = { snackbarMessage: null }, { type, payload }) => {
  if (type === SET_SNACKBAR_MESSAGE) return { snackbarMessage: payload };
  if (type === CLEAR_SNACKBAR_MESSAGE) return { snackbarMessage: null };
  return state;
};

// Unlike snackbar-notification.test.js, this runs the real react-redux connect(),
// so it fails if react-redux can't work on the installed React version.
describe("SnackbarNotification connected to a real redux store", () => {
  test("shows the message dispatched to the store", () => {
    const store = createStore(combineReducers({ baseState }), applyMiddleware(thunk));

    render(
      <Provider store={store}>
        <SnackbarNotification>
          <span>content</span>
        </SnackbarNotification>
      </Provider>
    );
    expect(screen.getByText("content")).toBeInTheDocument();

    act(() => {
      store.dispatch(setSnackbarMessage({ html: "Saved", type: "success" }));
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();
  });
});
