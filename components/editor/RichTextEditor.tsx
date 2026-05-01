'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Extension } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Highlight } from '@tiptap/extension-highlight';

// Custom Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className = '',
  style,
  tagName: Tag = 'p' as any,
}) => {
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Enter text...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[1em]',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(value, { emitUpdate: false });
      editor.commands.setTextSelection({ from, to });
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  // Prevent invalid DOM nesting by mapping inline or paragraph tags to a div wrapper.
  const CustomTag = (Tag === 'p' || Tag === 'span') ? 'div' as any : Tag as any;
  const sizes = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px'];

  const isInline = Tag === 'span' || Tag === 'a' || Tag === 'button';

  return (
    <div
      className={`relative group/editor ${isInline ? 'is-inline-editor' : 'is-block-editor'}`}
      style={{ zIndex: (editor?.isFocused || showSizeDropdown) ? 99999 : undefined }}
    >

      {editor && (
        <BubbleMenu editor={editor} updateDelay={0}>
          <div className="flex items-center gap-0.5 bg-[#1a1b26] border border-white/20 p-1 shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md font-sans text-xs font-normal normal-case tracking-normal leading-normal text-left" style={{ zIndex: 999999 }}>
            {/* Size Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-white/70 hover:bg-white/10 rounded transition-colors font-bold min-w-[50px]"
              >
                {editor.getAttributes('textStyle').fontSize || 'Size'}
                <i className="fa-solid fa-chevron-down text-[10px]"></i>
              </button>
              {showSizeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-[#1a1b26] border border-white/20 rounded shadow-xl overflow-hidden z-[1001] min-w-[70px]">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        (editor.commands as any).setFontSize(size);
                        setShowSizeDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-white/70 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      (editor.commands as any).unsetFontSize();
                      setShowSizeDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-600 hover:text-white transition-colors border-t border-white/5"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-3 bg-white/10 mx-1" />

            {/* Bold */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'text-blue-400 bg-white/10' : 'text-white/70'}`}
            >
              <i className="fa-solid fa-bold text-xs"></i>
            </button>

            {/* Italic */}
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'text-blue-400 bg-white/10' : 'text-white/70'}`}
            >
              <i className="fa-solid fa-italic text-xs"></i>
            </button>

            {/* Underline */}
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('underline') ? 'text-blue-400 bg-white/10' : 'text-white/70'}`}
            >
              <i className="fa-solid fa-underline text-xs"></i>
            </button>

            <div className="w-px h-3 bg-white/10 mx-1" />

            {/* Alignment */}
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'text-blue-400 bg-white/10' : 'text-white/70'}`}
            >
              <i className="fa-solid fa-align-left text-xs"></i>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'text-blue-400 bg-white/10' : 'text-white/70'}`}
            >
              <i className="fa-solid fa-align-center text-xs"></i>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'text-blue-400 bg-white/10' : 'text-white/70'}`}
            >
              <i className="fa-solid fa-align-right text-xs"></i>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'text-blue-400 bg-white/10' : 'text-white/70'}`}
            >
              <i className="fa-solid fa-align-justify text-xs"></i>
            </button>

            <div className="w-px h-3 bg-white/10 mx-1" />

            {/* Link */}
            <button
              onClick={() => {
                const url = window.prompt('URL');
                if (url) editor.chain().focus().setLink({ href: url }).run();
                else if (url === '') editor.chain().focus().unsetLink().run();
              }}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('link') ? 'text-blue-400 bg-white/10' : 'text-white/70'}`}
            >
              <i className="fa-solid fa-link text-xs"></i>
            </button>

            {/* Color */}
            <div className="relative flex items-center px-1">
              <input
                type="color"
                onInput={e => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                value={editor.getAttributes('textStyle').color || '#ffffff'}
                className="w-4 h-4 p-0 bg-transparent border border-white/20 cursor-pointer rounded-sm overflow-hidden"
              />
            </div>

            <div className="w-px h-3 bg-white/10 mx-1" />

            {/* Clear Formatting */}
            <button
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            >
              <i className="fa-solid fa-eraser text-xs"></i>
            </button>
          </div>
        </BubbleMenu>
      )}
      <CustomTag
        className={className}
        style={Tag === 'span' ? { display: 'inline', ...style } : style}
      >
        <EditorContent editor={editor} />
      </CustomTag>
    </div>
  );
};
