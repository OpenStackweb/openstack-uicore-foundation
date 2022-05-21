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

export default class Input extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
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

        let {onChange, value, className, error, containerClassName, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error !== '' );
        let class_name = this.props.hasOwnProperty('className') ? className : 'form-control';
        let container_class_name = this.props.hasOwnProperty('containerClassName') ? containerClassName : 'container-form-control';
        return (
            <div className={container_class_name}>
                <input
                    className={class_name + ' ' + (has_error ? 'error' : '')}
                    value={this.state.value}
                    onChange={this.handleChange}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}