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
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerText)}
      className={`focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1 transition-all ${className}`}
      style={style}
    >
      {value}
    </Tag>
  );
};
