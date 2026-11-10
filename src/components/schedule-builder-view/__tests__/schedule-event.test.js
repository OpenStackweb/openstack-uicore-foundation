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
 **/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ScheduleEvent from "../schedule-event";

const baseEvent = {
  id: 42,
  title: "Keynote",
  duration: 1800,
  start_date: 1700000000,
  end_date: 1700001800,
  is_published: true
};

const renderEvent = (props = {}) =>
  render(
    <DndProvider backend={HTML5Backend}>
      <ScheduleEvent
        event={baseEvent}
        initialTop={10}
        initialHeight={60}
        minHeight={10}
        maxHeight={600}
        canResize={() => true}
        allowResize
        allowDrag
        onResized={jest.fn()}
        {...props}
      />
    </DndProvider>
  );

describe("ScheduleEvent", () => {
  test("renders the id, title and duration", () => {
    renderEvent();
    expect(screen.getByText("42 - Keynote - 30 minutes")).toBeInTheDocument();
  });

  test("shows the title and description on hover when there is a description", async () => {
    const user = userEvent.setup();
    renderEvent({
      event: { ...baseEvent, description: "<p>Opening talk</p>" }
    });

    await user.hover(screen.getByText("42 - Keynote - 30 minutes"));

    expect(await screen.findByText("Opening talk")).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Keynote");
  });

  test("has no hover popup without a description", async () => {
    const user = userEvent.setup();
    renderEvent();

    await user.hover(screen.getByText("42 - Keynote - 30 minutes"));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  test("calls the action handlers with the event", async () => {
    const user = userEvent.setup();
    const onEditEvent = jest.fn();
    const onUnPublishEvent = jest.fn();
    const onMoveEvent = jest.fn();
    renderEvent({ onEditEvent, onUnPublishEvent, onMoveEvent });

    await user.click(screen.getByTitle("edit event"));
    await user.click(screen.getByTitle("unpublish event"));
    await user.click(screen.getByTitle("move event"));

    expect(onEditEvent).toHaveBeenCalledWith(baseEvent);
    expect(onUnPublishEvent).toHaveBeenCalledWith(baseEvent);
    expect(onMoveEvent).toHaveBeenCalledWith(baseEvent);
  });

  test("toggles selection through the checkbox", async () => {
    const user = userEvent.setup();
    const onClickSelected = jest.fn();
    renderEvent({ onClickSelected, selectedPublishedEvents: [42] });

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(onClickSelected).toHaveBeenCalledWith(baseEvent);
  });
});
