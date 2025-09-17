/**
 * Copyright 2025 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React from "react";
import PropTypes from "prop-types";

import {
  toSlug,
  isAnswered,
  checkVisibility,
  checkRule
} from "./components/utils";
import {
  QuestionType_Checkbox,
  QuestionType_CheckBoxList,
  QuestionType_ComboBox,
  QuestionType_CountryComboBox,
  QuestionType_RadioButtonList,
  QuestionType_Text,
  QuestionType_TextArea
} from "./constants";
import TextQuestionField from "./components/TextQuestionField";
import CheckboxQuestionField from "./components/CheckboxQuestionField";
import RadioListQuestionField from "./components/RadioListQuestionField";
import CheckboxListQuestionField from "./components/CheckboxListQuestionField";
import DropdownQuestionField from "./components/DropdownQuestionField";

const getQuestionFieldComponent = (questionType) => {
  switch (questionType) {
    case QuestionType_TextArea:
    case QuestionType_Text: {
      return TextQuestionField;
    }
    case QuestionType_Checkbox: {
      return CheckboxQuestionField;
    }
    case QuestionType_RadioButtonList: {
      return RadioListQuestionField;
    }
    case QuestionType_CheckBoxList: {
      return CheckboxListQuestionField;
    }
    case QuestionType_CountryComboBox:
    case QuestionType_ComboBox: {
      return DropdownQuestionField;
    }
    default: {
      return React.Fragment;
    }
  }
};

const ExtraQuestionsMUI = ({
  extraQuestions,
  className = "extraQuestions",
  questionClassName = "extraQuestion",
  readOnly = false,
  allowEdit = true,
  formik
}) => {
  const renderRule = (rule, questionSlug) => {
    const ruleResult = checkRule(formik.values[questionSlug], rule);
    const isVisible = checkVisibility(rule, ruleResult);

    if (isVisible) {
      // eslint-disable-next-line no-use-before-define
      return renderQuestion(rule.sub_question);
    }

    return null;
  };

  const renderQuestion = (q) => {
    const questionSlug = toSlug(q.name, q.id);
    // disable field if edit isn't allowed and the questions is answered
    const isDisabled =
      (!allowEdit && isAnswered(formik.values[questionSlug])) || readOnly;
    const QuestionFieldComponent = getQuestionFieldComponent(q.type);

    const formikProps = {
      value: formik.values[questionSlug],
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      error:
        formik.touched[questionSlug] && Boolean(formik.errors[questionSlug]),
      helperText: formik.touched[questionSlug] && formik.errors[questionSlug],
      setFieldValue: formik.setFieldValue
    };

    return (
      <QuestionFieldComponent
        key={questionSlug}
        question={q}
        questionClassName={questionClassName}
        isDisabled={isDisabled}
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...formikProps}
      >
        {q.sub_question_rules?.map((rule) => renderRule(rule, questionSlug))}
      </QuestionFieldComponent>
    );
  };

  return <div className={className}>{extraQuestions.map(renderQuestion)}</div>;
};

ExtraQuestionsMUI.propTypes = {
  extraQuestions: PropTypes.array.isRequired,
  className: PropTypes.string,
  questionClassName: PropTypes.string,
  allowEdit: PropTypes.bool,
  readOnly: PropTypes.bool
};

export default ExtraQuestionsMUI;
