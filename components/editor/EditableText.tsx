'use client';

import React from 'react';
import { RichTextEditor } from './RichTextEditor';

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
  tagName = 'p',
}) => {
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      className={className}
      style={style}
      tagName={tagName}
    />
  );
};
