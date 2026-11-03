// lifted verbatim from src/components/mui/FormItemTable/__tests__/FormItemTable.test.js
export const MOCK_FORM = {
  items: [
    {
      form_item_id: 1,
      code: "INST",
      name: "Installation",
      rates: {
        early_bird: 15000,
        standard: 18800,
        onsite: 22400
      },
      meta_fields: [
        {
          type_id: 1,
          class_field: "Form",
          name: "Qty of People",
          type: "Quantity",
          minimum_quantity: 1,
          maximum_quantity: 4
        },
        {
          type_id: 2,
          class_field: "Form",
          name: "Hour x Person",
          type: "Quantity",
          minimum_quantity: 1,
          maximum_quantity: 8
        },
        {
          type_id: 3,
          class_field: "Form",
          name: "Arrival Time",
          type: "Time"
        },
        {
          type_id: 4,
          class_field: "Item",
          name: "Special Instructions",
          type: "Text",
          is_required: true
        }
      ]
    },
    {
      form_item_id: 2,
      code: "DISMANTLE",
      name: "Dismantle",
      rates: {
        early_bird: 15000,
        standard: 18800,
        onsite: 22400
      },
      meta_fields: [
        {
          type_id: 1,
          class_field: "Form",
          name: "Qty of People",
          type: "Quantity",
          minimum_quantity: 1,
          maximum_quantity: 4
        },
        {
          type_id: 2,
          class_field: "Form",
          name: "Hour x Person",
          type: "Quantity",
          minimum_quantity: 1,
          maximum_quantity: 8
        },
        {
          type_id: 3,
          class_field: "Form",
          name: "Arrival Time",
          type: "Time"
        }
      ]
    },
    {
      form_item_id: 3,
      code: "INST-MAN",
      name: "Installation Manpower",
      rates: {
        early_bird: 15000,
        standard: 18800,
        onsite: 22400
      },
      meta_fields: []
    },
    {
      form_item_id: 4,
      code: "DIS-MAN",
      name: "Dismantle Manpower",
      rates: {
        early_bird: 15000,
        standard: 18800,
        onsite: 22400
      },
      meta_fields: []
    }
  ]
};
