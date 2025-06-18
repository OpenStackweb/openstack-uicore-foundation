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
import AsyncSelect from 'react-select/lib/Async';
import {queryCompanies} from '../../utils/query-actions';
import AsyncCreatableSelect from "react-select/lib/AsyncCreatable";

export default class CompanyInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.getCompanies = this.getCompanies.bind(this);
    }

    handleChange(value) {
        const isMulti = (this.props.hasOwnProperty('multi') || this.props.hasOwnProperty('isMulti'));
        const theValue = isMulti ? value.map(v => ({id: v.value, name: v.label})) : {id: value.value, name: value.label};

        let ev = {target: {
                id: this.props.id,
                value: theValue,
                type: 'companyinput'
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

    getCompanies (input, callback) {
        const {extraOptions} = this.props;

        if (!input) {
            return Promise.resolve({ options: [] });
        }

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        const translateOptions = (options) => {
            let newOptions = options.map(c => ({value: c.id.toString(), label: c.name}));

            if (extraOptions?.length > 0) {
                newOptions = [...extraOptions, ...newOptions];
            }

            callback(newOptions);
        };

        const queryFn = this.props.queryFunction || queryCompanies;

        queryFn(input, translateOptions);
    }    

    render() {
        let {error, value, onChange, id, multi, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        let isMulti = (this.props.hasOwnProperty('multi') || this.props.hasOwnProperty('isMulti'));
        let allowCreate = this.props.hasOwnProperty('allowCreate');

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        let theValue = null;

        if (isMulti && value.length > 0) {
            theValue = value.map(v => ({value: v.id.toString(), label: v.name} ));
        } else if (!isMulti && value) {
            theValue = {value: value.id.toString(), label: value.name};
        }


        const AsyncComponent = allowCreate
            ? AsyncCreatableSelect
            : AsyncSelect;

        return (
            <div>
                <AsyncComponent
                    value={theValue}
                    onChange={this.handleChange}
                    loadOptions={this.getCompanies}
                    onCreateOption={this.handleNew}
                    isMulti={isMulti}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}
