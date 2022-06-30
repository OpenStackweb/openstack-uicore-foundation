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
import AsyncSelect from 'react-select/lib/Async';
import { queryRegistrationCompanies } from '../../utils/query-actions';

const RegistrationCompanyInput = ({ error, value, onChange, id, multi, isMulti, className, summitId, onError, rawInput, ...rest }) => {

    const [theValue, setTheValue] = useState({ value: null, label: '' });
    const [freeInput, setFreeInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isMultiOptional, setIsMultiOptional] = useState(multi || isMulti);
    const [hasError, setHasError] = useState(error);

    console.log('RegistrationCompanyInput', rawInput);

    useEffect(() => {
        console.log('raw input', rawInput)
        if (rawInput) {
            setFreeInput(true);
        }
    }, []);

    useEffect(() => {
        setHasError(error);
    }, [error]);

    useEffect(() => {
        if (!value.id && value.name) {
            setFreeInput(true);
            setInputValue(value.name);
            setTheValue({ value: null, label: value.name })
        } else {
            if (isMulti && value.length > 0) {
                setTheValue(value.map(v => ({ value: v.id, label: v.name })));
            } else if (!isMulti && value.id) {
                setTheValue({ value: value.id, label: value.name });
            }
        }
    }, [value])

    const handleChange = (eventValue) => {
        if (eventValue.value === null) {
            setFreeInput(true);
            const newValueState = isMultiOptional ? eventValue.map(v => ({ value: v.value, label: '' })) : { value: eventValue.value, label: '' };
            setTheValue(newValueState);
            let ev = {
                target: {
                    id: id,
                    value: newValueState,
                    type: 'companyinput'
                }
            };
            onChange(ev);
            return;
        }

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

    const handleInputClear = () => {
        setFreeInput(!freeInput);
        setInputValue('');
        setTheValue({ value: null, label: '' });
        let ev = {
            target: {
                id: id,
                value: { id: null, name: '' },
                type: 'companyinput'
            }
        };
        onChange(ev);
    }

    const handleInputChange = (evt) => {
        setInputValue(evt.target.value);
        let ev = {
            target: {
                id: id,
                value: { id: null, name: evt.target.value },
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
            const otherOption = { value: null, label: 'Other' };
            let newOptions = [...options.map(c => ({ value: c.id.toString(), label: c.name })), otherOption];
            callback(newOptions);
        };

        queryRegistrationCompanies(summitId, input, translateOptions);
    }

    return (
        <div>
            {freeInput ?
                <>
                    <input
                        value={inputValue}
                        placeholder="Enter your company"
                        onChange={handleInputChange}
                        className="form-control"
                        style={{ paddingRight: 25 }}
                        {...rest}
                    />
                    {!rawInput &&
                        <i aria-label='Clear' style={{ position: 'absolute', top: 10, right: 25, cursor: 'pointer', opacity: '65%' }}
                            onClick={handleInputClear} className='fa fa-close'></i>
                    }

                </>
                :
                <AsyncSelect
                    // Passing null if no label and value to show the placeholder
                    value={theValue.label && theValue.value ? theValue : null}
                    placeholder='Select a company'
                    onChange={handleChange}
                    defaultOptions={[{ value: null, label: 'Other' }]}
                    loadOptions={getCompanies}
                    isMulti={isMultiOptional}
                    className={className}
                    {...rest}
                />
            }
            {hasError &&
                <p className="error-label">{error}</p>
            }
        </div>
    );

}

export default RegistrationCompanyInput;

RegistrationCompanyInput.propTypes = {
    onError: PropTypes.func.isRequired
};