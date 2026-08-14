import React from 'react';
import PropTypes from 'prop-types';

const RawHTML = ({children, replaceNewLine = false, className = "", ...rest}) =>
    <span className={className}
          dangerouslySetInnerHTML={{ __html: replaceNewLine ? children?.replace(/\n/g, '<br />') : children}} {...rest}/>

RawHTML.propTypes = {
    /** HTML string, injected unescaped via dangerouslySetInnerHTML. Never pass untrusted input. */
    children: PropTypes.string,
    /** Converts newlines to <br /> before injecting. */
    replaceNewLine: PropTypes.bool,
    className: PropTypes.string
};

export default RawHTML;