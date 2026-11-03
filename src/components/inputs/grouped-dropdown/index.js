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
import { OptionGroup } from './OptionGroup';
import './optiongroup.less';

export default class GroupedDropdown extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.value !== prevProps.value) {
            this.setState({value: this.props.value})
        }
    }

    handleChange(ev) {
        this.props.onChange(ev);
    }

    render() {
        let {id, options, placeholder, className, error} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        let {value} = this.state;

        return (
            <div>
                <select
                    id={id}
                    className={className + ' form-control ' + (has_error ? 'error' : '')}
                    value={value}
                    onChange={this.handleChange}>
                        <option value="" disabled>{placeholder}</option>
                        {options.map((opt,i) =>
                            {
                                if (typeof opt.options != 'undefined') {
                                    return (
                                        <OptionGroup key={'group_opt_'+i} label={opt.label} value={opt.value} options={opt.options}/>
                                    );
                                } else {
                                    return (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    );
                                }
                            }
                        )}
                </select>
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );
    }
}

GroupedDropdown.propTypes = {
    id: PropTypes.string,
    /** An entry with a nested `options` array renders as an optgroup; otherwise a plain option. */
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        label: PropTypes.string,
        options: PropTypes.array
    })).isRequired,
    /** Native select value. Mirrored into local state and re-synced when the prop changes. */
    value: PropTypes.any,
    /** Receives the raw DOM change event. */
    onChange: PropTypes.func.isRequired,
    /** Rendered as a disabled first option. */
    placeholder: PropTypes.string,
    className: PropTypes.string,
    /** Non-empty renders an .error-label and adds the error class. */
    error: PropTypes.string
};