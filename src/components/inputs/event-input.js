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
import AsyncSelect from 'react-select/lib/Async';
import {queryEvents} from '../../utils/query-actions';

export default class EventInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.getEvents = this.getEvents.bind(this);
    }

    handleChange(value) {

        let ev = {target: {
            id: this.props.id,
            value: value,
            type: 'eventinput'
        }};

        this.props.onChange(ev);
    }

    getEvents (input, callback) {
        let {summit, onlyPublished} = this.props;

        if (!input) {
            return Promise.resolve({ options: [] });
        }

        queryEvents(summit.id, input, onlyPublished, callback);
    }

    render() {
        let {value, onChange, id, multi, ...rest} = this.props;
        let isMulti = (this.props.hasOwnProperty('multi'));

        return (
            <AsyncSelect
                value={value}
                onChange={this.handleChange}
                loadOptions={this.getEvents}
                getOptionValue={option => option.id}
                getOptionLabel={option => option.title}
                isMulti={isMulti}
                {...rest}
            />
        );

    }
}

EventInput.propTypes = {
    /** Selected event(s). */
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string, PropTypes.number]),
    /** Echoed back as ev.target.id on the synthetic change event. */
    id: PropTypes.string.isRequired,
    /** Receives a synthetic { target: { id, value, type } }. */
    onChange: PropTypes.func.isRequired,
    /** Gated on the prop being present, so multi={false} still enables multi-select. */
    multi: PropTypes.bool,
    /** Not read by this component; not destructured, so it flows through ...rest into AsyncSelect, which does not render it. */
    error: PropTypes.string,
    /** Scopes the lookup; summit.id is what is actually read. */
    summit: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }).isRequired,
    /** Restricts results to published events. */
    onlyPublished: PropTypes.bool
};
