import React from "react";
import { useField } from "formik";
import { InputLabel } from "@mui/material";
import TextEditorV3 from "../../inputs/editor-input-v3";
import { normalizeHtmlString } from "../../../utils/methods";

const FormikTextEditor = ({ name, options = {}, licence, ...props }) => {
  const [field, meta, helpers] = useField(name);
  const mergedOptions = { tabIndex: 0, allowTabNavigation: true, ...options };

  return (
    <>
      <InputLabel htmlFor={name}>
        {label}
      </InputLabel>
      <TextEditorV3
        id={name}
        value={field.value}
        options={mergedOptions}
        onChange={(e) => {
          const stringValue = normalizeHtmlString(e.target.value);
          helpers.setValue(stringValue);
        }}
        error={meta.touched && meta.error}
        license={licence}
        {...props}
      />
    </>
  );
};

export default FormikTextEditor;
