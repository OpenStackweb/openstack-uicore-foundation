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
import {getCountryList} from '../../utils/query-actions';

export default class CountryInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.setOptions = this.setOptions.bind(this);
    }

    componentWillMount () {
        let {options} = this.state;

        if(options.length == 0){
            getCountryList(this.setOptions);
        }
    }

    setOptions(response) {
        let countryList = response.map(c => ({label: c.name, value: c.iso_code}));
        this.setState({options: countryList});
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
                type: 'countryinput'
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
