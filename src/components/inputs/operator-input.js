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
import Select from 'react-select';

const OperatorInput = ({ error, label, value, onChange, id, multi, isMulti, className, isDisabled, isClearable, options, selectStyles, customStyle, ...rest }) => {

    // Set intial valus from value property, if is an array operator as between, and extract the operator and digits is the value is a string
    const [operatorValue, setOperatorValue] = useState(value ? Array.isArray(value) ? { value: 'between', label: 'Between' } : options.find(e => e.value === value.replace(/\d/g, '')) : ({ value: null, label: '' }));
    const [inputValue, setInputValue] = useState(value ? Array.isArray(value) ? value[0] : value.replace(/\D/g, '') : '');
    const [inputValueBetween, setInputValueBetween] = useState(Array.isArray(value) ? value[1] : '');
    const [ddlStyles, setDDLStyles] = useState({
        control: (provided, state) => ({
            ...provided,
            width: 175
        }),
        ...selectStyles
    });
    const [hasError, setHasError] = useState(error);

    useEffect(() => {
        setHasError(error);
    }, [error]);


    const handleOperatorChange = (eventValue) => {
        setInputValueBetween('');
        setOperatorValue({ value: eventValue.value, label: eventValue.label });        
        let ev = {
            target: {
                id: id,
                value: eventValue.value === 'between' ? [inputValue, inputValueBetween] : inputValue,
                type: 'operatorinput',
                operator: eventValue.value
            }
        };
        onChange(ev);
    }

    const handleInputChange = (evt) => {
        const onlyDigits = evt.target.value.replace(/\D/g, '');
        if (operatorValue.value === 'between') {
            evt.target.id === 'operator-input' ? setInputValue(onlyDigits) : setInputValueBetween(onlyDigits);
            let ev = {
                target: {
                    id: id,
                    value: evt.target.id === 'operator-input' ? [onlyDigits, inputValueBetween] : [inputValue, onlyDigits],
                    type: 'operatorinput',
                    operator: operatorValue.value
                }
            };
            onChange(ev);
        } else {
            setInputValue(onlyDigits);
            let ev = {
                target: {
                    id: id,
                    value: onlyDigits,
                    type: 'operatorinput',
                    operator: operatorValue.value
                }
            };
            onChange(ev);
        }
    }

    let selectClassName = className;

    const defaultStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    }

    return (
        <div className={className} style={customStyle ? customStyle : defaultStyle}>
            <label>{label}</label>
            <Select
                className={selectClassName}
                value={operatorValue}
                options={options}
                onChange={handleOperatorChange}
                isClearable={isClearable}
                isDisabled={isDisabled}
                styles={ddlStyles}
                {...rest}
            />
            <input
                id='operator-input'
                value={inputValue}
                onChange={handleInputChange}
                className="form-control"
                disabled={isDisabled}
                style={{ width: 'auto' }}
                {...rest}
            />
            {operatorValue.value === 'between' &&
                <>
                    <span>And</span>
                    <input
                        id='operator-input-between'
                        value={inputValueBetween}
                        onChange={handleInputChange}
                        className="form-control"
                        disabled={isDisabled}
                        style={{ width: 'auto' }}
                        {...rest}
                    />
                </>
            }
            {hasError &&
                <p className="error-label">{error}</p>
            }
        </div>
    );

}

export default OperatorInput;

OperatorInput.defaultProps = {
    options: [
        { value: '>', label: 'Greater than' },
        { value: '<', label: 'Less than' },
        { value: '>=', label: 'Greater or Equal' },
        { value: '<=', label: 'Less or Equal' },
        { value: '==', label: 'Equal' },
        { value: 'between', label: 'Between' },
    ],
};