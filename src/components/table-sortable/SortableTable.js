import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import SortableTableHeading from './SortableTableHeading';
import SortableTableCell from './SortableTableCell';
import SortableActionsTableCell from './SortableActionsTableCell';
import SortableTableRow from './SortableTableRow';
import T from 'i18n-react/dist/i18n-react';
import './table-sortable.css';
import { shallowEqual } from "../../utils/methods";

const defaults = {
    colWidth: ''
}

const createRow = (row, columns, actions) => {

    var action_buttons = '';
    var cells = columns.map((col, i) => {
        return (
        <SortableTableCell key={i}>
            {row[col.columnKey]}
        </SortableTableCell>
        );
    });

    if (actions) {
        cells.push(<SortableActionsTableCell key='actions' id={row['id']} actions={actions} />);
    }

    return cells;
};


const SortableTable = ({ data,
    options,
    columns,
    dropCallback,
    orderField }) => {

    const [rows, setRows] = useState(data)

    const renderRow = useCallback((row, columns, options, index) => {        
        return (
            <SortableTableRow even={index % 2 === 0} key={row.id} index={index} id={row.id} moveCard={moveRow} dropItem={onDropItem}>
                {createRow(row, columns, options.actions)}
            </SortableTableRow>
        )
    }, []);

    const moveRow = useCallback((dragIndex, hoverIndex, id) => {
        setRows((prevCards) => update(prevCards, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, prevCards[dragIndex]],
            ],
        }));
    }, []);
    
    const onDropItem = (id, newOrder) => {
        dropCallback(rows, id, newOrder)
    }

    let tableClass = options.hasOwnProperty('className') ? options.className : '';

    return (
        <div className="sortable-table-box">
            <i>{T.translate("general.drag_and_drop")}</i>
            <table className={"table table-striped table-hover sortableTable " + tableClass}>
                <thead>
                    <tr>
                        {columns.map((col, i) => {
                            let colWidth = (col.width) ? col.width : defaults.colWidth;
                            return (
                                <SortableTableHeading width={colWidth} key={i} >
                                    {col.value}
                                </SortableTableHeading>
                            );
                        })}
                        {options.actions &&
                        <SortableTableHeading key='actions' >
                            Actions
                        </SortableTableHeading>
                        }
                    </tr>
                </thead>
                <tbody>
                    {columns.length > 0 && rows.map((row, i) => {
                        if (Array.isArray(row) && row.length !== columns.length) {
                            console.warn(`Data at row ${i} is ${row.length}. It should be ${columns.length}.`);
                            return <tr />
                        }
                        return (
                            <DndProvider backend={HTML5Backend}>
                                {renderRow(row, columns, options, i)}
                            </DndProvider>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

SortableTable.propTypes = {
    data: PropTypes.array.isRequired,
    options: PropTypes.shape({
        className: PropTypes.string,
        actions: PropTypes.object
    }).isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
        columnKey: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired
    })).isRequired,
    orderField: PropTypes.string.isRequired,
    dropCallback: PropTypes.func.isRequired
}

export default SortableTable;
