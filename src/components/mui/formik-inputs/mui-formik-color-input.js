import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import { useField } from "formik";
import { DEBOUNCE_WAIT_150 } from "../../../utils/constants";

const MuiFormikColorInput = ({ name, ...rest }) => {
  const [field, meta, helpers] = useField(name);
  const [localValue, setLocalValue] = useState(field.value || "#000000");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (field.value !== localValue) setLocalValue(field.value || "#000000");
  }, [field.value]);

  useEffect(() => () => {
    if (!field.value) helpers.setValue("#000000");
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      helpers.setValue(value);
      debounceRef.current = null;
    }, DEBOUNCE_WAIT_150);
  };

  const handleBlur = (e) => {
    field.onBlur(e);
    helpers.setTouched(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      helpers.setValue(localValue);
    }
  };

  return (
    <TextField
      type="color"
      name={field.name}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      fullWidth
      sx={{
        "& input[type='color']::-webkit-color-swatch-wrapper": {
          padding: "2px"
        }
      }}
      {...rest}
    />
  );
};

MuiFormikColorInput.propTypes = {
  name: PropTypes.string.isRequired
};

export default MuiFormikColorInput;
