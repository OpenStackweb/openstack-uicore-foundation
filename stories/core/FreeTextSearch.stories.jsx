import FreeTextSearch from "../../src/components/free-text-search";

export default {
  title: "Core/Inputs/FreeTextSearch",
  component: FreeTextSearch,
  argTypes: { onSearch: { action: "search" } }
};

export const Default = { args: { value: "", placeholder: "Search attendees..." } };
export const WithTerm = { args: { value: "diamond", placeholder: "Search attendees..." } };
