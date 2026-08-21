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

import React from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/lib/Async';
import AsyncCreatableSelect from 'react-select/lib/AsyncCreatable';
import {queryOrganizations} from '../../utils/query-actions';

export default class OrganizationInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.getOrganizations = this.getOrganizations.bind(this);
    }

    handleChange(value) {
        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        let ev = {target: {
                id: this.props.id,
                value: {id: value.value, name: value.label},
                type: 'organizationinput'
            }};

        this.props.onChange(ev);
    }

    handleNew(value) {
        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        const translateValue = (newValue) => {
            this.handleChange({value: newValue.id, label: newValue.name});
        }

        this.props.onCreate(value, translateValue);
    }

    getOrganizations (input, callback) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        const translateOptions = (options) => {
            let newOptions = options.map(org => ({value: org.id.toString(), label: org.name}));
            callback(newOptions);
        };

        queryOrganizations(input, translateOptions);
    }

    render() {
        let {error, value, id, onChange, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        let allowCreate = this.props.hasOwnProperty('allowCreate');

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998
        let theValue = value ? {value: value.id.toString(), label: value.name} : null;

        const AsyncComponent = allowCreate
            ? AsyncCreatableSelect
            : AsyncSelect;

        return (
            <div>
                <AsyncComponent
                    value={theValue}
                    onChange={this.handleChange}
                    loadOptions={this.getOrganizations}
                    onCreateOption={this.handleNew}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}

OrganizationInput.propTypes = {
    /** Selected organization, read as value.id / value.name. */
    value: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string
    }),
    /** Echoed back as ev.target.id on the synthetic change event. */
    id: PropTypes.string.isRequired,
    /** Receives a synthetic { target: { id, value, type } }. */
    onChange: PropTypes.func.isRequired,
    /** No effect on this component: it flows through ...rest into AsyncSelect as multi, but react-select ^2.4.3 renamed that prop to isMulti. Consumers still pass it; it does nothing here. */
    multi: PropTypes.bool,
    /** Non-empty renders an .error-label. */
    error: PropTypes.string,
    /** Presence-gated: switches to AsyncCreatableSelect regardless of value. */
    allowCreate: PropTypes.bool,
    /** Called with the typed text when a new organization is created. Required whenever allowCreate is present: AsyncCreatableSelect's create action calls it unconditionally. */
    onCreate: PropTypes.func
};
