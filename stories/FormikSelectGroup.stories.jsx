import FormikSelectGroup from "../src/components/mui/formik-inputs/mui-formik-select-group";
import { withFormik } from "./_helpers";

const queryFunction = () =>
  Promise.resolve([
    { id: 1, name: "Keynote Hall", group_id: 1, group_name: "Main venue" },
    { id: 2, name: "Breakout A", group_id: 1, group_name: "Main venue" },
    { id: 3, name: "Expo Floor", group_id: 2, group_name: "Expo" }
  ]);

export default {
  title: "MUI/Formik inputs/SelectGroup",
  component: FormikSelectGroup,
  decorators: [withFormik({ rooms: [] })]
};

export const Default = {
  args: {
    name: "rooms",
    queryFunction,
    placeholder: "Select rooms",
    showSelectAll: true,
    getGroupId: (i) => i.group_id,
    getGroupLabel: (i) => i.group_name
  }
};

