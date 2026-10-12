import React from "react";
import { FormikProvider, useFormik } from "formik";
import FormItemTable from "../src/components/mui/FormItemTable";
import { MOCK_FORM } from "./_form-item-fixture";

// FormItemTable reads values/touched/errors off a live formik instance and
// needs discount_type/discount_amount seeded, so it takes the real useFormik
// host rather than the generic withFormik decorator.
const Host = (props) => {
  const formik = useFormik({
    initialValues: { discount_type: "AMOUNT", discount_amount: 0 },
    onSubmit: () => {}
  });
  return (
    <FormikProvider value={formik}>
      <FormItemTable
        {...props}
        values={formik.values}
        touched={formik.touched}
        errors={formik.errors}
      />
    </FormikProvider>
  );
};

export default {
  title: "MUI/Forms/FormItemTable",
  component: FormItemTable,
  render: (args) => <Host {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "Data fixture is lifted from the component's own test suite. Rows whose quantity is driven by a Form-level Quantity field default to expanded."
      }
    }
  }
};

export const EarlyBird = {
  args: {
    data: MOCK_FORM.items,
    currentApplicableRate: "early_bird",
    timeZone: "America/New_York"
  }
};

export const Standard = {
  args: { ...EarlyBird.args, currentApplicableRate: "standard" }
};

export const Onsite = {
  args: { ...EarlyBird.args, currentApplicableRate: "onsite" }
};
