import React from 'react';

export default class SelectableTableRow extends React.Component {

    constructor(props) {
        super(props);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    shouldDisplayAction(action) {
        let {id} = this.props;
        if (!action.hasOwnProperty('display')) {
            return true;
        } else {
            return action.display(id);
        }
    }

    handleEdit(id, ev) {
        // by pass
        if(ev.target.type === "checkbox")
            return;
        ev.stopPropagation();
        ev.preventDefault();
        this.props.actions.edit.onClick(id);
    }

    handleSelect(id, ev) {
        this.props.actions.edit.onSelected(id, ev.target.checked);
    }

    render() {

        let {even, actions, id, children, checked} = this.props;
        let canEdit = (actions?.edit && this.shouldDisplayAction(actions.edit));
        let rowClass = even ? 'even' : 'odd';

        if (canEdit) {
            return (
                <tr role="row" className={rowClass + " can-edit"} onClick={this.handleEdit.bind(this, id)}>
                    <td key={id + '_select'}>
                        <input
                            type="checkbox"
                            id={id + '_select'}
                            name={id + '_select'}
                            checked={checked}
                            onChange={this.handleSelect.bind(this, id)}
                        />
                    </td>
                    {children}
                </tr>
            );
        }

        return (
                <tr role="row" className={rowClass}>
                    <td key={id + '_select'} >
                        <input
                            type="checkbox"
                            id={id + '_select'}
                            name={id + '_select'}
                            checked={checked}
                            onChange={this.handleSelect.bind(this, id)}
                        />
                    </td>
                    {children}
                </tr>
        );

    }
};

