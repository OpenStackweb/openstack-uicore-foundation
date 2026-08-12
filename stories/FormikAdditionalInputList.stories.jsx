import AdditionalInputList from "../src/components/mui/formik-inputs/additional-input/additional-input-list";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/AdditionalInputList",
  component: AdditionalInputList,
  decorators: [
    withFormik({
      meta_fields: [
        { id: 1, name: "shirt_size", type: "ComboBox", values: [{ id: 1, value: "M" }] },
        { id: 2, name: "dietary", type: "Text", values: [] }
      ]
    })
  ],
  argTypes: { onDelete: { action: "delete" }, onDeleteValue: { action: "delete-value" } }
};

export const Default = { args: { name: "meta_fields", entityId: 1 } };

