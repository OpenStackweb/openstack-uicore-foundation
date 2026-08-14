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
import Select from 'react-select';

const SummitDaysSelect = ({ days, currentValue, placeholder, onDayChanged }) => {
    const theValue = days.find(op => op.value === currentValue) || null;

    const onChange = (selectedOption) => {
        onDayChanged(selectedOption?.value || null);
    };

    return (
        <Select
            placeholder={placeholder} //T.translate("schedule.placeholders.select_day")
            className="day-selector"
            name="form-field-name"
            value={theValue}
            onChange={onChange}
            options={days}
        />
    );
}

SummitDaysSelect.propTypes = {
    /** Doubles as the option list, so each entry needs both value and label. */
    days: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    /** Matched against day.value. Anything unmatched shows the placeholder. */
    currentValue: PropTypes.string,
    placeholder: PropTypes.string,
    /** Receives the selected day value, or null when cleared. */
    onDayChanged: PropTypes.func.isRequired
};

export default SummitDaysSelect;
