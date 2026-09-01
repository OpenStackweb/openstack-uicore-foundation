import SummitsDropdown from "../src/components/mui/summits-dropdown";

export default {
  title: "MUI/API-backed/SummitsDropdown",
  component: SummitsDropdown,
  argTypes: { onChange: { action: "changed" } },
  parameters: {
    docs: {
      description: {
        component:
          "`summits` has no default and is read during the first render, so it must always be passed even though propTypes does not mark it required — omitting it throws before the useEffect fetch ever runs. Pass [] to opt into the fetch path, or a populated array to skip it."
      }
    }
  }
};

// [] opts into the fetch path; no API is reachable from Storybook, so it stays empty
export const FetchesOnMount = { args: { summits: [], label: "Search by show" } };

export const WithSummitsProvided = {
  args: {
    label: "Search by show",
    summits: [
      { id: 1, name: "FN Summit 2026" },
      { id: 2, name: "FN Summit 2025" }
    ]
  }
};
