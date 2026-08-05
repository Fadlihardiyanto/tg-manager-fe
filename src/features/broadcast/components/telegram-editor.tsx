'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import HardBreak from '@tiptap/extension-hard-break';
import History from '@tiptap/extension-history';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapCharacterCount from '@tiptap/extension-character-count';
import {
  useFieldContext,
  FormFieldSet,
  FormField,
  FormFieldError,
  createFormField
} from '@/components/ui/form-context';
import { FieldLabel } from '@/components/ui/field';
import { useStore } from '@tanstack/react-form';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TelegramEditorProps {
  label: string;
  placeholder?: string;
  maxChars: number;
  hideError?: boolean;
  commandTrigger?: string;
}

interface TelegramEditorHandle {
  getText: () => string;
  getHTML: () => string;
  getCharCount: () => number;
}

const TelegramEditor = forwardRef<TelegramEditorHandle, TelegramEditorProps>(
  function TelegramEditor(
    { label, placeholder = 'Tulis siaran...', maxChars, hideError, commandTrigger },
    ref
  ) {
    const field = useFieldContext();
    const value = useStore(field.store, (s) => s.value) as string;
    const [showPreview, setShowPreview] = useState(false);
    const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const editor = useEditor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Underline,
        Strike,
        Code,
        HardBreak,
        History,
        LinkExtension.configure({ openOnClick: false }),
        Placeholder.configure({ placeholder }),
        TiptapCharacterCount.configure({ limit: maxChars })
      ],
      content: value || '',
      onUpdate: ({ editor }) => {
        field.handleChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class:
            'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2 rounded-b-lg border border-t-0 border-input bg-background text-sm [&_a]:underline [&_a]:text-primary'
        }
      }
    });

    const charCount = editor?.storage.characterCount?.characters() ?? 0;
    const remaining = maxChars - charCount;

    useEffect(() => {
      if (!editor) return;
      const current = editor.getHTML();
      const next = value || '';
      if (current !== next) {
        editor.commands.setContent(next, { emitUpdate: false });
      }
    }, [editor, value]);

    useImperativeHandle(
      ref,
      () => ({
        getText: () => editor?.getText() ?? '',
        getHTML: () => editor?.getHTML() ?? '',
        getCharCount: () => editor?.storage.characterCount?.characters() ?? 0
      }),
      [editor]
    );

    const setLink = useCallback(() => {
      const trimmed = linkUrl.trim();
      if (!trimmed) {
        editor?.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
      editor?.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
      setLinkUrl('');
      setLinkPopoverOpen(false);
    }, [editor, linkUrl]);

    const openLinkPopover = () => {
      const prevUrl = editor?.getAttributes('link').href;
      setLinkUrl(prevUrl || '');
      setLinkPopoverOpen(true);
    };

    const ToolbarButton = ({
      isActive,
      onClick,
      icon,
      title
    }: {
      isActive: boolean;
      onClick: () => void;
      icon: React.ReactNode;
      title: string;
    }) => (
      <button
        type='button'
        aria-label={title}
        title={title}
        onClick={onClick}
        className={cn(
          'inline-flex size-8 items-center justify-center rounded text-sm transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        {icon}
      </button>
    );

    if (!editor) return null;

    return (
      <FormFieldSet>
        <FormField>
          <FieldLabel htmlFor={field.name}>{label} *</FieldLabel>

          {!showPreview && (
            <div className='rounded-lg border border-input overflow-hidden'>
              <div className='flex items-center gap-0.5 bg-muted/30 border-b border-input px-2 py-1.5'>
                <ToolbarButton
                  isActive={editor.isActive('bold')}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  icon={<Icons.bold className='size-3.5' />}
                  title='Tebal'
                />
                <ToolbarButton
                  isActive={editor.isActive('italic')}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  icon={<Icons.italic className='size-3.5' />}
                  title='Miring'
                />
                <ToolbarButton
                  isActive={editor.isActive('underline')}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  icon={<Icons.underline className='size-3.5' />}
                  title='Garis Bawah'
                />
                <ToolbarButton
                  isActive={editor.isActive('strike')}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  icon={<Icons.slash className='size-3.5' />}
                  title='Coret'
                />
                <span className='mx-1 h-4 w-px bg-border' aria-hidden />
                <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type='button'
                      aria-label='Tautan'
                      title='Tautan'
                      onClick={openLinkPopover}
                      className={cn(
                        'inline-flex size-8 items-center justify-center rounded text-sm transition-colors',
                        editor.isActive('link')
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icons.link className='size-3.5' />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className='w-72 space-y-3' align='start'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Masukkan URL</p>
                      <Input
                        type='url'
                        placeholder='https://example.com'
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            setLink();
                          }
                        }}
                      />
                    </div>
                    <div className='flex justify-end gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setLinkPopoverOpen(false);
                          setLinkUrl('');
                        }}
                      >
                        Batal
                      </Button>
                      <Button type='button' size='sm' disabled={!linkUrl.trim()} onClick={setLink}>
                        Sisipkan
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <ToolbarButton
                  isActive={editor.isActive('code')}
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  icon={<Icons.code className='size-3.5' />}
                  title='Kode'
                />
                <span className='flex-1' />
                <button
                  type='button'
                  aria-label='Pratinjau'
                  title='Pratinjau'
                  onClick={() => setShowPreview(true)}
                  className='inline-flex size-8 items-center justify-center rounded text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                >
                  <Icons.eye className='size-3.5' />
                </button>
              </div>
              <EditorContent editor={editor} />
            </div>
          )}

          {showPreview && (
            <div className='rounded-lg border border-input overflow-hidden'>
              <div className='flex items-center gap-0.5 bg-muted/30 border-b border-input px-2 py-1.5'>
                <span className='text-xs font-medium text-muted-foreground px-2'>
                  {commandTrigger ? 'Pratinjau Percakapan' : 'Pratinjau'}
                </span>
                <span className='flex-1' />
                <button
                  type='button'
                  aria-label='Tutup pratinjau'
                  title='Kembali edit'
                  onClick={() => setShowPreview(false)}
                  className='inline-flex size-8 items-center justify-center rounded text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                >
                  <Icons.edit className='size-3.5' />
                </button>
              </div>
              <div className='p-4 bg-muted/5 space-y-3 flex flex-col'>
                {commandTrigger ? (
                  <>
                    {/* User Command Trigger Bubble */}
                    <div className='flex justify-end'>
                      <div className='max-w-[70%] rounded-2xl rounded-tr-sm bg-[#2b9fd9] px-4 py-2 text-sm text-white shadow-sm font-mono'>
                        /{commandTrigger.trim().replace(/^\//, '') || 'perintah'}
                      </div>
                    </div>
                    {/* Bot Reply Bubble */}
                    <div className='flex justify-start'>
                      <div
                        className='max-w-[85%] rounded-2xl rounded-tl-sm border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm [&_a]:underline [&_a]:text-primary'
                        dangerouslySetInnerHTML={{
                          __html:
                            editor.getHTML() && editor.getHTML() !== '<p></p>'
                              ? editor
                                  .getHTML()
                                  .replace(/<p>/g, '')
                                  .replace(/<\/p>/g, '<br/>')
                                  .replace(/<br\/>$/, '')
                              : '<span class="text-muted-foreground/60 italic">Balasan kosong...</span>'
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className='bg-background p-2 rounded-lg'>
                    <TelegramBubble html={editor.getHTML()} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            className={cn(
              'text-right text-xs mt-1',
              remaining < 0
                ? 'text-destructive font-medium'
                : remaining < 50
                  ? 'text-yellow-600'
                  : 'text-muted-foreground'
            )}
          >
            {remaining} karakter tersisa
          </div>
        </FormField>
        {!hideError && (
          <div className='relative h-4'>
            <div className='absolute left-0 top-0'>
              <FormFieldError />
            </div>
          </div>
        )}
      </FormFieldSet>
    );
  }
);

function TelegramBubble({ html }: { html: string }) {
  return (
    <div className='flex justify-end'>
      <div
        className='max-w-[85%] rounded-2xl rounded-br-md bg-[#2b9fd9] px-4 py-2.5 text-sm text-white shadow-sm [&_a]:underline'
        dangerouslySetInnerHTML={{
          __html: html
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '<br/>')
            .replace(/<br\/>$/, '')
        }}
      />
    </div>
  );
}

export { TelegramEditor };
export type { TelegramEditorHandle };
export const FormTelegramEditor = createFormField(TelegramEditor);
