import AdditionalInput from "../src/components/mui/formik-inputs/additional-input/additional-input";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/AdditionalInput",
  component: AdditionalInput,
  decorators: [
    withFormik({
      meta_fields: [
        { id: 1, name: "shirt_size", type: "ComboBox", values: [{ id: 1, value: "M" }] }
      ]
    })
  ],
  argTypes: { onAdd: { action: "add" }, onDelete: { action: "delete" }, onDeleteValue: { action: "delete-value" } }
};

export const Default = {
  args: {
    baseName: "meta_fields",
    itemIdx: 0,
    entityId: 1,
    item: { id: 1, name: "shirt_size", type: "ComboBox", values: [{ id: 1, value: "M" }] }
  }
};

