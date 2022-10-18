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
import PropTypes from 'prop-types';
import './simple-link-list.less';
import AsyncSelect from 'react-select/lib/Async';
import Table from "../table/Table";
import T from 'i18n-react/dist/i18n-react';
import AsyncCreatableSelect from "react-select/lib/AsyncCreatable";


class SimpleLinkList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.getOptions = this.getOptions.bind(this);
        this.handleLink = this.handleLink.bind(this);
        this.filterOption = this.filterOption.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.getNewOptionData = this.getNewOptionData.bind(this);
        this.isValidNewOption = this.isValidNewOption.bind(this);
    }

    getOptions(input, callback) {
        let {options} = this.props;
        let defaultOptions = options.hasOwnProperty('defaultOptions') ? options.defaultOptions : undefined;

        if (!input && !defaultOptions) {
            return Promise.resolve({ options: [] });
        }

        this.props.options.actions.search(input, callback);
    }

    handleChange(value) {
        this.setState({value});
    }

    handleLink(ev) {
        ev.preventDefault();
        this.props.options.actions.add.onClick(this.state.value);
        this.setState({value: ''});
    }

    getNewOptionData(inputValue, optionLabel) {
        return {tag: optionLabel, id:inputValue};
    }

    isValidNewOption(inputValue, selectValue, selectOptions) {
        let {options} = this.props;
        let labelKey = options.hasOwnProperty('labelKey') ? options.labelKey : 'label';
        let optionFound = selectOptions.find(op => op[labelKey] == inputValue);
        return (!inputValue || optionFound) ? false : true;
    }

    handleNew(value) {
        this.props.options.onCreateTag(value, this.handleChange);
    }

    filterOption(candidate, inputValue) {
        let {options, values} = this.props;
        let allowDuplicates = this.props.hasOwnProperty('allowDuplicates');
        let labelKey = options.hasOwnProperty('labelKey') ? options.labelKey : 'label';

        if (allowDuplicates) return true;

        let optionFound = values.find(val => val[labelKey] === candidate.label);

        return !optionFound;
    }


    render() {

        let {options, values, columns} = this.props;
        let disabledAdd = (!this.state.value);

        let title = options.hasOwnProperty('title') ? options.title : 'Table';
        let valueKey = options.hasOwnProperty('valueKey') ? options.valueKey : 'value';
        let labelKey = options.hasOwnProperty('labelKey') ? options.labelKey : 'label';
        let allowCreate = options.hasOwnProperty('onCreateTag');
        let defaultOptions = options.hasOwnProperty('defaultOptions') ? options.defaultOptions : undefined;

        let tableOptions = {
            className: 'dataTable',
            actions: {
                delete: options.actions.delete
            }
        };

        if (options.hasOwnProperty('className')) {
            tableOptions.className = options.className;
        }

        if (options.actions.hasOwnProperty('edit')) {
            tableOptions.actions.edit = options.actions.edit;
        }

        if (options.actions.hasOwnProperty('custom')) {
            tableOptions.actions.custom = options.actions.custom;
        }

        if (options.hasOwnProperty('sortCol')) {
            values = values.sort(
                (a, b) => {
                    const itemA = isNaN(a[options.sortCol]) ? a[options.sortCol].toLowerCase() : a[options.sortCol];
                    const itemB = isNaN(b[options.sortCol]) ? b[options.sortCol].toLowerCase() : b[options.sortCol];
                    return (itemA > itemB ? 1 : (itemA < itemB ? -1 : 0))
                }
            );
        }


        let AsyncComponent = null;

        if (allowCreate) {
            AsyncComponent =
                <AsyncCreatableSelect
                    className="link-select btn-group text-left"
                    value={this.state.value}
                    key={JSON.stringify(values)}
                    getOptionValue={option => option[valueKey]}
                    getOptionLabel={option => option[labelKey]}
                    onChange={this.handleChange}
                    loadOptions={this.getOptions}
                    filterOption={this.filterOption}
                    onCreateOption={this.handleNew}
                    getNewOptionData={this.getNewOptionData}
                    isValidNewOption={this.isValidNewOption}
                />;
        } else {
            AsyncComponent =
                <AsyncSelect
                    className="link-select btn-group text-left"
                    value={this.state.value}
                    key={JSON.stringify(values)}
                    getOptionValue={option => option[valueKey]}
                    getOptionLabel={option => option[labelKey]}
                    onChange={this.handleChange}
                    loadOptions={this.getOptions}
                    filterOption={this.filterOption}
                    defaultOptions={defaultOptions}
                />;
        }

        return (
            <div className="row simple-link-list">
                <div className="col-md-4 simple-link-list-title">
                    <h4>{title}</h4>
                </div>
                <div className="col-md pull-right btn-group">
                    {AsyncComponent}
                    <button type="button" className="btn btn-default add-button" onClick={this.handleLink} disabled={disabledAdd}>
                        {T.translate("general.add")}
                    </button>
                </div>
                <div className="col-md-12">
                    <Table
                        className="dataTable"
                        options={tableOptions}
                        data={values}
                        columns={columns}
                    />
                </div>
            </div>
        );

    }
}

SimpleLinkList.propTypes = {
    values: PropTypes.array.isRequired,
    options: PropTypes.shape({
        title: PropTypes.string,
        sortCol: PropTypes.string,
        valueKey: PropTypes.string.isRequired,
        labelKey: PropTypes.string.isRequired,
        className: PropTypes.string,
        actions: PropTypes.shape({
            search: PropTypes.func.isRequired,
            delete: PropTypes.shape({onClick:PropTypes.func.isRequired}),
            add: PropTypes.shape({onClick:PropTypes.func.isRequired}),
            edit: PropTypes.shape({onClick:PropTypes.func.isRequired}),
            custom: PropTypes.array,
        }).isRequired
    }).isRequired,
    columns: PropTypes.array.isRequired
}

export default SimpleLinkList;
