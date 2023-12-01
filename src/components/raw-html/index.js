import React from 'react';

const RawHTML = ({children, replaceNewLine = false, className = "", ...rest}) =>
    <span className={className}
          dangerouslySetInnerHTML={{ __html: replaceNewLine ? children?.replace(/\n/g, '<br />') : children}} {...rest}/>

export default RawHTML;