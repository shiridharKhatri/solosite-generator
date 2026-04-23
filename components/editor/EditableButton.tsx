'use client';

import React from 'react';

interface EditableButtonProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  onClick?: () => void;
}

export const EditableButton: React.FC<EditableButtonProps> = ({
  value,
  onChange,
  className = '',
  onClick,
}) => {
  return (
    <div className="relative group inline-block">
      <button
        className={`px-6 py-2 rounded-full font-semibold transition-all ${className}`}
        onClick={onClick}
      >
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.innerText)}
          onClick={(e) => e.stopPropagation()}
          className="focus:outline-none"
        >
          {value}
        </span>
      </button>
    </div>
  );
};
