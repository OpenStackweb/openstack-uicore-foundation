import InlineCard from "../src/components/mui/cards/InlineCard";

export default { title: "MUI/Cards/InlineCard", component: InlineCard };

export const Default = {
  args: {
    title: "Sponsor",
    rows: [
      { label: "Company", value: "Acme Corp" },
      { label: "Tier", value: "Diamond" },
      { label: "Contact", value: "casey@example.com" }
    ]
  }
};

