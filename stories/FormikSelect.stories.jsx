import React from "react";
import { MenuItem } from "@mui/material";
import FormikSelect from "../src/components/mui/formik-inputs/mui-formik-select";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/Select",
  component: FormikSelect,
  decorators: [withFormik({ tier: "gold" })]
};

export const Default = {
  args: {
    name: "tier",
    label: "Tier",
    placeholder: "Select a tier",
    isClearable: true,
    children: [
      <MenuItem key="diamond" value="diamond">Diamond</MenuItem>,
      <MenuItem key="gold" value="gold">Gold</MenuItem>,
      <MenuItem key="silver" value="silver">Silver</MenuItem>
    ]
  }
};

