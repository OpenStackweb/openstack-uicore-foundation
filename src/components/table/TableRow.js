import React from 'react';

export default class TableRow extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
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
        ev.stopPropagation();
        ev.preventDefault();

        this.props.actions.edit.onClick(id);
    }

    render() {
        let {even, actions, id, children} = this.props;
        let canEdit = (actions?.edit && this.shouldDisplayAction(actions.edit));
        let rowClass = even ? 'even' : 'odd';

        if (canEdit) {
            return (
                <tr role="row" className={rowClass + " can-edit"} onClick={this.handleEdit.bind(this, id)}>
                    {children}
                </tr>
            );
        } else {
            return (
                <tr role="row" className={rowClass}>
                    {children}
                </tr>
            );
        }
    }
};

