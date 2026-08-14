import React from "react";
import GridFilter from "../src/components/mui/GridFilter/GridFilter";
import { OPERATORS } from "../src/components/mui/GridFilter/utils";

// criterias lifted from src/components/mui/GridFilter/readme.md
const criterias = [
  {
    key: "tracks",
    label: "Tracks",
    operators: [OPERATORS.IS, OPERATORS.LIKE],
    values: {
      type: "select",
      props: {
        options: [
          { value: 1, label: "OpenStack" },
          { value: 2, label: "FnTech" }
        ],
        multiple: true,
        placeholder: "Select Tracks"
      }
    }
  },
  {
    key: "selection_status",
    label: "Selection Status",
    operators: [OPERATORS.IS],
    values: {
      type: "select",
      props: {
        options: [
          { value: "accepted", label: "Accepted" },
          { value: "rejected", label: "Rejected" },
          { value: "alternate", label: "Alternate" }
        ],
        placeholder: "Filter by Selection Status"
      }
    }
  }
];

export default {
  title: "MUI/GridFilter",
  component: GridFilter,
  args: { criterias, hideJoinOperators: false },
  argTypes: { onApply: { action: "applied" } },
  parameters: { docs: { description: { component: "See src/components/mui/GridFilter/readme.md for the full criteria contract." } } }
};

// each story gets its own id — filter state is keyed by id in a store shared across stories
export const Default = { args: { id: "story-default" } };

export const JoinOperatorsHidden = {
  args: { id: "story-hidden-join", hideJoinOperators: true }
};

export const SingleCriteria = {
  args: { id: "story-single", criterias: [criterias[0]] }
};
