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

const OperatorInput = ({ error, label, value, onChange, id, multi, isMulti, className, isDisabled, isClearable, options, selectStyles, ...rest }) => {

    const [operatorValue, setOperatorValue] = useState({ value: null, label: '' });
    const [inputValue, setInputValue] = useState('');
    const [inputValueBetween, setInputValueBetween] = useState('');
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
        setInputValue('');
        setInputValueBetween('');
        setOperatorValue({ value: eventValue.value, label: eventValue.label });        
    }

    const handleInputChange = (evt) => {
        if (operatorValue.value === 'between') {
            evt.target.id === 'operator-input' ? setInputValue(evt.target.value) : setInputValueBetween(evt.target.value);
            let ev = {
                target: {
                    id: id,
                    value: `>=${inputValue},<=${inputValueBetween}`,
                    type: 'operatorinput'
                }
            };
            onChange(ev);
        } else {
            setInputValue(evt.target.value);
            let ev = {
                target: {
                    id: id,
                    value: `${operatorValue.value}${evt.target.value}`,
                    type: 'operatorinput'
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
        <div className={className} style={defaultStyle}>
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