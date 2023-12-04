import React from 'react';
import TableHeading from './TableHeading';
import TableCell from './TableCell';
import TableRow from './TableRow';
import ActionsTableCell from './ActionsTableCell';
import ReactTooltip from 'react-tooltip'

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
            <ReactTooltip delayShow={10} />
        </div>
    );
};

export default Table;
