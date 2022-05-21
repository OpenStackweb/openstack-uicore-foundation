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

import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';

import RawHTML from '../raw-html'
import Input from '../inputs/text-input'
import Dropdown from '../inputs/dropdown'
import RadioList from '../inputs/radio-list'
import CheckboxList from '../inputs/checkbox-list'
import QuestionsSet from '../../utils/questions-set';
import {Field, Form} from "react-final-form";

const ExtraQuestionsForm = ({
                                extraQuestions,
                                userAnswers,
                                onAnswerChanges,
                                className = 'questions-form',
                                questionContainerClassName = 'question-container',
                                questionLabelContainerClassName = 'question-label-container',
                                questionControlContainerClassName= 'question-control-container',
                                formRef = null,
                                readOnly = false,
                                debug = false,
                                buttonText = 'Submit',
                                RequiredErrorMessage = 'Required',
                                ValidationErrorClassName = 'extra-question-error'
                            }) => {

    let submit = null;

    const questionRef = useRef({});

    const [answers, setAnswers] = useState({});
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        formatUserAnswers();
    }, [extraQuestions])

    const formatUserAnswers = () => {
        const qs = new QuestionsSet(extraQuestions, userAnswers);
        setAnswers(qs.formatAnswers());
    }

    const Condition = ({when, rule, children}) => (
        <Field name={when} subscription={{value: true}}>
            {({input: {value}}) =>
                checkVisibility(rule, checkRule(value, rule), children)
            }
        </Field>
    );

    const Error = ({name}) => {
        const error = formErrors[name] || '';
        return error ? <span className={ValidationErrorClassName}>{error}</span> : null;
    };

    const checkRule = (value, rule) => {
        let values = rule.answer_values;

        if (Array.isArray(value)) {
            if (!value.length) return false;
            let res = rule.anwer_values_operator === "And";
            values.forEach((v) => {
                if (rule.anwer_values_operator === "And") {
                    res = res && value.includes(parseInt(v));
                } else {
                    // Or
                    res = res || value.includes(parseInt(v));
                }
            });
            return res;
        }
        return values.includes(value.toString());
    };

    const checkVisibility = (rule, ruleResult, children) => {
        if (rule.visibility === "Visible") {
            if (rule.visibility_condition === "Equal") {
                if(ruleResult) return children;
                delete questionRef.current[rule.sub_question.id]
                return null;
            }
            // Non Equal
            if(!ruleResult){
              return children;
            }
            delete questionRef.current[rule.sub_question.id]
            return null;
        }
        // not visible
        if (rule.visibility_condition === "Equal") {
            if(!ruleResult) return children;
            delete questionRef.current[rule.sub_question.id]
            return null;
        }
        if(ruleResult) return children;
        delete questionRef.current[rule.sub_question.id]
        return null;
    };

    const renderQuestion = (q) => {
        let questionValues = q.values;
        // @see https://codesandbox.io/s/vg05y?file=/index.js
        if (q.type === "Text") {
            return (
                <>
                    <div key={q.name} ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
                        <Field name={q.name} className={questionControlContainerClassName}>
                            {props => (
                                <Input
                                    id={`${q.id}`}
                                    value={props.input.value}
                                    onChange={props.input.onChange}
                                    placeholder={q.placeholder}
                                />
                            )}
                        </Field>
                        <Error name={q.name}/>
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
                    <div key={q.name} ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
                        <Field className={questionControlContainerClassName} name={q.name} id={`${q.id}`} component="textarea"/>
                        <Error name={q.name}/>
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
                    <div key={q.name} ref={el => questionRef.current[q.id] = el} style={{display: 'flex'}} className={questionContainerClassName}>
                        <Field className={questionControlContainerClassName} name={q.name} id={`${q.id}`} component="input" type="checkbox"/>
                        <RawHTML className={`eq-checkbox-label ${questionLabelContainerClassName}`}>
                            {q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}
                        </RawHTML>
                        <Error name={q.name}/>
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
            questionValues = questionValues.map(val => ({...val, value: val.id}));
            return (
                <>
                    <div key={q.name} ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={q.name}>
                                {props => (
                                    <RadioList
                                        id={`${q.id}`}
                                        overrideCSS={true}
                                        value={props.input.value}
                                        options={questionValues}
                                        onChange={props.input.onChange}
                                    />
                                )}
                            </Field>
                            <Error name={q.name}/>
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
            questionValues = questionValues.map(val => ({...val, value: val.id}));
            return (
                <>
                    <div key={q.name} ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
                        <Field name={q.name} className={questionControlContainerClassName}>
                            {props => (
                                <Dropdown
                                    id={`${q.id}`}
                                    overrideCSS={true}
                                    value={props.input.value}
                                    options={questionValues}
                                    onChange={props.input.onChange}
                                />
                            )}
                        </Field>
                        <Error name={q.name}/>
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
            questionValues = questionValues.map(val => ({...val, value: val.id}));
            return (
                <>
                    <div key={q.name} ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>{q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label}</RawHTML>
                        <Field name={q.name} className={questionControlContainerClassName}>
                            {props => (
                                <CheckboxList
                                    id={`${q.id}`}
                                    name={q.name}
                                    value={props.input.value}
                                    options={questionValues}
                                    onChange={props.input.onChange}
                                />
                            )}
                        </Field>
                        <Error name={q.name}/>
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
            if (!values.hasOwnProperty(q.name) || values[q.name] === "" || values[q.name].length === 0) {
                errors[q.name] = RequiredErrorMessage;
            }
        }
        // validate sub rules
        q.sub_question_rules?.forEach((r) => {
            validateQuestion(r.sub_question, values, errors);
        });
    };

    const onSubmit = (values) => {
       const errors = validate(values);
       if(Object.keys(errors).length === 0)
            onAnswerChanges(values)
    };

    const validate = (values) => {
        const errors = {};
        extraQuestions.forEach( q => {
            validateQuestion(q, values, errors);
        });
        setFormErrors({...errors})
        return errors;
    }
    return (
        <div className={className}>
            <Form
                onSubmit={onSubmit}
                initialValues={answers}>
                {({handleSubmit, form, submitting, pristine, values}) => {
                    submit = handleSubmit;
                    return (
                        <form onSubmit={handleSubmit} ref={formRef}>
                            {readOnly ?
                                <fieldset disabled="disabled">
                                    {extraQuestions.map((q) => renderQuestion(q))}
                                </fieldset>
                                :
                                extraQuestions.map((q) => renderQuestion(q))
                            }
                            {debug && <pre>{JSON.stringify(values, 0, 2)}</pre>}
                        </form>
                    );
                }}
            </Form>
            {!formRef &&
            <button
                type="submit"
                onClick={(event) => {
                    submit(event);
                }}
                style={{marginTop: 10}}
            >
                {buttonText}
            </button>
            }
        </div>
    )
}

ExtraQuestionsForm.propTypes = {
    extraQuestions: PropTypes.array.isRequired,
    userAnswers: PropTypes.array.isRequired,
    onAnswerChanges: PropTypes.func.isRequired,
    className: PropTypes.string,
    formRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.any})
    ]),
    debug: PropTypes.bool,
    buttonText: PropTypes.string,
    questionContainerClassName: PropTypes.string,
    questionLabelContainerClassName : PropTypes.string,
    questionControlContainerClassName: PropTypes.string,
    RequiredErrorMessage: PropTypes.string,
    ValidationErrorClassName: PropTypes.string,
};

export default ExtraQuestionsForm;