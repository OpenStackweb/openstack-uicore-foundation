import SummitVenuesSelect from "../../src/components/inputs/summit-venues-select";

export default {
  title: "Core/Inputs/SummitVenuesSelect",
  component: SummitVenuesSelect,
  argTypes: { onVenueChanged: { action: "venueChanged" } }
};

const venues = [
  { label: "Moscone Center", value: { id: 1, name: "Moscone Center", class_name: "SummitVenue" } },
  { label: "Hall A", value: { id: 2, name: "Hall A", class_name: "SummitVenueRoom" } },
  { label: "Hall B", value: { id: 3, name: "Hall B", class_name: "SummitVenueRoom" } }
];

export const Default = {
  args: { venues, currentValue: { id: 1 }, placeholder: "Select a venue" }
};
