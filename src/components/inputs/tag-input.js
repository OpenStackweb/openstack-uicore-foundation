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
import {queryTags} from '../../utils/query-actions';
import {shallowEqual} from "../../utils/methods";

export default class TagInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value.map((t) => ({tag: t.tag}))
        };

        this.handleChange = this.handleChange.bind(this);
        this.getTags = this.getTags.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(!shallowEqual(this.props.value, prevProps.value)) {
            let nextValue = this.props.value.map((t) => ({tag: t.tag}));

            this.setState({value: nextValue});
        }
    }

    handleChange(value) {
        let ev = {target: {
                id: this.props.id,
                value: value,
                type: 'taginput'
            }};

        this.props.onChange(ev);
    }

    getTags (input, callback) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        let summitId = (this.props.hasOwnProperty('summitId')) ? this.props.summitId : null;

        queryTags(summitId, input, callback);
    }

    render() {
        let {className, error, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );

        let orderedTags = this.state.value.sort((a, b) => (a.tag.toLowerCase() > b.tag.toLowerCase() ? 1 : (a.tag.toLowerCase() < b.tag.toLowerCase() ? -1 : 0)));

        return (
            <div>
                <AsyncSelect
                    className={className + ' ' + (has_error ? 'error' : '')}
                    isMulti
                    value={orderedTags}
                    onChange={this.handleChange}
                    loadOptions={this.getTags}
                    getOptionLabel={option => option.tag}
                    getOptionValue={option => option.tag}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}
