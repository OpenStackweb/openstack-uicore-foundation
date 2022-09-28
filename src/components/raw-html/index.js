import React from 'react';

const RawHTML = ({children, replaceNewLine = false, className = ""}) =>
    <span className={className}
          dangerouslySetInnerHTML={{ __html: replaceNewLine ? children?.replace(/\n/g, '<br />') : children}} />

export default RawHTML;