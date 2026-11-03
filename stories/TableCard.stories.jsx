import TableCard from "../src/components/mui/cards/TableCard";

export default { title: "MUI/Cards/TableCard", component: TableCard };

export const Default = {
  args: {
    title: "Order lines",
    columns: [
      { columnKey: "name", header: "Item" },
      { columnKey: "quantity", header: "Qty", align: "right" },
      { columnKey: "price", header: "Price", align: "right" }
    ],
    rows: [
      { id: 1, name: "Diamond Sponsorship", quantity: 2, price: "$25,000" },
      { id: 2, name: "Booth 10x10", quantity: 1, price: "$8,000" }
    ]
  }
};

