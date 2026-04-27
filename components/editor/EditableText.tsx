'use client';

import React from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  style,
  tagName: Tag = 'p',
}) => {
  const elementRef = React.useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // Update the element's text if the prop changes externally (and we're not focused)
  React.useEffect(() => {
    if (elementRef.current && !isFocused && elementRef.current.innerText !== value) {
      elementRef.current.innerText = value;
    }
  }, [value, isFocused]);

  return (
    <Tag
      ref={elementRef as any}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        setIsFocused(false);
        onChange(e.currentTarget.innerText);
      }}
      onInput={(e) => {
        // We still call onChange for auto-save, but we don't let React 
        // re-render the children of this Tag while we're typing.
        onChange(e.currentTarget.innerText);
      }}
      className={`focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1 transition-all ${className}`}
      style={style}
    >
      {/* We set initial value here, but useEffect handles updates */}
      {React.useMemo(() => value, [])} 
    </Tag>
  );
};
