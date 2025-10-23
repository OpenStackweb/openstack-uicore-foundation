import React from "react";
import PropTypes from "prop-types";
import { FormGroup, TextField } from "@mui/material";
import { getLabel, toSlug } from "./utils";

const TextQuestionField = ({
  question,
  questionClassName = "",
  isDisabled = false,
  children,
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
      <FormGroup>
        <TextField
          name={questionSlug}
          label={questionLabel}
          disabled={isDisabled}
          required={isRequired}
          fullWidth
          margin="normal"
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...rest}
        />
        {children}
      </FormGroup>
    </div>
  );
};

TextQuestionField.propTypes = {
  question: PropTypes.object.isRequired,
  questionClassName: PropTypes.string,
  isDisabled: PropTypes.bool,
  children: PropTypes.node,
  setFieldValue: PropTypes.func
};

export default TextQuestionField;
