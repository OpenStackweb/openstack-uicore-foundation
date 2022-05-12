/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import RawHTML from '../raw-html'
import Input from '../inputs/text-input'
import Dropdown from '../inputs/dropdown'
import RadioList from '../inputs/radio-list'
import CheckboxList from '../inputs/checkbox-list'

import { Form, Field } from "react-final-form";

const ExtraQuestionsForm = ({ extraQuestions, userAnswers, onAnswerChanges, className }) => {

  let submit = null;

  const questionRef = useRef([]);

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    formatUserAnswers();
  }, [extraQuestions])

  const formatUserAnswers = () => {
    let formattedAnswers = {}
    extraQuestions.forEach(question => {
      question.sub_question_rules.forEach(({ sub_question }) => {
        let userAnswer = userAnswers.find(a => a.question_id === sub_question.id).value;
        if (sub_question.type === 'RadioButtonList' || sub_question.type === 'ComboBox') userAnswer = parseInt(userAnswer);
        if (sub_question.type === 'CheckBoxList') userAnswer = userAnswer.split(',').map(ansVal => parseInt(ansVal)) || [];
        formattedAnswers[`${sub_question.name}`] = userAnswer || '';
      })
      let userAnswer = userAnswers.find(a => a.question_id === question.id).value;
      if (question.type === 'RadioButtonList' || question.type === 'ComboBox') userAnswer = parseInt(userAnswer);
      if (question.type === 'CheckBoxList') userAnswer = userAnswer.split(',').map(ansVal => parseInt(ansVal)) || [];
      formattedAnswers[`${question.name}`] = userAnswer || '';
    });
    setAnswers(formattedAnswers);
  }

  const Condition = ({ when, rule, children }) => (
    <Field name={when} subscription={{ value: true }}>
      {({ input: { value } }) =>
        checkVisibility(rule, checkRule(value, rule), children)
      }
    </Field>
  );

  const Error = ({ name }) => (
    <Field name={name} subscription={{ error: true, touched: true }}>
      {({ meta: { error, touched } }) =>
        error && touched ? <span>{error}</span> : null
      }
    </Field>
  );

  const checkRule = (value, rule) => {
    let values = rule.answer_values;

    if (Array.isArray(value)) {
      if (!value.length) return false;
      let res = rule.anwer_values_operator === "And";
      values.forEach((v) => {
        if (rule.anwer_values_operator === "And") {
          res = res && value.includes(v);
        } else {
          // Or
          res = res || value.includes(v);
        }
      });
      return res;
    }
    return values.includes(value.toString());
  };

  const checkVisibility = (rule, ruleResult, children) => {
    if (rule.visibility === "Visible") {
      if (rule.visibility_condition === "Equal") {
        return ruleResult ? children : null;
      } else {
        return !ruleResult ? children : null;
      }
    }
    // not visible
    if (rule.visibility_condition === "Equal") {
      return ruleResult ? null : children;
    } else {
      return !ruleResult ? null : children;
    }
  };

  const renderQuestion = (q, ref) => {
    let questionValues = q.values;
    // @see https://codesandbox.io/s/vg05y?file=/index.js
    if (q.type === "Text") {
      return (
        <>
          <div key={q.id} ref={el => questionRef.current[q.id] = el}>
            <RawHTML>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
            <Field name={q.name}>
              {props => (
                <Input
                  id={q.id}
                  value={props.input.value}
                  onChange={props.input.onChange}
                  placeholder={q.placeholder}
                />
              )}
            </Field>
            <Error name={q.name} />
          </div>
          {q.sub_question_rules?.length > 0 &&
            q.sub_question_rules.map((r) => {
              return (
                <Condition when={q.name} rule={r}>
                  {renderQuestion(r.sub_question)}
                </Condition>
              );
            })}
        </>
      );
    }
    if (q.type === "TextArea") {
      return (
        <>
          <div key={q.id} ref={el => questionRef.current[q.id] = el}>
            <RawHTML>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
            <Field name={q.name} component="textarea" />
            <Error name={q.name} />
          </div>
          {q.sub_question_rules?.length > 0 &&
            q.sub_question_rules.map((r) => {
              return (
                <Condition when={q.name} rule={r}>
                  {renderQuestion(r.sub_question)}
                </Condition>
              );
            })}
        </>
      );
    }
    if (q.type === "CheckBox") {
      return (
        <>
          <div key={q.id} ref={el => questionRef.current[q.id] = el}>
            <Field name={q.name} component="input" type="checkbox" />
            <RawHTML>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
            <Error name={q.name} />
          </div>
          {q.sub_question_rules?.length > 0 &&
            q.sub_question_rules.map((r) => {
              return (
                <Condition when={q.name} rule={r}>
                  {renderQuestion(r.sub_question)}
                </Condition>
              );
            })}
        </>
      );
    }
    if (q.type === "RadioButtonList") {
      questionValues = questionValues.map(val => ({ ...val, value: val.id }));
      return (
        <>
          <div key={q.id} ref={el => questionRef.current[q.id] = el}>
            <RawHTML>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
            <div>
              <Field name={q.name}>
                {props => (
                  <Dropdown
                    id={q.id}
                    overrideCSS={true}
                    value={props.input.value}
                    options={questionValues}
                    onChange={props.input.onChange}
                  />
                )}
              </Field>
            </div>
          </div>
          {q.sub_question_rules?.length > 0 &&
            q.sub_question_rules.map((r) => {
              return (
                <Condition when={q.name} rule={r}>
                  {renderQuestion(r.sub_question)}
                </Condition>
              );
            })}
        </>
      );
    }
    if (q.type === "ComboBox") {
      questionValues = questionValues.map(val => ({ ...val, value: val.id }));
      return (
        <>
          <div key={q.id} ref={el => questionRef.current[q.id] = el}>
            <RawHTML>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
            <Field name={q.name}>
              {props => (
                <Dropdown
                  id={q.id}
                  overrideCSS={true}
                  value={props.input.value}
                  options={questionValues}
                  onChange={props.input.onChange}
                />
              )}
            </Field>
          </div>
          {q.sub_question_rules?.length > 0 &&
            q.sub_question_rules.map((r) => {
              return (
                <Condition when={q.name} rule={r}>
                  {renderQuestion(r.sub_question)}
                </Condition>
              );
            })}
        </>
      );
    }
    if (q.type === "CheckBoxList") {
      questionValues = questionValues.map(val => ({ ...val, value: val.id }));
      // const answerValue = getAnswer(question) ? getAnswer(question).split(',').map(ansVal => parseInt(ansVal)) : [];
      return (
        <>
          <div key={q.id} ref={el => questionRef.current[q.id] = el}>
            <RawHTML>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
            <Field name={q.name}>
              {props => (
                <CheckboxList
                  id={q.id}
                  value={props.input.value}
                  options={questionValues}
                  onChange={props.input.onChange}
                />
              )}
            </Field>
          </div>
          {q.sub_question_rules?.length > 0 &&
            q.sub_question_rules.map((r) => {
              return (
                <Condition when={q.name} rule={r}>
                  {renderQuestion(r.sub_question)}
                </Condition>
              );
            })}
        </>
      );
    }
    return null;
  };

  const isVisible = (q) => {
    return !!questionRef.current[q.id];
  };

  const validateQuestion = (q, values, errors) => {
    if (q.mandatory && isVisible(q)) {
      if (!values.hasOwnProperty(q.name) || values[q.name] === "") {
        errors[q.name] = "Required";
      }
    }
    // validate sub rules
    q.sub_question_rules?.forEach((r) => {
      validateQuestion(r.sub_question, values, errors);
    });
  };

  const onSubmit = (values) => {
    onAnswerChanges(values)
  };

  return (
    <div className={className}>
      <Form
        onSubmit={onSubmit}
        initialValues={answers}
        validate={(values) => {
          const errors = {};
          extraQuestions.map((q) => {
            validateQuestion(q, values, errors);
          });
          return errors;
        }}
      >
        {({ handleSubmit, form, submitting, pristine, values }) => {
          submit = handleSubmit;
          return (
            <form onSubmit={handleSubmit}>
              {extraQuestions.map((q) => renderQuestion(q, questionRef[q.id]))}
              <pre>{JSON.stringify(values, 0, 2)}</pre>
            </form>
          );
        }}
      </Form>
      <button
        type="submit"
        onClick={(event) => {
          submit(event);
        }}
        style={{ marginTop: 10 }}
      >
        Submit
      </button>
    </div>
  )
}

ExtraQuestionsForm.propTypes = {
  extraQuestions: PropTypes.array.isRequired,
  userAnswers: PropTypes.array.isRequired,
};

export default ExtraQuestionsForm;