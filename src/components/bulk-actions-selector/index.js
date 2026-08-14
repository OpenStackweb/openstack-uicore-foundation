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
import T from "i18n-react/dist/i18n-react";
import './styles.less';
class ScheduleAdminsBulkActionsSelector extends React.Component {

    onPerformBulkAction(){
        let selectedBulkAction = this.actionTypeSelect.value;
        if(selectedBulkAction === '') return;
        this.props.onSelectedBulkAction(selectedBulkAction);
    }

    render(){
        let { onSelectAll, bulkOptions, show } = this.props;
        return (
            <div className="bulk-actions-selector-container">
                {show &&
                <div className="row">
                    <div className="col-md-8">
                        <input type="checkbox" onClick={onSelectAll}/>
                        <select ref={(select) => { this.actionTypeSelect = select; }}>
                            <option value="">{T.translate("published_bulk_actions_selector.options.default")}</option>
                            {
                                bulkOptions.map((option, idx) => (
                                    <option key={idx} value={option.value}>{option.label}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="col-md-4">
                        <button onClick={this.onPerformBulkAction.bind(this)} title={ T.translate("published_bulk_actions_selector.titles.go")} className="btn btn-default btn-sm">
                            <i className="fa fa-play">&nbsp;{T.translate("published_bulk_actions_selector.buttons.go")}</i>
                        </button>
                    </div>
                </div>
                }
            </div>
        )
    }
}

ScheduleAdminsBulkActionsSelector.propTypes = {
    /** Renders nothing when false; the container element is always present. */
    show: PropTypes.bool,
    /** Actions offered alongside the built-in default option. */
    bulkOptions: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    /** Click handler for the select-all checkbox; the component tracks no selection itself. */
    onSelectAll: PropTypes.func,
    /** Receives the chosen action value on Go. Not called while the default option is selected. */
    onSelectedBulkAction: PropTypes.func.isRequired
};

export default ScheduleAdminsBulkActionsSelector;
