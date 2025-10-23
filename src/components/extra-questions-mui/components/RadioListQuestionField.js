import React from "react";
import PropTypes from "prop-types";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import { getLabel, toSlug } from "./utils";

const RadioListQuestionField = ({
  question,
  questionClassName = "",
  isDisabled = false,
  children,
  error,
  helperText,
  setFieldValue,
  ...rest
}) => {
  const questionSlug = toSlug(question.name, question.id);
  const questionLabel = getLabel(question);
  const isRequired = question.mandatory;

  const questionOptions =
    question.values?.map((val) => ({
      label: val.label,
      value: val.id.toString()
    })) || [];

  return (
    <div
      key={questionSlug}
      id={`${questionSlug}_container`}
      className={questionClassName}
    >
      <FormControl
        disabled={isDisabled}
        required={isRequired}
        fullWidth
        margin="normal"
        error={error}
      >
        <FormLabel id={`${questionSlug}_label`}>{questionLabel}</FormLabel>
        {error && <FormHelperText>{helperText ?? " "}</FormHelperText>}
        <RadioGroup
          aria-labelledby={`${questionSlug}_label`}
          name={questionSlug}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...rest}
        >
          {questionOptions.map((op) => (
            <FormControlLabel
              key={op.label}
              value={op.value}
              control={<Radio />}
              label={op.label}
            />
          ))}
        </RadioGroup>
        {children}
      </FormControl>
    </div>
  );
};

RadioListQuestionField.propTypes = {
  question: PropTypes.object.isRequired,
  questionClassName: PropTypes.string,
  isDisabled: PropTypes.bool,
  children: PropTypes.node,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  setFieldValue: PropTypes.func
};

export default RadioListQuestionField;
