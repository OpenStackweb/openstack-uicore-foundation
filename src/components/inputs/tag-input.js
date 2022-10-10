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
import AsyncSelect from 'react-select/lib/Async';
import AsyncCreatableSelect from "react-select/lib/AsyncCreatable";
import { queryTags } from '../../utils/query-actions';
import { shallowEqual } from "../../utils/methods";

export default class TagInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tagValue: props.value.map((t) => ({ tag: t.tag, id: t.id }))
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.getTags = this.getTags.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!shallowEqual(this.props.value, prevProps.value)) {
            let nextValue = this.props.value.map((t) => ({ tag: t.tag, id: t.id }));
            this.setState({ tagValue: nextValue });
        }
    }

    handleNew(ev) {
        const newTag = { tag: ev }
        this.props.onCreate(ev, this.setState({ value: [...this.state.tagValue, newTag] }));
    }

    handleChange(value) {
        let ev = {
            target: {
                id: this.props.id,
                value: value,
                type: 'taginput'
            }
        };

        this.props.onChange(ev);
    }

    getTags(input, callback) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        let summitId = (this.props.hasOwnProperty('summitId')) ? this.props.summitId : null;

        queryTags(summitId, input, callback);
    }

    render() {
        let { className, error, allowCreate, ...rest  } = this.props;
        let { tagValue } = this.state;
        let has_error = (this.props.hasOwnProperty('error') && error != '');
        let orderedTags = tagValue.sort((a, b) => (a.tag.toLowerCase() > b.tag.toLowerCase() ? 1 : (a.tag.toLowerCase() < b.tag.toLowerCase() ? -1 : 0)));

        const AsyncComponent = allowCreate
            ? AsyncCreatableSelect
            : AsyncSelect;

        return (
            <div>
                <AsyncComponent
                    {...rest}
                    className={className + ' ' + (has_error ? 'error' : '')}
                    isMulti
                    value={orderedTags}
                    onChange={this.handleChange}
                    onCreateOption={this.handleNew}
                    loadOptions={this.getTags}
                    getOptionLabel={option => option.__isNew__ ? option.label : option.tag}
                    getOptionValue={option => option.__isNew__ ? option.value : option.tag}
                />
                {has_error &&
                    <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}

TagInput.propTypes = {
    allowCreate: PropTypes.bool,
    className: PropTypes.string,
    summitId: PropTypes.number,    
    id: PropTypes.string.isRequired,
    value: PropTypes.array,
    onCreate: PropTypes.func,
    onChange: PropTypes.func.isRequired,
};

TagInput.defaultProps = {
    allowCreate: false
}
