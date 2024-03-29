/**
 * Copyright 2022 OpenStack Foundation
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
import { querySponsoredProjects } from '../../utils/query-actions';

export default class SponsoredProjectInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.getSponsoredProjects = this.getSponsoredProjects.bind(this);
    }

    handleChange(value) {
        let ev = {target: {
            id: this.props.id,
            value: value,
            type: 'sponsoredprojectinput'
        }};

        this.props.onChange(ev);
    }

    getSponsoredProjects (input, callback) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        querySponsoredProjects(input, callback);
    }

    render() {
        let {value, error, onChange, id, multi, ...rest} = this.props;
        let isMulti = (this.props.hasOwnProperty('multi'));
        let isClearable = (this.props.hasOwnProperty('clearable'));
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );

        return (
            <div>
                <AsyncSelect
                    value={value}
                    onChange={this.handleChange}
                    loadOptions={this.getSponsoredProjects}
                    getOptionValue={op => op.id}
                    getOptionLabel={op => (`${op.name} (${op.id})`)}
                    isMulti={isMulti}
                    isClearable={isClearable}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">{error}</p>
                }

            </div>
        );

    }
}
