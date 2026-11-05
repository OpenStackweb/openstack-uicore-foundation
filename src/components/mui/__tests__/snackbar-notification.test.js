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

jest.mock("react-redux", () => ({
  connect: () => (Component) => Component
}));

jest.mock("../../../utils/actions", () => ({
  clearSnackbarMessage: jest.fn()
}));

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SnackbarNotification, {
  useSnackbarMessage
} from "../SnackbarNotification/index";
import {
  NOTIFICATION_DEDUPE_WINDOW,
  NOTIFICATION_TIMEOUT
} from "../../../utils/constants";

describe("SnackbarNotification", () => {
  test("renders children", () => {
    render(
      <SnackbarNotification clearSnackbarMessage={jest.fn()}>
        <div>Child content</div>
      </SnackbarNotification>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  test("shows snackbar when snackbarMessage has html content", () => {
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Operation successful!", type: "success" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    expect(screen.getByText("Operation successful!")).toBeInTheDocument();
  });

  test("shows error snackbar when type is warning", () => {
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Something went wrong", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  test("does not show snackbar when snackbarMessage is null", () => {
    render(
      <SnackbarNotification
        snackbarMessage={null}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    // The snackbar should not be open
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  describe("pinned errors and replacement", () => {
    const errorA = { html: "First error", type: "warning" };
    const errorB = { html: "Second error", type: "error" };
    const errorC = { html: "Third error", type: "error" };
    let clearSnackbarMessage;

    const ui = (snackbarMessage) => (
      <SnackbarNotification
        snackbarMessage={snackbarMessage}
        clearSnackbarMessage={clearSnackbarMessage}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    const advance = (ms) =>
      act(() => {
        jest.advanceTimersByTime(ms);
      });

    const close = () =>
      fireEvent.click(screen.getByRole("button", { name: /close/i }));

    beforeEach(() => {
      jest.useFakeTimers();
      clearSnackbarMessage = jest.fn();
    });
    afterEach(() => jest.useRealTimers());

    test("keeps an error open after the auto-hide timeout", () => {
      render(ui(errorA));
      advance(NOTIFICATION_TIMEOUT);
      advance(1000);
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    test("still auto-hides a success message", () => {
      render(ui({ html: "Saved", type: "success" }));
      advance(NOTIFICATION_TIMEOUT);
      advance(1000);
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    });

    test("does not close an error on a click elsewhere", () => {
      render(ui(errorA));
      advance(0);
      fireEvent.click(screen.getByText("App"));
      advance(500);
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    test("replaces the message on screen with a new one", () => {
      const { rerender } = render(ui(errorA));
      rerender(ui(errorB));
      advance(1000);

      expect(screen.queryByText("First error")).not.toBeInTheDocument();
      expect(screen.getByText("Second error")).toBeInTheDocument();
    });

    test("keeps an error on screen when a success arrives", () => {
      const { rerender } = render(ui(errorA));
      rerender(ui({ html: "Saved", type: "success" }));
      advance(NOTIFICATION_TIMEOUT);
      expect(screen.getByText("First error")).toBeInTheDocument();
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();

      close();
      advance(1000);
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });

    test("gives a replacement success its own full timeout", () => {
      const { rerender } = render(ui({ html: "Saved", type: "success" }));
      advance(NOTIFICATION_TIMEOUT - 100);
      rerender(ui({ html: "Saved again", type: "success" }));
      advance(500);
      advance(NOTIFICATION_TIMEOUT - 500);
      expect(screen.getByText("Saved again")).toBeInTheDocument();

      // one tick for the auto-hide, one for the exit transition
      advance(1000);
      advance(1000);
      expect(screen.queryByText("Saved again")).not.toBeInTheDocument();
    });

    test("shows a message that arrives mid-close before the next one", () => {
      const { rerender } = render(ui(errorA));
      rerender(ui(errorB));
      rerender(ui(errorC));
      advance(1000);
      expect(screen.getByText("Second error")).toBeInTheDocument();

      advance(1000);
      expect(screen.queryByText("Second error")).not.toBeInTheDocument();
      expect(screen.getByText("Third error")).toBeInTheDocument();
    });

    test("replaces an error with a newer error queued before a success", () => {
      const ErrorsThenSuccess = () => {
        const { successMessage, errorMessage } = useSnackbarMessage();
        return (
          <button
            type="button"
            onClick={() => {
              errorMessage("First error");
              errorMessage("Second error");
              successMessage("Saved");
            }}
          >
            send
          </button>
        );
      };
      render(
        <SnackbarNotification
          snackbarMessage={null}
          clearSnackbarMessage={clearSnackbarMessage}
        >
          <ErrorsThenSuccess />
        </SnackbarNotification>
      );

      fireEvent.click(screen.getByText("send"));
      advance(1000);
      advance(NOTIFICATION_TIMEOUT);

      expect(screen.queryByText("First error")).not.toBeInTheDocument();
      expect(screen.getByText("Second error")).toBeInTheDocument();
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    });

    test("shows both in order when two arrive in the same render", () => {
      const TwoErrors = () => {
        const { errorMessage } = useSnackbarMessage();
        return (
          <button
            type="button"
            onClick={() => {
              errorMessage("First error");
              errorMessage("Second error");
            }}
          >
            send
          </button>
        );
      };
      render(
        <SnackbarNotification
          snackbarMessage={null}
          clearSnackbarMessage={clearSnackbarMessage}
        >
          <TwoErrors />
        </SnackbarNotification>
      );

      fireEvent.click(screen.getByText("send"));
      expect(screen.getByText("First error")).toBeInTheDocument();

      advance(1000);
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
      expect(screen.getByText("Second error")).toBeInTheDocument();
    });

    test("ignores a repeat within the dedupe window", () => {
      const { rerender } = render(ui(errorA));
      rerender(ui({ ...errorA }));
      advance(1000);

      expect(clearSnackbarMessage).not.toHaveBeenCalled();
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    test("shows a repeat that arrives after the error is closed", () => {
      const { rerender } = render(ui(errorA));
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      rerender(ui({ ...errorA }));
      advance(1000);

      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    test("replaces with a repeat that arrives after the dedupe window", () => {
      const { rerender } = render(ui(errorA));
      advance(NOTIFICATION_DEDUPE_WINDOW);
      rerender(ui({ ...errorA }));
      advance(1000);

      expect(clearSnackbarMessage).toHaveBeenCalledTimes(1);
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    test("ignores a blank message so the next one still shows", () => {
      const BlankThenSuccess = () => {
        const { successMessage, errorMessage } = useSnackbarMessage();
        return (
          <button
            type="button"
            onClick={() => {
              errorMessage("");
              successMessage("Saved");
            }}
          >
            send
          </button>
        );
      };
      render(
        <SnackbarNotification
          snackbarMessage={null}
          clearSnackbarMessage={clearSnackbarMessage}
        >
          <BlankThenSuccess />
        </SnackbarNotification>
      );

      fireEvent.click(screen.getByText("send"));
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });

    describe("on a page change", () => {
      // jsdom has no Navigation API, so fake its event
      const changePage = (path) =>
        act(() => {
          window.history.pushState({}, "", path);
          window.navigation.dispatchEvent(new Event("currententrychange"));
        });

      beforeEach(() => {
        window.navigation = new EventTarget();
      });
      afterEach(() => {
        delete window.navigation;
        window.history.pushState({}, "", "/");
      });

      test("closes an error", () => {
        render(ui(errorA));
        changePage("/other");
        advance(1000);
        expect(screen.queryByText("First error")).not.toBeInTheDocument();
      });

      test("keeps a success", () => {
        render(ui({ html: "Saved", type: "success" }));
        changePage("/other");
        advance(1000);
        expect(screen.getByText("Saved")).toBeInTheDocument();
      });

      test("drops an error waiting behind the message on screen", () => {
        const { rerender } = render(ui({ html: "Saved", type: "success" }));
        rerender(ui(errorA));
        changePage("/other");
        advance(1000);
        expect(screen.queryByText("First error")).not.toBeInTheDocument();
      });
    });
  });
});
