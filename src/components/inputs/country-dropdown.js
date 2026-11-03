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
import Dropdown from './dropdown';
import {getCountryList} from '../../utils/query-actions';

export default class CountryDropdown extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.setOptions = this.setOptions.bind(this);
        this.abortController = new AbortController();
    }

    componentDidMount () {
        let {options} = this.state;

        if(options.length == 0){
            getCountryList(this.setOptions, this.abortController.signal);
        }
    }

    componentWillUnmount(){
        this.abortController.abort();
    }

    handleChange(value) {

        let ev = {target: {
                id: this.props.id,
                value: value,
                type: 'countryddl'
            }};

        this.props.onChange(ev);
    }

    setOptions(response) {
        let countryList = response.map(c => ({label: c.name, value: c.iso_code}));
        this.setState({options: countryList});
    }

    render() {

        let {options} = this.state;

        return (
            <Dropdown options={options} {...this.props} />
        );

    }
}

CountryDropdown.propTypes = {
    /** Selected ISO country code. */
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string, PropTypes.number]),
    /** Echoed back as ev.target.id on the synthetic change event. */
    id: PropTypes.string.isRequired,
    /** Receives a synthetic { target: { id, value, type } }. */
    onChange: PropTypes.func.isRequired,
    /** No effect: forwarded via {...this.props} to Dropdown, which reads isMulti, not multi. */
    multi: PropTypes.bool,
    /** Non-empty renders an .error-label. */
    error: PropTypes.string,
    /** Forwarded via {...this.props} to Dropdown, then to react-select's Select as its placeholder text. */
    placeholder: PropTypes.string
};
