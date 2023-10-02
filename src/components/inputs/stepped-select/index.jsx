import React from 'react';
import styles from './index.module.less';

export default ({value, options, onChange, ...rest}) => {
  
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
