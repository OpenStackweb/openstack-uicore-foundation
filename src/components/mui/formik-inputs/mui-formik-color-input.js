import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useField } from "formik";
import { DEBOUNCE_WAIT_150 } from "../../../utils/constants";

const MuiFormikColorInput = ({ name, placeholder = "Select a color", ...rest }) => {
  const [field, meta, helpers] = useField(name);
  const [hasValue, setHasValue] = useState(Boolean(field.value));
  const [localValue, setLocalValue] = useState(field.value || "#000000");
  const debounceRef = useRef(null);

  useEffect(() => {
    setHasValue(Boolean(field.value));
    if (field.value && field.value !== localValue) setLocalValue(field.value);
  }, [field.value]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);
    setHasValue(true);
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
      helpers.setValue(hasValue ? localValue : "");
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setHasValue(false);
    helpers.setValue("");
    helpers.setTouched(true);
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <TextField
        type="color"
        name={field.name}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        fullWidth
        InputProps={hasValue ? {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} edge="end" disableRipple>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        } : undefined}
        sx={{
          "& input[type='color']::-webkit-color-swatch-wrapper": { padding: "2px" },
        }}
        {...rest}
      />
      {!hasValue && (
        <Box
          sx={{
            position: "absolute",
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            borderRadius: "3px",
            bgcolor: "background.paper",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            px: "14px",
            gap: 1,
          }}
        >
          <Box component="span" sx={{ color: "text.disabled" }}>
            {placeholder}
          </Box>
        </Box>
      )}
    </Box>
  );
};

MuiFormikColorInput.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string
};

export default MuiFormikColorInput;
