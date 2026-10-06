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

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/lib/Async';
import {queryAttendees} from '../../utils/query-actions';

const AttendeeInput = ({id, value, summitId, error, multi, onChange, getOptionValue, getOptionLabel, queryFunction, ...rest}) => {
    const queryFn = queryFunction || queryAttendees;
    const [_value, _setValue] = useState(value);
    const has_error = ( error !== '' );

    const _getOptionValue = (attendee) => {
        if (getOptionValue){
            return getOptionValue(attendee);
        }
        //default
        return attendee.id;
    }

    const _getOptionLabel = (attendee) => {
        if (getOptionLabel){
            return getOptionLabel(attendee);
        }
        //default
        return `${attendee.first_name} ${attendee.last_name} (${attendee.id})`;
    }

    const handleChange = (value) => {
        let ev = {target: {
            id: id,
            value: value,
            type: 'attendeeinput'
        }};

        onChange(ev);
    }

    const getAttendees = (input, callback) => {
        if (!input) {
            return Promise.resolve({ options: [] });
        }
        queryFn(summitId, input, callback);
    }
    
    return (
        <div>
            <AsyncSelect
                value={value}
                onChange={handleChange}
                loadOptions={getAttendees}
                getOptionValue={m => _getOptionValue(m)}
                getOptionLabel={m => _getOptionLabel(m)}
                {...rest}
            />
            {has_error &&
                <p className="error-label">{error}</p>
            }
        
        </div>
    );
}

AttendeeInput.propTypes = {
    /** Selected attendee(s). */
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string, PropTypes.number]),
    /** Echoed back as ev.target.id on the synthetic change event. */
    id: PropTypes.string.isRequired,
    /** Receives a synthetic { target: { id, value, type } }. */
    onChange: PropTypes.func.isRequired,
    /** No effect on this component: it is destructured out of props so it never reaches ...rest, and isMulti is never computed or passed to AsyncSelect. Consumers still pass it; it does nothing here. */
    multi: PropTypes.bool,
    /** Non-empty renders an .error-label. */
    error: PropTypes.string,
    /** Scopes the lookup. Required for results to return. */
    summitId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Overrides the default queryAttendees lookup. */
    queryFunction: PropTypes.func,
    /** (attendee) => value. Defaults to attendee.id. */
    getOptionValue: PropTypes.func,
    /** (attendee) => label. */
    getOptionLabel: PropTypes.func
};
export default AttendeeInput;

