/**
 * Copyright 2018 OpenStack Foundation
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

import React from 'react'
import PropTypes from 'prop-types';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import Input from '../inputs/text-input'
import Dropdown from '../inputs/dropdown'
import RawHTML from '../raw-html'
import CheckboxList from '../inputs/checkbox-list'
import RadioList from '../inputs/radio-list'


class RsvpForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            answers: props.questions.map(q => ({question_id: q.id, value: null})),
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.hasErrors = this.hasErrors.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    renderQuestion(q) {
        const {answers} = this.state;
        const value = answers.find(a => a.question_id === q.id).value;

        switch(q.class_name) {
            case 'RSVPMemberEmailQuestionTemplate':
            case 'RSVPMemberFirstNameQuestionTemplate':
            case 'RSVPMemberLastNameQuestionTemplate':
            case 'RSVPTextBoxQuestionTemplate':
                return (
                    <Input
                        id={q.id}
                        value={value || ''}
                        onChange={this.handleChange}
                        className="form-control"
                        error={this.hasErrors(q.id)}
                    />
                );
                break;
            case 'RSVPTextAreaQuestionTemplate':
                return (
                    <textarea
                        id={q.id}
                        value={value || ''}
                        className="form-control"
                        onChange={this.handleChange}
                    />);
                break;
            case 'RSVPLiteralContentQuestionTemplate':
                return (<div><RawHTML>{q.value}</RawHTML></div>);
                break;
            case 'RSVPCheckBoxListQuestionTemplate':
                return (
                    <CheckboxList
                        id={q.id}
                        value={value}
                        options={q.values.map(v => ({value: `${v.id}`, label: v.label}))}
                        onChange={this.handleChange}
                        error={this.hasErrors(q.id)}
                    />
                );
                break;
            case 'RSVPRadioButtonListQuestionTemplate':
                return (
                    <RadioList
                        id={q.id}
                        value={value}
                        onChange={this.handleChange}
                        options={q.values.map(v => ({value: `${v.id}`, label: v.label}))}
                        error={this.hasErrors(q.id)}
                        simple
                    />
                );
                break;
            case 'RSVPDropDownQuestionTemplate':
                let values = (q.is_country_selector) ? q.values.map(v => ({value:v.id, label: v.value})) : q.values;

                return (
                    <Dropdown
                        id={q.id}
                        isMulti={q.is_multiselect}
                        value={value}
                        onChange={this.handleChange}
                        placeholder={q.empty_string}
                        options={values}
                    />
                );
                break;
        }
    }

    handleChange(ev) {
        let answers = [...this.state.answers];
        let {value, id} = ev.target;

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
        }

        let answer = answers.find(a => a.question_id === parseInt(id));
        answer.value = value;

        this.setState({answers});
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    handleSubmit(ev) {
        ev.preventDefault();

        let { onSubmit } = this.props;
        let {answers} = this.state;

        onSubmit(answers);
    }

    render() {
        let { questions, onSubmit } = this.props;

        return (
            <form className="rsvp-form">
                {questions.map(q =>
                    <div key={'question_'+q.id} className="row form-group">
                        <div className="col-md-12">
                            <label>
                                <RawHTML>{q.label}</RawHTML> {q.is_mandatory && '*'}
                            </label>
                            {this.renderQuestion(q)}
                        </div>
                    </div>
                )}
                {onSubmit &&
                    <div className="row">
                        <div className="col-md-12">
                            <button className="btn btn-primary" onClick={this.handleSubmit}>Submit</button>
                        </div>
                    </div>
                }
            </form>
        );
    }
}

RsvpForm.propTypes = {
    /** Rendered by class_name, e.g. RSVPTextBoxQuestionTemplate or RSVPCheckBoxListQuestionTemplate. */
    questions: PropTypes.arrayOf(PropTypes.shape({
        /** Must be a number: handleChange compares answer.question_id to parseInt(id) with strict equality, which never matches a string id. */
        id: PropTypes.number.isRequired,
        /** Selects the widget; unknown values render nothing. */
        class_name: PropTypes.string.isRequired,
        name: PropTypes.string,
        /** Injected as raw HTML. */
        label: PropTypes.string,
        is_mandatory: PropTypes.bool,
        values: PropTypes.array,
        /** RSVPLiteralContentQuestionTemplate: raw HTML content rendered via RawHTML. */
        value: PropTypes.string,
        /** RSVPDropDownQuestionTemplate: when true, values are remapped to {value: id, label: value}. */
        is_country_selector: PropTypes.bool,
        /** RSVPDropDownQuestionTemplate: passed through to the Dropdown as isMulti. */
        is_multiselect: PropTypes.bool,
        /** RSVPDropDownQuestionTemplate: used as the Dropdown's placeholder. */
        empty_string: PropTypes.string
    })).isRequired,
    /** Receives the collected answers array on submit. Omit to render a display-only form with no submit button. */
    onSubmit: PropTypes.func,
    /** Keyed by question id. Read into state at mount with no fallback; hasErrors() throws if omitted. Effectively required. */
    errors: PropTypes.object
};
export default RsvpForm;
