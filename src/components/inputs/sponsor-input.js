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
import AsyncSelect from 'react-select/lib/Async';
import {querySponsors} from '../../utils/query-actions';

const SponsorInput = ({id, summitId, value, error, multi, onChange, queryFunction, ...rest}) => {
    const queryFn = queryFunction || querySponsors;
    const has_error = error !== '' ;

    const handleChange = (value) => {
        let ev = {target: {
            id: id,
            value: value,
            type: 'sponsorinput'
        }};

        onChange(ev);
    }

    const getSponsors = (input, callback) => {
        queryFn(summitId, input, callback);
    }

    return (
        <div>
            <AsyncSelect
                value={value}
                getOptionValue={option => option.id}
                getOptionLabel={option => `${option.company.name} (${option.sponsorship?.type?.name})`}
                onChange={handleChange}
                loadOptions={getSponsors}
                isMulti={multi}
                {...rest}
            />
            {has_error &&
                <p className="error-label">{error}</p>
            }
        </div>
    );
}

export default SponsorInput;
