import React from 'react';
import PropTypes from 'prop-types';
import SelectableTableHeading from './SelectableTableHeading';
import SelectableTableCell from './SelectableTableCell';
import SelectableTableRow from './SelectableTableRow';
import SelectableActionsTableCell from './SelectableActionsTableCell';
import { Tooltip } from 'react-tooltip'
import './selectable-table.less';

const defaults = {
    sortFunc: (a, b) => (a < b ? -1 : a > b ? 1 : 0),
    sortable: false,
    sortCol: 0,
    sortDir: 1,
    colWidth: "",
};

const createRow = (row, columns, actions) => {
    var action_buttons = "";
    var cells = columns.map((col, i) => {
        if (col.hasOwnProperty("render"))
            return (
                <SelectableTableCell
                    key={row["id"] + "_field" + i}
                    name={col.columnKey}
                    id={row.id}
                >
                    {col.render(row, row[col.columnKey])}
                </SelectableTableCell>
            );

        return (
            <SelectableTableCell
                key={row["id"] + "_field" + i}
                name={col.columnKey}
                id={row.id}
            >
                {row[col.columnKey]}
            </SelectableTableCell>
        );
    });

    if (actions) {
        cells.push(
            <SelectableActionsTableCell
                key="actions_cell"
                id={row["id"]}
                actions={actions}
            />
        );
    }

    return cells;
};

const getSortDir = (columnKey, columnIndex, sortCol, sortDir) => {
    if (columnKey && columnKey === sortCol) {
        return sortDir;
    }
    if (sortCol === columnIndex) {
        return sortDir;
    }
    return null;
};

class SelectableTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { options, columns } = this.props;
        let tableClass = options.hasOwnProperty("className")
            ? options.className
            : "";
        tableClass += options.actions?.edit ? " table-hover" : "";

        return (
            <div>
                <table
                    className={
                        "table table-striped selectableTable " + tableClass
                    }
                >
                    <thead>
                        <tr>
                            <th>
                                {!options.disableSelectAll && (
                                    <input
                                        type="checkbox"
                                        id="select_all"
                                        name="select_all"
                                        onChange={
                                            options.actions?.edit?.onSelectedAll
                                        }
                                        checked={options.selectedAll}
                                    />
                                )}
                            </th>
                            {columns.map((col, i) => {
                                let sortCol =
                                    typeof options.sortCol != "undefined"
                                        ? options.sortCol
                                        : defaults.sortCol;
                                let sortDir =
                                    typeof options.sortDir != "undefined"
                                        ? options.sortDir
                                        : defaults.sortDir;
                                let sortFunc =
                                    typeof options.sortFunc != "undefined"
                                        ? options.sortFunc
                                        : defaults.sortFunc;
                                let sortable =
                                    typeof col.sortable != "undefined"
                                        ? col.sortable
                                        : defaults.sortable;
                                let colWidth =
                                    typeof col.width != "undefined"
                                        ? col.width
                                        : defaults.colWidth;

                                return (
                                    <SelectableTableHeading
                                        onSort={this.props.onSort}
                                        sortDir={getSortDir(
                                            col.columnKey,
                                            i,
                                            sortCol,
                                            sortDir
                                        )}
                                        sortable={sortable}
                                        sortFunc={sortFunc}
                                        columnIndex={i}
                                        columnKey={col.columnKey}
                                        width={colWidth}
                                        key={"heading_" + i}
                                    >
                                        {col.value}
                                    </SelectableTableHeading>
                                );
                            })}
                            {options.actions && (
                                <SelectableTableHeading key="actions_heading">
                                    {options.actionsHeader || " "}
                                </SelectableTableHeading>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {columns.length > 0 &&
                            this.props.data.map((row, i) => {
                                if (
                                    Array.isArray(row) &&
                                    row.length !== columns.length
                                ) {
                                    console.warn(
                                        `Data at row ${i} is ${row.length}. It should be ${columns.length}.`
                                    );
                                    return <tr key={"row_" + i} />;
                                }

                                return (
                                    <SelectableTableRow
                                        checked={row.checked}
                                        even={i % 2 === 0}
                                        key={"row_" + row["id"]}
                                        id={row["id"]}
                                        actions={options.actions}
                                    >
                                        {createRow(
                                            row,
                                            columns,
                                            options.actions
                                        )}
                                    </SelectableTableRow>
                                );
                            })}
                    </tbody>
                </table>
                <Tooltip delayShow={10} />
            </div>
        );
    }
}

SelectableTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        columnKey: PropTypes.string.isRequired,
        value: PropTypes.node,
        sortable: PropTypes.bool,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /** (row, cellValue) => node. Overrides default cell rendering. */
        render: PropTypes.func
    })).isRequired,
    /** Each row's own `checked` flag drives its checkbox; selection state lives with the caller. `:152` explicitly handles array rows too. */
    data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.array])).isRequired,
    options: PropTypes.shape({
        className: PropTypes.string,
        /** Hides the header select-all checkbox. */
        disableSelectAll: PropTypes.bool,
        /** Controlled checked state of the select-all checkbox. */
        selectedAll: PropTypes.bool,
        sortCol: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sortDir: PropTypes.number,
        sortFunc: PropTypes.func,
        actionsHeader: PropTypes.node,
        actions: PropTypes.shape({
            edit: PropTypes.shape({
                /** Row click. Checkbox clicks are excluded. Called unconditionally by SelectableTableRow; effectively required if edit is present. */
                onClick: PropTypes.func,
                /** (id, checked) for a single row. Called unconditionally by SelectableTableRow's checkbox; effectively required if edit is present. */
                onSelected: PropTypes.func,
                /** Change handler for the header select-all checkbox. */
                onSelectedAll: PropTypes.func,
                display: PropTypes.func
            }),
            delete: PropTypes.shape({
                onClick: PropTypes.func.isRequired,
                display: PropTypes.func
            }),
            custom: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string.isRequired,
                icon: PropTypes.node,
                tooltip: PropTypes.string,
                onClick: PropTypes.func.isRequired,
                display: PropTypes.func
            }))
        })
    }).isRequired
};

export default SelectableTable;
