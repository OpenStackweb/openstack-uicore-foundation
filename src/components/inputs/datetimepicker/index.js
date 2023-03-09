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
import './datetimepicker.less';
import Datetime from 'react-datetime';
import moment from 'moment-timezone';

export default class DateTimePicker extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.handleChange = this.handleChange.bind(this);
        this.isValidDate = this.isValidDate.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.value !== prevProps.value) {
            this.setState({value: this.props.value})
        }
    }

    handleChange(date) {

        let { timezone } = this.props;

        if (date && moment.isMoment(date)) {
            date = moment.tz(date.format('YYYY-MM-DD HH:mm:ss'), timezone)
        } else if (date === '') {
            date = moment(0);
        }

        let ev = {target: {
                id: this.props.id,
                value: date,
                type: 'datetime'
            }};

        if (date && moment.isMoment(date)) {
            this.props.onChange(ev);
        }

    }

    isValidDate(currentDate, selectedDate) {
        let { timezone, validation } = this.props;
        let {after, before} = validation;

        if (after == '<')
            return (currentDate.isBefore(moment.tz(before * 1000, timezone)));
        else if(after == '<=')
            return (currentDate.isSameOrBefore(moment.tz(before * 1000, timezone)));
        else if(after == '>')
            return (currentDate.isAfter(moment.tz(before * 1000, timezone)));
        else if(after == '>=')
            return (currentDate.isSameOrAfter(moment.tz(before * 1000, timezone)));
        else {
            let afterDate = moment.tz(after * 1000, timezone).subtract(1, 'day');
            let beforeDate = moment.tz(before * 1000, timezone);
            return currentDate.isAfter(afterDate) && currentDate.isBefore(beforeDate);
        }
    }

    render() {
        let validate = (typeof this.props.validation != 'undefined');
        let {onChange, id, value, format, error, inputProps, disabled, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        let className = 'form-control ' + (has_error ? 'error' : '');
        let inputDisabled = (this.props.hasOwnProperty('disabled')) ? disabled : false;

        return (
            <div>
                {validate ? (
                    <Datetime
                        isValidDate={this.isValidDate}
                        onChange={this.handleChange}
                        dateFormat={format.date}
                        timeFormat={format.time}
                        value={this.state.value}
                        inputProps={{...inputProps, id: id, className: className, disabled: inputDisabled, autoComplete: 'off'}}
                        {...rest}
                    />
                ) : (
                    <Datetime
                        onChange={this.handleChange}
                        dateFormat={format.date}
                        timeFormat={format.time}
                        value={this.state.value}
                        inputProps={{...inputProps, id: id, className: className, disabled: inputDisabled, autoComplete: 'off'}}
                        {...rest}
                    />
                )}

                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );
    }
}
