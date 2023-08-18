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

import React, {Fragment, useEffect, useRef, useState, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';

import RawHTML from '../raw-html'
import Input from '../inputs/text-input'
import Dropdown from '../inputs/dropdown'
import RadioList from '../inputs/radio-list'
import CheckboxList from '../inputs/checkbox-list'
import QuestionsSet from '../../utils/questions-set';
import {Field, Form} from "react-final-form";
import {toSlug} from "../../utils/methods";
import {
    QuestionType_Checkbox, QuestionType_CheckBoxList, QuestionType_ComboBox, QuestionType_CountryComboBox,
    QuestionType_RadioButtonList,
    QuestionType_Text,
    QuestionType_TextArea
} from "./constants";

import "awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css";
import './index.scss';

const InputAdapter = ({ input, meta, question, className, isDisabled, isRequired, ...rest }) => {

    return (
        <Input
            {...input}
            {...rest}
            containerClassName={className}
            name={toSlug(question.name)}
            ariaLabelledBy={`${toSlug(question.name)} label`}
            id={toSlug(question.name)}
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
            name={toSlug(question.name)}
            ariaLabelledBy={`${toSlug(question.name)} label`}
            id={toSlug(question.name)}
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
        name={toSlug(question.name)}
        ariaLabelledBy={`${toSlug(question.name)} label`}
        id={toSlug(question.name)}
        overrideCSS={true}
        className="ddl-extra-questions-container"
        classNamePrefix="ddl-extra-questions"
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
            id={toSlug(question.name)}
            name={toSlug(question.name)}
            ariaLabelledBy={`${toSlug(question.name)} label`}
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
                                                 onError = (e) => console.log('form errors: ', e),
                                                 shouldScroll2FirstError = true
                                             }, ref) => {

    let submit = null;

    const questionRef = useRef({});
    const formRef = useRef(null);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        formatUserAnswers();
    }, [extraQuestions])


    // @see https://beta.reactjs.org/reference/react/useImperativeHandle
    useImperativeHandle(ref, () => ({
        doSubmit() {
            formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
    }));

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
        // Keep the last word and the required asterisk on the same line
        const nonBreakingSpace = String.fromCharCode(160); // equals to &nbsp;
        
        // Using browser parser isntead of regex to avoid possible issues
        const div = document.createElement("div");
        div.innerHTML = q.label;
        // Using innerText first since it keeps the line breaks
        const label = div.innerText || div.textContent || "";

        const labelText = q.mandatory ? `${label}${nonBreakingSpace}<b>*</b>` : label
        const labelHTML = `<label id="${toSlug(q.name)} label" htmlFor="${toSlug(q.name)}">
                                ${labelText}
                           </label>`

        return labelHTML;
    }

    const isAnswered = (q, answers) => {
        const slug = toSlug(q.name);
        if(!answers.hasOwnProperty(slug)) return false;
        const answer = answers[slug];
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
        if (q.type === QuestionType_Text) {
            return (
                <Fragment key={toSlug(q.name)}>
                    <div ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML replaceNewLine={true} className={questionLabelContainerClassName}>{getLabel(q)}</RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={toSlug(q.name)}
                                   question={q}
                                   isDisabled={isDisabled}
                                   isRequired={q.mandatory}
                                   validate={getValidator(q.mandatory)}
                                   component={InputAdapter}
                            />
                            <Error name={toSlug(q.name)}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={toSlug(q.name)} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === QuestionType_TextArea) {
            return (
                <Fragment key={toSlug(q.name)}>
                    <div ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML replaceNewLine={true} className={questionLabelContainerClassName}>{getLabel(q)}</RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field
                                   validate={getValidator(q.mandatory)}
                                   name={toSlug(q.name)}
                                   id={toSlug(q.name)}
                                   disabled={isDisabled}
                                   required={q.mandatory}
                                   component="textarea"/>
                            <Error name={toSlug(q.name)}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={toSlug(q.name)} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === QuestionType_Checkbox) {
            return (
                <Fragment key={toSlug(q.name)}>
                    <div ref={el => questionRef.current[q.id] = el} style={{display: 'flex'}}
                         className={questionContainerClassName}>
                        <div className={questionControlContainerClassName}>
                            <div className="form-check abc-checkbox">
                                <Field
                                       name={toSlug(q.name)}
                                       id={toSlug(q.name)}
                                       validate={getValidator(q.mandatory)}
                                       disabled={isDisabled}
                                       required={q.mandatory}
                                       type="checkbox"
                                       className="form-check-input"
                                       component="input" />
                                <label className="form-check-label" htmlFor={toSlug(q.name)}/>
                            </div>
                        </div>
                        <RawHTML replaceNewLine={true} className={`eq-checkbox-label ${questionLabelContainerClassName}`}>
                            {getLabel(q)}
                        </RawHTML>
                    </div>
                    <Error name={toSlug(q.name)}/>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={toSlug(q.name)} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === QuestionType_RadioButtonList) {
            const options = questionValues.map(val => ({label : val.label, value : val.id}));
            return (
                <Fragment key={toSlug(q.name)}>
                    <div key={toSlug(q.name)} ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML replaceNewLine={true} className={questionLabelContainerClassName}>
                            {getLabel(q)}
                        </RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={toSlug(q.name)}
                                   options={options}
                                   question={q}
                                   validate={getValidator(q.mandatory)}
                                   isDisabled={isDisabled}
                                   isRequired={q.mandatory}
                                   component={RadioButtonListAdapter} />
                            <Error name={toSlug(q.name)}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={toSlug(q.name)} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === QuestionType_ComboBox || q.type === QuestionType_CountryComboBox) {
            const options = questionValues.map(val => ({label : val.label, value : val.id}));
            return (
                <Fragment key={toSlug(q.name)}>
                    <div ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML replaceNewLine={true} className={questionLabelContainerClassName}>
                            {getLabel(q)}
                        </RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={toSlug(q.name)}
                                   options={options}
                                   question={q}
                                   validate={getValidator(q.mandatory)}
                                   isDisabled={isDisabled}
                                   isRequired={q.mandatory}
                                   component={DropdownAdapter}
                            />
                            <Error name={toSlug(q.name)}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={toSlug(q.name)} rule={r}>
                                {renderQuestion(r.sub_question)}
                            </Condition>
                        )
                    )}
                </Fragment>
            );
        }
        if (q.type === QuestionType_CheckBoxList) {
            const options = questionValues.map(val => ({label : val.label, value : val.id}));
            return (
                <Fragment key={toSlug(q.name)}>
                    <div ref={el => questionRef.current[q.id] = el} className={questionContainerClassName}>
                        <RawHTML replaceNewLine={true} className={questionLabelContainerClassName}>
                            {getLabel(q)}
                        </RawHTML>
                        <div className={questionControlContainerClassName}>
                            <Field name={toSlug(q.name)}
                                   className={questionControlContainerClassName}
                                   validate={getValidator(q.mandatory)}
                                   options={options}
                                   question={q}
                                   maxValues={q.max_selected_values}
                                   isDisabled={isDisabled}
                                   isRequired={q.mandatory}
                                   component={CheckBoxListAdapter}
                            />
                            <Error name={toSlug(q.name)}/>
                        </div>
                    </div>
                    {q.sub_question_rules?.length > 0 &&
                    q.sub_question_rules.map((r) =>
                        (
                            <Condition key={r.id} when={toSlug(q.name)} rule={r}>
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
            const slug = toSlug(q.name);
            if (!values.hasOwnProperty(toSlug(slug)) || values[toSlug(slug)] === "" || values[slug].length === 0) {
                errors[slug] = RequiredErrorMessage;
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
        return errors;
    }

    if(!Object.keys(answers).length) return null;

    const getErrorFields = (q, invalidFormFields, errorFields) => {
        if (invalidFormFields.includes(toSlug(q.name))) {
            errorFields.push(q);
        }
        // find errors on sub rules
        q.sub_question_rules?.forEach((r) => {
            getErrorFields(r.sub_question, invalidFormFields, errorFields);
        });
    }

    const getFirstError = (invalidFormFields) => {
        const errorFields = [];
        extraQuestions.forEach(q => {
            getErrorFields(q, invalidFormFields, errorFields);
        });
        return errorFields.sort((a, b) => a.order > b.order)[0];
    }

    const scrollToFirstError = (invalidFormFields) => {
        const firstError = getFirstError(invalidFormFields)
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
                                if (invalidFormFields.length > 0) {
                                    const firstError = getFirstError(invalidFormFields);
                                    onError(invalidFormFields, questionRef.current[firstError.id])
                                    if(shouldScroll2FirstError)
                                        scrollToFirstError(invalidFormFields)
                                }
                                handleSubmit(event)
                            }}
                            ref={formRef}>
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
    shouldScroll2FirstError: PropTypes.bool,
    readOnly: PropTypes.bool
};

export default ExtraQuestionsForm;
