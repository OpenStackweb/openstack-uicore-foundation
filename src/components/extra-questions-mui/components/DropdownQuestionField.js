import React from "react";
import PropTypes from "prop-types";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { getLabel, toSlug } from "./utils";

const DropdownQuestionField = ({
  question,
  questionClassName = "",
  isDisabled = false,
  setFieldValue,
  children,
  error,
  helperText,
  ...rest
}) => {
  const questionSlug = toSlug(question.name, question.id);
  const questionLabel = getLabel(question);
  const isRequired = question.mandatory;

  const questionOptions =
    question.values?.map((val) => ({
      label: val.label,
      value: val.id
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
        <InputLabel id={`${questionSlug}_label`}>{questionLabel}</InputLabel>
        <Select
          labelId={`${questionSlug}_label`}
          name={questionSlug}
          id={questionSlug}
          label={questionLabel}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...rest}
          style={{ marginBottom: 20 }}
        >
          {questionOptions.map((op) => (
            <MenuItem key={op.label} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </Select>
        {children}
      </FormControl>
    </div>
  );
};

DropdownQuestionField.propTypes = {
  question: PropTypes.object.isRequired,
  questionClassName: PropTypes.string,
  isDisabled: PropTypes.bool,
  children: PropTypes.node,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  setFieldValue: PropTypes.func
};

export default DropdownQuestionField;
