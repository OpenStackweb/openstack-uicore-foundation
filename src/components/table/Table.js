import React from 'react';
import PropTypes from 'prop-types';
import TableHeading from './TableHeading';
import TableCell from './TableCell';
import TableRow from './TableRow';
import ActionsTableCell from './ActionsTableCell';
import { Tooltip } from 'react-tooltip';

import './table.less';

const defaults = {
    sortFunc: (a,b) => (a < b ? -1 : (a > b ? 1 : 0)),
    sortable: false,
    sortCol: 0,
    sortDir: 1,
    colWidth: ''
}

const createRow = (row, columns, actions) => {
    const cells = columns.map((col,i) => {
        const colStyles = col?.styles || {};

        if(col.hasOwnProperty("render"))
            return (
                <TableCell key={'cell_'+i} style={colStyles} >
                    {col.render(row, row[col.columnKey])}
                </TableCell>
            );

        return (
            <TableCell
                key={'cell_'+i}
                title={col.hasOwnProperty("title") ? row[col.columnKey] : null}
                style={colStyles}
            >
                {row[col.columnKey]}
            </TableCell>
        );
    });

    if (actions) {
        cells.push(<ActionsTableCell key='actions_cell' id={row['id']} actions={actions} />);
    }

    return cells;
};

const getSortDir = (columnKey, columnIndex, sortCol, sortDir) => {
    if(columnKey && (columnKey === sortCol)) {
        return sortDir;
    }
    if(sortCol === columnIndex) {
        return sortDir;
    }
    return null
};

const Table = (props) => {
    let {options, columns} = props;
    let tableClass = options.hasOwnProperty('className') ? options.className : '';
    tableClass += options.actions?.edit ? ' table-hover' : '';

    return (
        <div>
            <table className={"table table-striped dataTable " + tableClass}>
                <thead>
                    <tr>
                    {columns.map((col,i) => {

                        let sortCol = (typeof options.sortCol != 'undefined') ? options.sortCol : defaults.sortCol;
                        let sortDir = (typeof options.sortDir != 'undefined') ? options.sortDir : defaults.sortDir;
                        let sortFunc = (typeof options.sortFunc != 'undefined') ? options.sortFunc : defaults.sortFunc;
                        let sortable = (typeof col.sortable != 'undefined') ? col.sortable : defaults.sortable;
                        let colWidth = (typeof col.width != 'undefined') ? col.width : defaults.colWidth;

                        return (
                            <TableHeading
                                onSort={props.onSort}
                                sortDir={getSortDir(col.columnKey, i, sortCol, sortDir)}
                                sortable={sortable}
                                sortFunc={sortFunc}
                                columnIndex={i}
                                columnKey={col.columnKey}
                                width={colWidth}
                                key={'heading_'+i}
                            >
                                {col.value}
                            </TableHeading>
                        );
                    })}
                    {options.actions &&
                        <TableHeading key='actions_heading' >
                            {options.actionsHeader || ' '}
                        </TableHeading>
                    }
                    </tr>
                </thead>
                <tbody>
                    {columns.length > 0 && props.data.map((row,i) => {
                        if(Array.isArray(row) && row.length !== columns.length) {
                            console.warn(`Data at row ${i} is ${row.length}. It should be ${columns.length}.`);
                            return <tr key={'row_'+i} />
                        }

                        return (
                            <TableRow even={i%2 === 0} key={'row_'+i} id={row['id']} actions={options.actions}>
                                {createRow(row, columns, options.actions)}
                            </TableRow>
                        );
                    })}
                </tbody>
            </table>
            <Tooltip delayShow={10} />
        </div>
    );
};

const actionShape = PropTypes.shape({
    onClick: PropTypes.func.isRequired,
    /** (id) => bool — return false to hide this action for a given row. */
    display: PropTypes.func
});

Table.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        /** Key used to read the cell out of each row: row[columnKey]. */
        columnKey: PropTypes.string.isRequired,
        /** Heading content. */
        value: PropTypes.node,
        sortable: PropTypes.bool,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /** Presence adds a title attribute to the cell, set to the raw value. */
        title: PropTypes.any,
        /** (row, cellValue) => node. Overrides default cell rendering. */
        render: PropTypes.func,
        styles: PropTypes.object
    })).isRequired,
    /** Row objects keyed by columnKey. Each needs an `id` when actions are used. */
    data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.array])).isRequired,
    /** Called by sortable headings. */
    onSort: PropTypes.func,
    options: PropTypes.shape({
        className: PropTypes.string,
        /** Matched against either a column's columnKey or its numeric index. */
        sortCol: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sortDir: PropTypes.number,
        sortFunc: PropTypes.func,
        /** Heading for the actions column. */
        actionsHeader: PropTypes.node,
        actions: PropTypes.shape({
            /** Makes whole rows clickable and adds the table-hover class. */
            edit: actionShape,
            delete: actionShape,
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

export default Table;
