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
import {DEFAULT_PAGE_SIZE, queryPromocodes} from '../../utils/query-actions';

const PromocodeInput = ({summitId, error, value, onChange, id, multi, extraFilters, ...rest}) => {

    const handleChange = (value) => {
        let theValue = null;
        const isMulti = multi || rest.isMulti;
        if (value) {
            theValue = isMulti ? value.map(v => ({id: v.value, code: v.label})) : {id: value.value, code: value.label};
        }

        let ev = {target: {
                id: id,
                value: theValue,
                type: 'promocodeinput'
            }};

        onChange(ev);
    }

    const getPromocodes = (input, callback) => {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        const translateOptions = (options) => {
            let newOptions = options.map(c => ({value: c.id.toString(), label: c.code}));
            callback(newOptions);
        };

        queryPromocodes(summitId, input, translateOptions, DEFAULT_PAGE_SIZE, extraFilters);
    }

    const has_error = !!( error && error !== '' );
    const isMulti = multi || rest.isMulti;

    // we need to map into value/label because of a bug in react-select 2
    // https://github.com/JedWatson/react-select/issues/2998

    let theValue = null;

    if (isMulti && value.length > 0) {
        theValue = value.map(v => ({value: v.id.toString(), label: v.code} ));
    } else if (!isMulti && value) {
        theValue = {value: value.id.toString(), label: value.code};
    }

    return (
        <div>
            <AsyncSelect
                value={theValue}
                onChange={handleChange}
                loadOptions={getPromocodes}
                isMulti={isMulti}
                {...rest}
            />
            {has_error &&
            <p className="error-label">{error}</p>
            }
        </div>
    );
}

export default PromocodeInput;
