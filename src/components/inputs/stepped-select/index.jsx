import React from 'react';
import styles from './index.module.less';

export default ({value, options, onChange, ...rest}) => {
  
  const currentOptionKey = options.findIndex(op => op.value === value);

  const handleChange = (decress) => {
    if (currentOptionKey >= 0) {
      if (decress) {
        if (currentOptionKey < options.length -1) {
          onChange(options[currentOptionKey + 1].value);
        }
      } else {
        if (currentOptionKey > 0) {
          onChange(options[currentOptionKey - 1].value);
        }
      }
    }
  };

  const valueLabel = options.find(op => op.value === value).label;

  return (
    <div className={styles.wrapper} {...rest}>
      <button className="btn btn-default" onClick={() => handleChange(true)} disabled={currentOptionKey + 1 === options.length}>
        <i className="fa fa-minus"/>
      </button>
      <span className={styles.valueBox}>{valueLabel}</span>
      <button className="btn btn-default" onClick={() => handleChange(false)} disabled={currentOptionKey === 0}>
        <i className="fa fa-plus"/>
      </button>
    </div>
  );
};
