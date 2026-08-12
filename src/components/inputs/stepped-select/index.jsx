import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.less';

const SteppedSelect = ({value, options, onChange, ...rest}) => {
  
  const currentOptionKey = options.findIndex(op => op.value === value);

  const valueLabel = options.find(op => op.value === value).label;

  const onClickMinus = () => {
    if (currentOptionKey > 0) {
        onChange(options[currentOptionKey - 1].value);
    }
  }

  const onClickPlus = () => {
      if (currentOptionKey < options.length -1) {
        onChange(options[currentOptionKey + 1].value);
    }
  }

  return (
    <div className={styles.wrapper} {...rest}>
      <button className="btn btn-default" onClick={() => onClickMinus()} disabled={currentOptionKey === 0} title="Decrement">
        <i className="fa fa-minus"/>
      </button>
      <span className={styles.valueBox}>{valueLabel}</span>
      <button className="btn btn-default" onClick={() => onClickPlus()} disabled={currentOptionKey + 1 === options.length} title="Increment">
        <i className="fa fa-plus"/>
      </button>
    </div>
  );
};

SteppedSelect.propTypes = {
  /** Must match one option's value — an unmatched value throws while reading its label. */
  value: PropTypes.any.isRequired,
  /** Order defines the step sequence; the +/- buttons move one position at a time. */
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.node.isRequired
  })).isRequired,
  /** Receives the neighbouring option's value. Not called at either end of the list. */
  onChange: PropTypes.func.isRequired
};

export default SteppedSelect;
