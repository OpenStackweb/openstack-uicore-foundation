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

import React from 'react';
import Select from 'react-select';
import {getLanguageList} from '../../utils/query-actions';

export default class LanguageInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: [],
            shouldUseId: props.hasOwnProperty('shouldUseId') ? props.shouldUseId : false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.setOptions = this.setOptions.bind(this);
        this.abortController = new AbortController();
    }

    componentDidMount() {
        getLanguageList(this.setOptions, this.abortController.signal).catch(e => console.log("Error get languages: ", e));
    }

    componentWillUnmount(){
        this.abortController.abort();
    }

    setOptions(response) {
        let languageList = (this.state.shouldUseId) ?
            response.map(l => ({label: l.name, value: l.id})):
            response.map(l => ({label: l.name, value: l.iso_code}));
        this.setState({options: languageList});
    }

    handleChange(value) {
        let isMulti = (this.props.hasOwnProperty('multi'));
        let theValue = null;

        if (isMulti) {
            theValue = value.map(v => v.value);
        } else {
            theValue = value.value;
        }

        let ev = {target: {
                id: this.props.id,
                value: theValue,
                type: 'laguageinput'
            }};

        this.props.onChange(ev);
    }

    render() {
        let {value, onChange, id, multi, ...rest} = this.props;
        let {options} = this.state;
        let isMulti = (this.props.hasOwnProperty('multi'));
        let theValue = null;

        if (isMulti) {
            theValue = options.filter(op => value.includes(op.value));
        } else {
            theValue = (value instanceof Object || value == null) ? value : options.find(opt => opt.value == value);
        }

        return (
            <Select
                className="dropdown"
                onChange={this.handleChange}
                options={options}
                value={theValue}
                isMulti={isMulti}
                {...rest}
            />
        );

    }
}
