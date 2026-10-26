import FormikAsyncSelect from "../src/components/mui/formik-inputs/mui-formik-async-select";
import { withFormik } from "./_helpers";

const queryFunction = (term) =>
  Promise.resolve(
    [
      { id: 1, name: "Acme Corp" },
      { id: 2, name: "Globex" },
      { id: 3, name: "Initech" }
    ].filter((c) => c.name.toLowerCase().includes((term || "").toLowerCase()))
  );

export default {
  title: "MUI/Formik inputs/AsyncSelect",
  component: FormikAsyncSelect,
  decorators: [withFormik({ company: null })],
  parameters: {
    docs: { description: { component: "queryFunction is stubbed here with a local promise; in an app it hits the API." } }
  }
};

export const Default = { args: { name: "company", queryFunction, placeholder: "Search companies..." } };
export const Multiple = { args: { ...Default.args, isMulti: true, multiple: true } };

