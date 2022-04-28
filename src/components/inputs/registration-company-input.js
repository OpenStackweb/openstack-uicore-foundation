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
import { queryRegistrationCompanies } from '../../utils/query-actions';

export default class RegistrationCompanyInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            freeInput: false,
            inputValue: '',
            noOptions: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.getCompanies = this.getCompanies.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

    }

    handleChange(value) {
        const isMulti = (this.props.hasOwnProperty('multi') || this.props.hasOwnProperty('isMulti'));
        const theValue = isMulti ? value.map(v => ({ id: v.value, name: v.label })) : { id: value.value, name: value.label };

        let ev = {
            target: {
                id: this.props.id,
                value: theValue,
                type: 'companyinput'
            }
        };

        if (value.value === null) {
            this.setState({ freeInput: true })
        }

        this.props.onChange(ev);
    }

    handleInputChange(ev) {
        this.setState({ inputValue: ev.target.value }, () => {
            let ev = {
                target: {
                    id: this.props.id,
                    value: { id: null, name: this.state.inputValue },
                    type: 'companyinput'
                }
            };
            this.props.onChange(ev);
        });
    }

    getCompanies(input, callback) {
        let { summitId } = this.props;

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        const translateOptions = (options) => {            
            if (options instanceof Error) {
                this.props.onError(options);
            }
            if (options.length === 0) {
                this.setState({ noOptions: true })
            }
            const otherOption = { value: null, label: 'Other' };
            let newOptions = [...options.map(c => ({ value: c.id.toString(), label: c.name })), otherOption];
            callback(newOptions);
        };

        queryRegistrationCompanies(summitId, input, translateOptions);
    }

    render() {
        let { error, value, onChange, id, multi, className, ...rest } = this.props;
        let { freeInput, inputValue, noOptions } = this.state;
        let has_error = (this.props.hasOwnProperty('error') && error != '');
        let isMulti = (this.props.hasOwnProperty('multi') || this.props.hasOwnProperty('isMulti'));

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        let theValue = null;

        if (isMulti && value.length > 0) {
            theValue = value.map(v => ({ value: v.id.toString(), label: v.name }));
        } else if (!isMulti && value) {
            theValue = { value: value.id.toString(), label: value.name };
        }

        return (
            <div>
                {freeInput || noOptions ?
                    <>
                        <input
                            value={inputValue}
                            placeholder="Enter your company"
                            onChange={this.handleInputChange}
                            className="form-control"
                            style={{ paddingRight: 25 }}
                            {...rest}
                        />
                        {!noOptions &&
                            <i aria-label='Clear' style={{ position: 'absolute', bottom: 10, right: 25, cursor: 'pointer', opacity: '65%' }}
                                onClick={() => this.setState({ freeInput: !freeInput, inputValue: '' })} className='fa fa-close'></i>
                        }
                    </>
                    :
                    <AsyncSelect
                        value={theValue}
                        onChange={this.handleChange}
                        defaultOptions={true}
                        loadOptions={this.getCompanies}
                        isMulti={isMulti}
                        className={className}
                        {...rest}
                    />
                }
                {has_error &&
                    <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}