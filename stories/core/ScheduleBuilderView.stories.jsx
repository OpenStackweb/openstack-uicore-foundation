import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ScheduleBuilderView from "../../src/components/schedule-builder-view";

export default {
  title: "Core/Display/ScheduleBuilderView",
  component: ScheduleBuilderView,
  // the host app provides the drag-drop context
  decorators: [
    (Story) => (
      <DndProvider backend={HTML5Backend}>
        <Story />
      </DndProvider>
    )
  ],
  argTypes: {
    onDayChanged: { action: "dayChanged" },
    onVenueChanged: { action: "venueChanged" },
    onScheduleEvent: { action: "scheduleEvent" },
    onUnPublishEvent: { action: "unPublishEvent" },
    onEditEvent: { action: "editEvent" },
    onClickSelected: { action: "clickSelected" },
    onMoveSingleEvent: { action: "moveSingleEvent" }
  }
};

// three-day summit, one room, times are unix epochs (UTC)
const DAY = 86400;
const START = 1781481600; // 2026-06-15 00:00 UTC

const summit = {
  id: 13,
  name: "Vancouver 2026",
  start_date: START,
  end_date: START + 3 * DAY - 1,
  time_zone_id: "UTC",
  time_zone: { name: "UTC" },
  locations: [
    {
      id: 2,
      name: "Hall A",
      class_name: "SummitVenueRoom",
      opening_hour: 900,
      closing_hour: 1800
    }
  ]
};

const scheduleEvents = [
  {
    id: 100,
    title: "Opening Keynote",
    start_date: START + 9 * 3600,
    end_date: START + 10 * 3600,
    location_id: 2
  }
];

export const Default = {
  args: {
    summit,
    trackSpaceTime: null,
    scheduleEvents,
    selectedEvents: [],
    currentDay: "2026-06-15",
    currentVenue: summit.locations[0],
    slotSize: 30,
    hideBulkSelect: true
  }
};
