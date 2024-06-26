/**
 * Copyright 2018 OpenStack Foundation
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
import RawHTML from '../raw-html';
import PropTypes from 'prop-types'

import "awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css";

export default class RadioList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(selection) {

        let ev = {target: {
                id: this.props.id,
                value: selection.target.value,
                type: 'radio'
            }};

        this.props.onChange(ev);
    }

    getLabel(option, id, inline, simple) {
        if (inline) {
            return (
                <label className="form-check-label" htmlFor={`radio_${id}_${option.value}`} style={{display: 'inline-block'}}>
                    <RawHTML>
                        {option.label}
                    </RawHTML>
                </label>
            );
        } else if (simple) {
            return (
                <label className="form-check-label" htmlFor={`radio_${id}_${option.value}`} >
                    {option.label}
                </label>
            );
        } else {
            return (
                <label className="form-check-label" htmlFor={`radio_${id}_${option.value}`} style={{display: 'inline-block'}}>
                    <h4 style={{marginTop: '0px'}}>{option.label}</h4>
                    <RawHTML>{option.description}</RawHTML>
                </label>
            );
        }
    }

    render() {

        let {onChange, value, className, error, ariaLabelledBy, disabled, options,id, name,...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        let inline = ( this.props.hasOwnProperty('inline') );
        let simple = ( this.props.hasOwnProperty('simple') );
        let isDisabled = (this.props.hasOwnProperty('disabled') && disabled == true);

        let style, label;

        if (inline) {
            style = {
                paddingLeft: '22px',
                marginLeft: '20px',
                float: 'left'
            };


        } else {
            style = {
                paddingLeft: '22px'
            }
        }

        return (
            <div id={`rl_wrapper_${id}`} aria-labelledby={ariaLabelledBy}>
                { options.map(op => {
                    let checked = (op.value == value);
                    return (
                        <div className="form-check abc-radio" key={`radio_key_${id}_${op.value}`} style={style}>
                            <input
                                className="form-check-input"
                                type="radio"
                                id={`radio_${id}_${op.value}`}
                                value={op.value}
                                checked={checked}
                                onChange={this.handleChange}
                                disabled={isDisabled}
                                name={name ? name : `radio_${id}`}
                            />
                            {this.getLabel(op, id, inline, simple)}
                        </div>
                    )
                })}

                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}

RadioList.defaultProps = {
    ariaLabelledBy : null,
}

RadioList.propTypes = {
    id: PropTypes.string.isRequired
};
