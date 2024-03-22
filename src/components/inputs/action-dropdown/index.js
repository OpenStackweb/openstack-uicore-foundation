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
import './action-dropdown.less';
import Select from 'react-select';

export default class ActionDropdown extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value || null,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange(value) {
        this.setState({value: value});
    }

    handleClick(ev) {
        ev.preventDefault();
        this.props.onClick(this.state.value.value);
    }

    render() {

        let {options, actionLabel, placeholder, ...rest} = this.props;
        let {value} = this.state;

        let smallDdl = this.props.hasOwnProperty('small') ? 'small' : '';
        let smallBtn = this.props.hasOwnProperty('small') ? 'btn-group-sm' : 'normal';

        let theValue = (value instanceof Object || value == null) ? value : options.find(opt => opt.value == value);


        return (
            <div className={"action-dropdown btn-group " + smallBtn}>
                <Select
                    value={theValue}
                    onChange={this.handleChange}
                    options={options}
                    placeholder={placeholder}
                    className={"btn-group action-select text-left" + smallDdl}
                    isClearable={false}
                />
                <button type="button" className="btn btn-default action-button" onClick={this.handleClick}>
                    {actionLabel}
                </button>
            </div>
        );

    }
}
