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
import { components } from 'react-select/lib/components'
import { querySpeakers } from '../../utils/query-actions';

export default class SpeakerInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.getSpeakers = this.getSpeakers.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getOptionValue = this.getOptionValue.bind(this);
        this.getOptionLabel = this.getOptionLabel.bind(this);
    }

    handleChange(value) {
        let ev = {target: {
                id: this.props.id,
                value: value,
                type: 'speakerinput'
            }};

        this.props.onChange(ev);
    }

    handleClick(speakerId) {
        let {history} = this.props;

        history.push(`/app/speakers/${speakerId}`);
    }

    getSpeakers (input, callback) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        let summitId = (this.props.hasOwnProperty('summitId')) ? this.props.summitId : null;

        querySpeakers(summitId, input, callback);
    }

    getOptionValue(speaker){
        if(this.props.hasOwnProperty("getOptionValue")){
            return this.props.getOptionValue(speaker);
        }
        //default
        return speaker.id;
    }

    getOptionLabel(speaker){
        if(this.props.hasOwnProperty("getOptionLabel")){
            return this.props.getOptionLabel(speaker);
        }
        //default
        return `${speaker.first_name} ${speaker.last_name} (${speaker.id})`;
    }

    render() {
        let {value, onChange, history, summitId, error, id, multi, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        let isMulti = (this.props.hasOwnProperty('multi'));

        const MultiValueLabel = (props) => {
            return (
                <a onClick={() => this.handleClick(props.data.id)} style={{cursor: 'pointer'}}>
                    <components.MultiValueLabel {...props} />
                </a>
            );
        };

        return (
            <div>
                <AsyncSelect
                    value={value}
                    onChange={this.handleChange}
                    loadOptions={this.getSpeakers}
                    components={{ MultiValueLabel }}
                    getOptionValue={s => this.getOptionValue(s)}
                    getOptionLabel={s => this.getOptionLabel(s)}
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

