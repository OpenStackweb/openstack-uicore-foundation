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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import Input from '../inputs/text-input'
import { scrollToError, isEmpty, shallowEqual, hasErrors } from '../../utils/methods'


class SimpleForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(prevProps.entity.id !== this.props.entity.id) {
            state.entity = {...this.props.entity};
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = {...this.props.errors};
        }

        if (!isEmpty(state)) {
            this.setState({...this.state, ...state})
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity);
    }

    createField(field) {
        let {entity, errors} = this.state;

        switch (field.type) {
            case 'text':
                return (
                    <div key={"field_"+field.name} className="row form-group">
                        <div className="col-md-6">
                            <label> {field.label} </label>
                            <Input
                                id={field.name}
                                value={entity[field.name]}
                                onChange={this.handleChange}
                                className="form-control"
                                error={hasErrors(field.name, errors)}
                            />
                        </div>
                    </div>
                );
            break;
            case 'textarea':
                return (
                    <div key={"field_"+field.name} className="row form-group">
                        <div className="col-md-6">
                            <label> {field.label} </label>
                            <textarea
                                id={field.name}
                                value={entity[field.name]}
                                onChange={this.handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>
                );
            break;
            case 'checkbox':
                return (
                    <div key={"field_"+field.name} className="row form-group">
                        <div className="col-md-6">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id={field.name} checked={entity[field.name]}
                                       onChange={this.handleChange} className="form-check-input" />
                                <label className="form-check-label" htmlFor={field.name}>
                                    {field.label}
                                </label>
                            </div>
                        </div>
                    </div>
                );
            break;

        }
    }

    render() {
        let {entity} = this.state;
        let {fields} = this.props;

        return (
            <form className="simple-form">
                <input type="hidden" id="id" value={entity.id} />

                {fields.map(f => {
                    return this.createField(f);
                })}

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

SimpleForm.propTypes = {
    /** Field descriptors rendered in order. */
    fields: PropTypes.arrayOf(PropTypes.shape({
        /** Matches a key on entity. */
        name: PropTypes.string.isRequired,
        /** Anything else renders nothing. */
        type: PropTypes.oneOf(['text', 'textarea', 'checkbox']).isRequired,
        label: PropTypes.node
    })).isRequired,
    /** Seeds the form. Copied into local state and re-synced when it changes. */
    entity: PropTypes.object.isRequired,
    /** Keyed by field name. */
    errors: PropTypes.object,
    /** Receives the edited entity. */
    onSubmit: PropTypes.func.isRequired
};
export default SimpleForm;
