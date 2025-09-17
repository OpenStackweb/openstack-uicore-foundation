import React from "react";
import PropTypes from "prop-types";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel
} from "@mui/material";
import { getLabel, toSlug } from "./utils";

const CheckboxListQuestionField = ({
  question,
  questionClassName = "",
  isDisabled = false,
  children,
  value,
  onChange,
  setFieldValue,
  error,
  helperText,
  ...rest
}) => {
  const questionSlug = toSlug(question.name, question.id);
  const questionLabel = getLabel(question);
  const isRequired = question.mandatory;
  const questionMaxValues = question.max_selected_values;

  const questionOptions =
    question.values?.map((val) => ({
      label: val.label,
      value: val.id.toString()
    })) || [];

  const handleCheckboxListChange = (checked, val) => {
    const currentAns = value || [];
    const maxSelectionReached =
      questionMaxValues !== 0 && currentAns.length === questionMaxValues;
    let newValue;

    if (checked) {
      newValue = maxSelectionReached ? currentAns : [...currentAns, val];
    } else {
      newValue = currentAns.filter((v) => v !== val);
    }

    setFieldValue(questionSlug, newValue);
  };

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
        <FormLabel>{questionLabel}</FormLabel>
        {error && <FormHelperText>{helperText ?? " "}</FormHelperText>}
        <FormGroup>
          {questionOptions.map((op) => (
            <FormControlLabel
              key={op.label}
              name={questionSlug}
              control={
                <Checkbox
                  checked={value?.includes(op.value)}
                  onChange={(ev) =>
                    handleCheckboxListChange(ev.target.checked, op.value)
                  }
                  /* eslint-disable-next-line react/jsx-props-no-spreading */
                  {...rest}
                />
              }
              label={op.label}
            />
          ))}
        </FormGroup>
        {children}
      </FormControl>
    </div>
  );
};

CheckboxListQuestionField.propTypes = {
  question: PropTypes.object.isRequired,
  value: PropTypes.array,
  questionClassName: PropTypes.string,
  isDisabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
  setFieldValue: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string
};

export default CheckboxListQuestionField;
