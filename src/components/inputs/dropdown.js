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
import Select from 'react-select';

export default class Dropdown extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(selection) {

        let value = selection ? selection.value : null;
        let ev = {target: {
            id: this.props.id,
            value: value,
            type: 'dropdown'
        }};

        this.props.onChange(ev);
    }

    render() {

        let {onChange, value, className, error, clearable, disabled, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        let isClearable = (this.props.hasOwnProperty('clearable'));
        let isDisabled = (this.props.hasOwnProperty('disabled') && disabled == true);
        let theValue = null;

        if (this.props.isMulti) {
            theValue = this.props.options.filter(op => value.includes(op.value));
        } else {
            theValue = (value instanceof Object || value == null) ? value : this.props.options.find(opt => opt.value == value);
        }

        return (
            <div>
                <Select
                    className={'dropdown ' + className + ' ' + (has_error ? 'error' : '')}
                    value={theValue}
                    onChange={this.handleChange}
                    isClearable={isClearable}
                    isDisabled={isDisabled}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}
