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

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'
import AsyncCreatableSelect from "react-select/lib/AsyncCreatable";
import { queryRegistrationCompanies } from '../../utils/query-actions';

const RegistrationCompanyInput = ({ 
        error, value, onChange, id, multi,isMulti, disabled, className, summitId, onError, 
        DDLPlaceholder, tabSelectsValue, selectStyles, createLabel, ...rest }) => {

    const [theValue, setTheValue] = useState({ value: null, label: '' });
    const [isMultiOptional, setIsMultiOptional] = useState(multi || isMulti);
    const [hasError, setHasError] = useState(error);

    useEffect(() => {
        setHasError(error);
    }, [error]);

    useEffect(() => {
        if (!value.id && value.name) {
            setTheValue({ value: null, label: value.name })
        } else {
            if (isMulti && value.length > 0) {
                setTheValue(value.map(v => ({ value: v.id, label: v.name })));
            } else if (!isMulti && value.id) {
                setTheValue({ value: value.id, label: value.name });
            }
        }
    }, [value]);

    const handleChange = (eventValue) => {
        const newValue = isMultiOptional ? eventValue.map(v => ({ id: v.value, name: v.label })) : { id: eventValue.value, name: eventValue.label };
        const newValueState = isMultiOptional ? eventValue.map(v => ({ value: v.value, label: v.label })) : { value: eventValue.value, label: eventValue.label };
        setTheValue(newValueState);

        let ev = {
            target: {
                id: id,
                value: newValue,
                type: 'companyinput'
            }
        };

        onChange(ev);
    }

    const getCompanies = (input, callback) => {

        const translateOptions = (options) => {

            if (options instanceof Error) {
                onError(options);
            }
            if (options.length === 0) {
                callback([]);
            }
            // we need to map into value/label because of a bug in react-select 2
            // https://github.com/JedWatson/react-select/issues/2998
            let newOptions = [...options.map(c => ({ value: c.id.toString(), label: c.name }))];
            callback(newOptions);
        };

        queryRegistrationCompanies(summitId, input, translateOptions);
    }

    const handleNewOption = (newOption) => {
        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998        
        handleChange({value: 0, label: newOption});
    }

    const classNamPrefix =`${className}_prefix`;

    return (
        <div style={{ position: 'relative' }}>
            <AsyncCreatableSelect
                // Passing null if no label and no value property to show the placeholder
                value={theValue.label && theValue.hasOwnProperty("value") ? theValue : null}
                inputId={id}
                tabSelectsValue={tabSelectsValue}
                placeholder={DDLPlaceholder}
                onChange={handleChange}
                defaultOptions={true}
                loadOptions={getCompanies}
                isMulti={isMultiOptional}
                className={className}
                classNamePrefix={classNamPrefix}
                styles={selectStyles}
                onCreateOption={handleNewOption}
                formatCreateLabel={(value) => `${createLabel} ${value}`}
                isDisabled={disabled}
                {...rest}
            />
            {hasError &&
                <p className="error-label">{error}</p>
            }
        </div>
    );

}

export default RegistrationCompanyInput;

RegistrationCompanyInput.defaultProps = {
    DDLPlaceholder: 'Select a company',
    disabled: false,
    tabSelectsValue: false,
    createLabel: 'Select ',
    className:'registration_company_dll',
}

RegistrationCompanyInput.propTypes = {
    onError: PropTypes.func.isRequired
};
