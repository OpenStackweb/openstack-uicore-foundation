import SearchInput from "../src/components/mui/search-input";

export default {
  title: "MUI/Inputs/SearchInput",
  component: SearchInput,
  argTypes: { onSearch: { action: "search" } }
};

export const Default = { args: { placeholder: "Search sponsors..." } };
export const WithTerm = { args: { term: "diamond", placeholder: "Search sponsors..." } };
export const Debounced = { args: { placeholder: "Type to search...", debounced: true } };

