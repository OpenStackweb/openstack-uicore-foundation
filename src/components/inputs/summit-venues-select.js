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

const SummitVenuesSelect = ({venues, currentValue, placeholder, onVenueChanged, ...rest}) => {
    const parsedValue = venues.find(v => v.value.id === currentValue?.id) || null;
    const renderOption = (option) => {
        let location = option.value;
        if (location.class_name === 'SummitVenue')
            return (<span className="location-option-venue">{location.name}</span>);
        return (<span className="location-option-room">-&nbsp;{location.name}</span>);
    }

    const onChange = (selectedOption) => {
        onVenueChanged(selectedOption?.value || null);
    }

    return (
        <Select
            placeholder={placeholder}
            className="venues-selector"
            name="form-field-name"
            value={parsedValue}
            onChange={onChange}
            options={venues}
            optionRenderer={renderOption}
            {...rest}
        />
    );
}

export default SummitVenuesSelect;
