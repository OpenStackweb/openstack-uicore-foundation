import React, {useEffect, useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import SortableTableHeading from './SortableTableHeading';
import SortableActionsTableCell from './SortableActionsTableCell';
import SortableTableRow from './SortableTableRow';
import T from 'i18n-react/dist/i18n-react';
import './table-sortable.css';
import TableCell from "../table/TableCell";
import _ from 'lodash';

const defaults = {
    colWidth: ''
}

const createRow = (row, columns, actions) => {

    let cells = columns.map((col, i) => {
        if (col.hasOwnProperty("render"))
            return (
                <TableCell key={'cell_' + i} title={col.hasOwnProperty("title") ? row[col.columnKey] : null}>
                    {col.render(row, row[col.columnKey])}
                </TableCell>
            );

        return (
            <TableCell key={'cell_' + i} title={col.hasOwnProperty("title") ? row[col.columnKey] : null}>
                {row[col.columnKey]}
            </TableCell>
        );
    });

    if (actions) {
        cells.push(<SortableActionsTableCell key='actions' id={row['id']} actions={actions}/>);
    }

    return cells;
};


const renderNewRow = (columns, new_row, addNew, handleChange) => {

    let cells = columns.map((col, i) => {
        let cell_value = (typeof new_row[col.columnKey] !== 'undefined') ? new_row[col.columnKey] : '';

        if (col?.input === "checkbox")
            return (
                <td key={'new_row_' + i} className="checkbox-cell">
                    <input type="checkbox"
                           id={'new_' + col.columnKey}
                           name={col.columnKey}
                           onChange={handleChange}
                           checked={cell_value}
                           title={col?.value}
                    />
                </td>);
        else
            return (
                <td key={'new_row_' + i}>
                    <input
                        className="form-control"
                        id={'new_' + col.columnKey}
                        name={col.columnKey}
                        placeholder={col?.value}
                        onChange={handleChange}
                        value={cell_value}/>
                </td>);

    });

    cells.push(
        <td key='add_new'>
            <button className="btn btn-default" onClick={addNew}> Add</button>
        </td>
    );

    return cells;
};

const SortableTable = ({data, options, columns, dropCallback, orderField, idField}) => {

    const [rows, setRows] = useState(data);
    const [newRow, setNewRow] = useState({});

    useEffect(() => {
        setRows(data);
    }, [data])


    const renderRow = (row, columns, options, index) => {
        return (
            <SortableTableRow even={index % 2 === 0} key={row.id} index={index} id={row.id}
                              moveCard={moveRow}
                              findRow={findRow}
                              dropItem={onDropItem}>
                {createRow(row, columns, options.actions)}
            </SortableTableRow>
        )
    };

    const saveNewRow = (ev) => {
        ev.preventDefault();
        options?.actions?.save?.onClick(newRow);
        setNewRow({});
    }

    const sortRows = (rows2Sort) => {
        rows2Sort.sort(function (a, b) {
            const x = a[orderField];
            const y = b[orderField];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        return rows2Sort;
    }

    const findRow = useCallback(
        (id) => {
            const row = rows.filter((r) => r[idField] === id)[0]
            return {
                row,
                index: rows.indexOf(row),
            }
        },
        [rows],
    )

    const moveRow = useCallback(
        (dragIndex, hoverIndex) => {

            setRows((prevRows) => {

                prevRows = update(prevRows, {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, prevRows[dragIndex]],
                    ],
                });

                for (let i in prevRows) {
                    prevRows[i][orderField] = parseInt(i) + 1;
                }

                return sortRows(prevRows)
            });
        },
        [rows, setRows],
    )

    const onDropItem = (id, newOrder) => {
        const sortedRows = sortRows(rows);
        setRows(sortedRows);
        dropCallback(sortedRows, id, newOrder)
    }

    const handleNewChange = (ev) => {
        let field = ev.target;
        let newRowTmp = {...newRow};
        let {name, value} = field;

        if (field.type === 'checkbox') {
            value = field.checked;
        }
        newRowTmp[name] = value;
        setNewRow(newRowTmp);
    }

    let tableClass = options.hasOwnProperty('className') ? options.className : '';
    let shouldRenderNewRow = options?.actions?.save?.onClick && options?.actions?.save?.onClick !== null;

    return (
        <div className="sortable-table-box">
            <i>{T.translate("general.drag_and_drop")}</i>
            <table className={"table table-striped table-hover sortableTable " + tableClass}>
                <thead>
                <tr>
                    {columns.map((col, i) => {
                        let colWidth = (col.width) ? col.width : defaults.colWidth;
                        return (
                            <SortableTableHeading width={colWidth} key={i}>
                                {col.value}
                            </SortableTableHeading>
                        );
                    })}
                    {options.actions && !_.isEmpty(options.actions) &&
                        <SortableTableHeading key='actions'>
                            Actions
                        </SortableTableHeading>
                    }
                </tr>
                </thead>
                <tbody>
                {columns.length > 0 && rows.map((row, i) => {
                    if (Array.isArray(row) && row.length !== columns.length) {
                        console.warn(`Data at row ${i} is ${row.length}. It should be ${columns.length}.`);
                        return <tr/>
                    }
                    return (
                        <DndProvider backend={HTML5Backend} key={i}>
                            {renderRow(row, columns, options, i)}
                        </DndProvider>
                    );
                })}
                </tbody>
                {shouldRenderNewRow &&
                    <tfoot>
                    <tr>
                        {renderNewRow(columns, newRow, saveNewRow, handleNewChange)}
                    </tr>
                    </tfoot>
                }
            </table>
        </div>
    );
};

SortableTable.defaultProps = {
    idField: 'id',
}

SortableTable.propTypes = {
    data: PropTypes.array.isRequired,
    options: PropTypes.shape({
        className: PropTypes.string,
        actions: PropTypes.object
    }).isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
        columnKey: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
        input: PropTypes.string,
        render: PropTypes.func,
    })).isRequired,
    dropCallback: PropTypes.func.isRequired,
    orderField: PropTypes.string.isRequired,
    idField: PropTypes.string,
}

export default SortableTable;
