import React from "react";
import PropTypes from "prop-types";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText
} from "@mui/material";
import RawHTML from "../../raw-html";
import { getLabel, toSlug } from "./utils";

const CheckboxQuestionField = ({
  question,
  questionClassName = "",
  isDisabled = false,
  children,
  value,
  error,
  helperText,
  setFieldValue,
  ...rest
}) => {
  const questionSlug = toSlug(question.name, question.id);
  const questionLabel = getLabel(question);
  const isRequired = question.mandatory;

  return (
    <div
      key={questionSlug}
      id={`${questionSlug}_container`}
      className={questionClassName}
    >
      <FormControl fullWidth margin="normal" error={error}>
        <FormControlLabel
          sx={{ alignItems: "flex-start" }}
          control={
            <Checkbox
              name={questionSlug}
              checked={!!value}
              label={<RawHTML>{questionLabel}</RawHTML>}
              sx={{ marginTop: -1 }}
              /* eslint-disable-next-line react/jsx-props-no-spreading */
              {...rest}
            />
          }
          label={<RawHTML>{questionLabel}</RawHTML>}
          disabled={isDisabled}
          required={isRequired}
        />
        {children}
        {error && <FormHelperText>{helperText ?? " "}</FormHelperText>}
      </FormControl>
    </div>
  );
};

CheckboxQuestionField.propTypes = {
  question: PropTypes.object.isRequired,
  value: PropTypes.bool,
  questionClassName: PropTypes.string,
  isDisabled: PropTypes.bool,
  children: PropTypes.node,
  setFieldValue: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string
};

export default CheckboxQuestionField;
