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
import {queryAccessLevels} from '../../utils/query-actions';

export default class AccessLevelsInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.handleChange = this.handleChange.bind(this);
        this.getAccessLevels = this.getAccessLevels.bind(this);
        this.getOptionValue = this.getOptionValue.bind(this);
        this.getOptionLabel = this.getOptionLabel.bind(this);
    }

    getOptionValue(accessLevel){
        if(this.props.hasOwnProperty("getOptionValue")){
            return this.props.getOptionValue(accessLevel);
        }
        //default
        return accessLevel.id;
    }

    getOptionLabel(accessLevel){
        if(this.props.hasOwnProperty("getOptionLabel")){
            return this.props.getOptionLabel(accessLevel);
        }
        //default
        return `${accessLevel.name}`;
    }

    handleChange(value) {
        let ev = {target: {
                id: this.props.id,
                value: value,
                type: 'accesslevelinpurt'
            }};

        this.props.onChange(ev);
    }

    getAccessLevels (input, callback) {
        let {summitId} = this.props;

        if (!input) {
            return Promise.resolve({ options: [] });
        }
        queryAccessLevels(summitId,input, callback);
    }

    render() {
        let {value, error, onChange, id, multi, ...rest} = this.props;
        let isMulti = (this.props.hasOwnProperty('multi'));
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );

        return (
            <div>
                <AsyncSelect
                    value={value}
                    onChange={this.handleChange}
                    loadOptions={this.getAccessLevels}
                    getOptionValue={m => this.getOptionValue(m)}
                    getOptionLabel={m => this.getOptionLabel(m)}
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

