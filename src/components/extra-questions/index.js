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

import React, {Fragment, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';

import RawHTML from '../raw-html'
import Input from '../inputs/text-input'
import Dropdown from '../inputs/dropdown'
import RadioList from '../inputs/radio-list'
import CheckboxList from '../inputs/checkbox-list'
import QuestionsSet from '../../utils/questions-set';
import {Field, Form} from "react-final-form";
import './index.scss';

const InputAdapter = ({ input, meta, question, className, isDisabled, isRequired, ...rest }) => {
    return (
        <Input
            {...input}
            {...rest}
            containerClassName={className}
            name={question.name}
            id={question.name}
            value={input.value}
            disabled={isDisabled}
            required={isRequired}
            onChange={input.onChange}
            placeholder={question.placeholder}
        />
    )
}

const RadioButtonListAdapter = ({ input, meta, question, isDisabled, isRequired, ...rest }) => {
    return (
        <RadioList
            {...input}
            {...rest}
            name={question.name}
            id={question.name}
            overrideCSS={true}
            value={input.value}
            disabled={isDisabled}
            required={isRequired}
            onChange={input.onChange}
        />
    )};

const DropdownAdapter = ({ input, meta, question, isDisabled, isRequired, ...rest }) => {
    return (<Dropdown
        {...input}
        {...rest}
        name={question.name}
        id={question.name}
        overrideCSS={true}
        value={input.value}
        disabled={isDisabled}
        required={isRequired}
        onChange={input.onChange}
    />)
}

const CheckBoxListAdapter = ({ input, meta, question, isDisabled, isRequired, maxValues, ...rest }) => {
    const shouldChange = (ev) => {
        const question_answers = ev.target.value;
        // if there's a max value of options checked and the value from the input is higher than the max, don't change the value
        if (maxValues > 0 && question_answers.length > maxValues) {
            return null
        }
        return input.onChange(ev)
    }
    return (
        <CheckboxList
            {...input}
            {...rest}
            id={question.name}
            name={question.name}
            value={input.value}
            disabled={isDisabled}
            required={isRequired}
            onChange={shouldChange}
        />
    )
}

const getValidator = isRequired =>
    isRequired ? value => (value ? undefined : "Required") : () => {};

const ExtraQuestionsForm = React.forwardRef(({
                                                 extraQuestions,
                                                 userAnswers,
                                                 onAnswerChanges,
                                                 className = 'questions-form',
                                                 questionContainerClassName = 'question-container',
                                                 questionLabelContainerClassName = 'question-label-container',
                                                 questionControlContainerClassName= 'question-control-container',
                                                 readOnly = false,
                                                 debug = false,
                                                 buttonText = 'Submit',
                                                 RequiredErrorMessage = 'Required',
                                                 ValidationErrorClassName = 'extra-question-error',
                                                 allowExtraQuestionsEdit = true,
                                                 onError = (e) => console.log('form errors: ', e)
                                             }, ref) => {

    let submit = null;

    const questionRef = useRef({});

    const [answers, setAnswers] = useState({});

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

    const Error = ({ name }) => (
        <Field name={name} subscription={{ error: true, touched: true }}>
            {({ meta: { error, touched } }) =>
                error && touched ? <div className={ValidationErrorClassName}>{error}</div> : null
            }
        </Field>
    )

    const checkRule = (value, rule) => {
        let values = rule.answer_values;

        if (Array.isArray(value)) {
            if (!value.length) return false;
            let res = rule.answer_values_operator === "And";
            values.forEach((v) => {
                if (rule.answer_values_operator === "And") {
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

    const getLabel = (q) => {
        return q.mandatory ? q.label?.endsWith('</p>') ? q.label.replace(/<\/p>$/g, " <b>*</b></p>") : `${q.label} <b>*</b>` : q.label;
    }

    const isAnswered = (q, answers) => {
        if(!answers.hasOwnProperty(q.name)) return false;
        const answer = answers[q.name];
        // check type
        if(Array.isArray(answer)) return answer.length > 0;
        if (typeof answer === 'string') return answer.length > 0;
        if(typeof answer === 'number') return answer > 0;
        if(typeof answer === 'boolean') return answer;
        return false;
    }

    const renderQuestion = (q) => {
        let questionValues = q.values;
        // disable field if edit isn't allowed and the questions is answered
        const isDisabled = !allowExtraQuestionsEdit && isAnswered(q, answers);
        // @see https://codesandbox.io/s/vg05y?file=/index.js
        if (q.type === "Text") {
            return (
                <Fragment key={q.name}>
                    <div ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>{getLabel(q)}</RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={q.name}
                                   question={q}
                                   isDisabled={isDisabled}
                                   isRequired={q.mandatory}
                                   validate={getValidator(q.mandatory)}
                                   component={InputAdapter}
                            />
                            <Error name={q.name}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={q.name} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === "TextArea") {
            return (
                <Fragment key={q.name}>
                    <div ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>{getLabel(q)}</RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field
                                   validate={getValidator(q.mandatory)}
                                   name={q.name}
                                   id={q.name}
                                   disabled={isDisabled}
                                   required={q.mandatory}
                                   component="textarea"/>
                            <Error name={q.name}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={q.name} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === "CheckBox") {
            return (
                <Fragment key={q.name}>
                    <div ref={el => questionRef.current[q.id] = el} style={{display: 'flex'}}
                         className={questionContainerClassName}>
                        <RawHTML className={`eq-checkbox-label ${questionLabelContainerClassName}`}>
                            {getLabel(q)}
                        </RawHTML>
                        <div className={questionControlContainerClassName}>
                            <div className="form-check abc-checkbox">
                                <Field
                                       name={q.name}
                                       id={q.name}
                                       validate={getValidator(q.mandatory)}
                                       disabled={isDisabled}
                                       required={q.mandatory}
                                       type="checkbox"
                                       className="form-check-input"
                                       component="input" />
                                <label className="form-check-label" htmlFor={q.name}/>
                                <Error name={q.name}/>
                            </div>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={q.name} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === "RadioButtonList") {
            const options = questionValues.map(val => ({label : val.label, value : val.id}));
            return (
                <Fragment key={q.name}>
                    <div key={q.name} ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>
                            {getLabel(q)}
                        </RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={q.name}
                                   options={options}
                                   question={q}
                                   validate={getValidator(q.mandatory)}
                                   isDisabled={isDisabled}
                                   isRequired={q.mandatory}
                                   component={RadioButtonListAdapter} />
                            <Error name={q.name}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={q.name} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === "ComboBox") {
            const options = questionValues.map(val => ({label : val.label, value : val.id}));
            return (
                <Fragment key={q.name}>
                    <div ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>
                            {getLabel(q)}
                        </RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={q.name}
                                   options={options}
                                   question={q}
                                   validate={getValidator(q.mandatory)}
                                   isDisabled={isDisabled}
                                   isRequired={q.mandatory}
                                   component={DropdownAdapter}
                            />
                            <Error name={q.name}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={q.name} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === "CheckBoxList") {
            const options = questionValues.map(val => ({label : val.label, value : val.id}));
            return (
                <Fragment key={q.name}>
                    <div ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML className={questionLabelContainerClassName}>
                            {getLabel(q)}
                        </RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={q.name}
                                   className={questionControlContainerClassName}
                                   validate={getValidator(q.mandatory)}
                                   options={options}
                                   question={q}
                                   maxValues={q.max_selected_values}
                                   isDisabled={isDisabled}
                                   isRequired={q.mandatory}
                                   component={CheckBoxListAdapter}
                            />
                            <Error name={q.name}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={q.name} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
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
        onAnswerChanges(values)
    };

    const validate = (values) => {
        const errors = {};
        extraQuestions.forEach( q => {
            validateQuestion(q, values, errors);
        });
        if(Object.keys(errors).length > 0) onError(errors)
        return errors;
    }

    if(!Object.keys(answers).length) return null;

    const getErrorFields = (q, invalidFormFields, errorFields) => {
        if (invalidFormFields.includes(q.name)) {
            errorFields.push(q);
        }
        // find errors on sub rules
        q.sub_question_rules?.forEach((r) => {
            getErrorFields(r.sub_question, invalidFormFields, errorFields);
        });
    }

    const scrollToFirstError = (invalidFormFields) => {
        const errorFields = [];
        extraQuestions.forEach(q => {
            getErrorFields(q, invalidFormFields, errorFields);
        });
        const firstError = errorFields.sort((a, b) => a.order > b.order)[0];
        questionRef.current[firstError.id].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }

    if (!Object.keys(answers).length) return null;

    return (
        <div className={className}>
            <Form
                validate={validate}
                onSubmit={onSubmit}
                initialValues={answers}>

                {({handleSubmit, form, submitting, pristine, values}) => {
                    submit = handleSubmit;
                    return (
                        <form
                            onSubmit={(event) => {
                                const invalidFormFields = form.getRegisteredFields().filter(field => form.getFieldState(field).invalid);
                                if (invalidFormFields.length > 0) scrollToFirstError(invalidFormFields)
                                handleSubmit(event)
                            }}
                            ref={ref}>
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
            {!ref &&
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
});

ExtraQuestionsForm.propTypes = {
    extraQuestions: PropTypes.array.isRequired,
    userAnswers: PropTypes.array.isRequired,
    onAnswerChanges: PropTypes.func.isRequired,
    className: PropTypes.string,
    debug: PropTypes.bool,
    buttonText: PropTypes.string,
    questionContainerClassName: PropTypes.string,
    questionLabelContainerClassName: PropTypes.string,
    questionControlContainerClassName: PropTypes.string,
    RequiredErrorMessage: PropTypes.string,
    ValidationErrorClassName: PropTypes.string,
    allowExtraQuestionsEdit: PropTypes.bool,
};

export default ExtraQuestionsForm;
