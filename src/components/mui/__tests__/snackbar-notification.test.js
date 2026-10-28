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
  clearConsumedSnackbarMessage: jest.fn()
}));

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMemoryHistory } from "history";
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
      <SnackbarNotification clearConsumedSnackbarMessage={jest.fn()}>
        <div>Child content</div>
      </SnackbarNotification>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  test("shows snackbar when snackbarMessage has html content", () => {
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Operation successful!", type: "success" }}
        clearConsumedSnackbarMessage={jest.fn()}
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
        clearConsumedSnackbarMessage={jest.fn()}
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
        clearConsumedSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    // The snackbar should not be open
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("copies an error as plain text with its details", async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <SnackbarNotification
        snackbarMessage={{
          html: "Start date is required.<br>End date is invalid.<br>",
          type: "warning",
          details: "Request: PUT /api/v1/summits/1 (412)"
        }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    fireEvent.click(screen.getByLabelText("general.copy_error"));

    expect(writeText).toHaveBeenCalledWith(
      "Start date is required.\nEnd date is invalid.\n\nRequest: PUT /api/v1/summits/1 (412)"
    );
    // let the copied state settle inside the test
    await screen.findByTestId("CheckIcon");
  });

  test("shows the check mark only after the clipboard accepts the text", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Not found", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    fireEvent.click(screen.getByLabelText("general.copy_error"));

    expect(await screen.findByTestId("CheckIcon")).toBeInTheDocument();
  });

  test("says the copy failed when the clipboard rejects it", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("blocked")) } });
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Not found", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    const button = screen.getByLabelText("general.copy_error");
    fireEvent.click(button);
    fireEvent.mouseOver(button);

    expect(await screen.findByText("general.copy_failed")).toBeInTheDocument();
    expect(screen.queryByTestId("CheckIcon")).not.toBeInTheDocument();
  });

  test("clears the copied state when a new message with the same text shows", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
    const { rerender } = render(
      <SnackbarNotification
        snackbarMessage={{ html: "Not found", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );
    fireEvent.click(screen.getByLabelText("general.copy_error"));
    await screen.findByTestId("CheckIcon");

    // a repeat only shows once the copied one is closed
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    rerender(
      <SnackbarNotification
        snackbarMessage={{ html: "Not found", type: "warning" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    expect(await screen.findByLabelText("general.copy_error")).toBeInTheDocument();
    expect(screen.queryByTestId("CheckIcon")).not.toBeInTheDocument();
  });

  test("keeps only the close button on a success message", () => {
    render(
      <SnackbarNotification
        snackbarMessage={{ html: "Saved", type: "success" }}
        clearSnackbarMessage={jest.fn()}
      >
        <div>App</div>
      </SnackbarNotification>
    );

    expect(screen.queryByLabelText("general.copy_error")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  describe("pinned and grouped errors", () => {
    const errorA = { html: "First error", type: "warning" };
    const errorB = { html: "Second error", type: "error" };
    let clearConsumedSnackbarMessage;

    const ui = (snackbarMessage) => (
      <SnackbarNotification
        snackbarMessage={snackbarMessage}
        clearConsumedSnackbarMessage={clearConsumedSnackbarMessage}
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

    const openDetails = () =>
      fireEvent.click(
        screen.getByRole("button", {
          name: "snackbar_notification.view_details"
        })
      );

    beforeEach(() => {
      jest.useFakeTimers();
      clearConsumedSnackbarMessage = jest.fn();
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

    test("closes every error in the group at once", () => {
      const { rerender } = render(ui(errorA));
      rerender(ui(errorB));
      advance(1000);

      close();
      advance(1000);
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
      expect(screen.queryByText("Second error")).not.toBeInTheDocument();
    });

    test("clears the redux message as soon as it is read", () => {
      render(ui(errorA));
      expect(clearConsumedSnackbarMessage).toHaveBeenCalledWith(errorA);
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    test("shows an error that arrives while the group fades out", () => {
      const { rerender } = render(ui(errorA));
      close();
      rerender(ui(errorB));
      // the fading snackbar keeps its own text
      expect(screen.queryByText("Second error")).not.toBeInTheDocument();
      advance(1000);
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
      expect(screen.getByText("Second error")).toBeInTheDocument();
    });

    test("closes one snackbar per Escape press", () => {
      const { rerender } = render(ui(errorA));
      rerender(ui({ html: "Saved", type: "success" }));
      advance(0);

      fireEvent.keyDown(document, { key: "Escape" });
      advance(1000);
      expect(screen.getAllByRole("alert")).toHaveLength(1);
    });

    test("shows a success next to an error without waiting", () => {
      const { rerender } = render(ui(errorA));
      rerender(ui({ html: "Saved", type: "success" }));
      advance(1000);
      expect(screen.getByText("First error")).toBeInTheDocument();
      expect(screen.getByText("Saved")).toBeInTheDocument();

      advance(NOTIFICATION_TIMEOUT);
      advance(1000);
      expect(screen.getByText("First error")).toBeInTheDocument();
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();

      // closing the error doesn't bring back the old success
      close();
      advance(1000);
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    });

    test("gives a waiting success its own full timeout", () => {
      const { rerender } = render(ui({ html: "Saved", type: "success" }));
      advance(NOTIFICATION_TIMEOUT - 100);
      rerender(ui({ html: "Saved again", type: "success" }));
      // one tick for the auto-hide, one for the exit transition
      advance(1000);
      advance(1000);
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();
      advance(NOTIFICATION_TIMEOUT / 2);
      expect(screen.getByText("Saved again")).toBeInTheDocument();

      advance(NOTIFICATION_TIMEOUT);
      advance(1000);
      expect(screen.queryByText("Saved again")).not.toBeInTheDocument();
    });

    test("ignores a repeat success while the first is still on screen", () => {
      const saved = { html: "Saved", type: "success" };
      const { rerender } = render(ui(saved));
      advance(2000);
      rerender(ui({ ...saved }));
      // one tick for the auto-hide, one for the exit transition
      advance(NOTIFICATION_TIMEOUT - 2000);
      advance(1000);
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    });

    test("groups two errors from the same render, newest first", () => {
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
          clearConsumedSnackbarMessage={clearConsumedSnackbarMessage}
        >
          <TwoErrors />
        </SnackbarNotification>
      );

      fireEvent.click(screen.getByText("send"));
      openDetails();
      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent("Second error");
      expect(items[1]).toHaveTextContent("First error");
    });

    test("ignores a repeat within the dedupe window", () => {
      const { rerender } = render(ui(errorA));
      rerender(ui({ ...errorA }));
      advance(1000);

      close();
      advance(1000);
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });

    test("shows a repeat that arrives after the error is closed", () => {
      const { rerender } = render(ui(errorA));
      close();
      rerender(ui({ ...errorA }));
      advance(1000);

      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    test("groups a repeat that arrives after the dedupe window", () => {
      const { rerender } = render(ui(errorA));
      advance(NOTIFICATION_DEDUPE_WINDOW);
      rerender(ui({ ...errorA }));
      advance(1000);

      openDetails();
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    test("ignores a blank message so the next one still shows", () => {
      const BlankThenError = () => {
        const { errorMessage } = useSnackbarMessage();
        return (
          <button
            type="button"
            onClick={() => {
              errorMessage("");
              errorMessage("First error");
            }}
          >
            send
          </button>
        );
      };
      render(
        <SnackbarNotification
          snackbarMessage={null}
          clearConsumedSnackbarMessage={clearConsumedSnackbarMessage}
        >
          <BlankThenError />
        </SnackbarNotification>
      );

      fireEvent.click(screen.getByText("send"));
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    describe("on a page change", () => {
      let history;

      const page = (snackbarMessage, children = <div>App</div>) => (
        <SnackbarNotification
          snackbarMessage={snackbarMessage}
          clearConsumedSnackbarMessage={clearConsumedSnackbarMessage}
          history={history}
        >
          {children}
        </SnackbarNotification>
      );

      const changePage = (path) =>
        act(() => {
          history.push(path);
        });

      beforeEach(() => {
        history = createMemoryHistory();
      });

      test("closes an error", () => {
        render(page(errorA));
        changePage("/other");
        advance(1000);
        expect(screen.queryByText("First error")).not.toBeInTheDocument();
      });

      test("keeps a success", () => {
        render(page({ html: "Saved", type: "success" }));
        changePage("/other");
        advance(1000);
        expect(screen.getByText("Saved")).toBeInTheDocument();
      });

      test("closes every error in the group", () => {
        const { rerender } = render(page(errorA));
        rerender(page(errorB));
        changePage("/other");
        advance(1000);
        expect(screen.queryByText("First error")).not.toBeInTheDocument();
        expect(screen.queryByText("Second error")).not.toBeInTheDocument();
      });

      test("shows an error after leaving a page with none on screen", () => {
        const { rerender } = render(page(null));
        changePage("/other");
        rerender(page(errorA));
        advance(1000);
        expect(screen.getByText("First error")).toBeInTheDocument();
      });

      test("keeps an error that arrives while the group fades out", () => {
        const { rerender } = render(page(errorA));
        close();
        rerender(page(errorB));
        changePage("/other");
        advance(1000);
        expect(screen.getByText("Second error")).toBeInTheDocument();
      });

      test("keeps an error the new page adds on mount", () => {
        const NewPage = () => {
          const { errorMessage } = useSnackbarMessage();
          React.useEffect(() => {
            errorMessage("Page error");
          }, []);
          return null;
        };
        const { rerender } = render(page(errorA));
        act(() => {
          history.push("/other");
          rerender(page(errorA, <NewPage />));
        });
        // one for the old error to exit, one for the new one to open
        advance(1000);
        advance(1000);
        expect(screen.getByText("Page error")).toBeInTheDocument();
      });
    });
  });
});
