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
import AsyncSelect from 'react-select/async';
import AsyncCreatableSelect from 'react-select/async-creatable';
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
        }

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



