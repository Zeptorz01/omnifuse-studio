import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NoteComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (title: string, content: string) => void;
}

export const NoteComposerModal: React.FC<NoteComposerModalProps> = ({
  isOpen,
  onClose,
  onAddNote,
}) => {
  const [title, setTitle] = useState('Cover_Memo_Notes.md');
  const [content, setContent] = useState(
    '# Cover Memorandum\nPrepared for: Project Review Board\n\n## Summary of Enclosed Files\n- Signed service agreement\n- Architectural site blueprint\n- Paid equipment invoice'
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a page filename or title.');
      return;
    }
    if (!content.trim()) {
      setError('Page content cannot be empty.');
      return;
    }
    setError('');
    onAddNote(title.trim(), content);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 id="note-modal-title" className="text-base font-bold text-slate-900">
            Insert Formatted Text / Markdown Page
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close text page composer"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="custom-note-title"
              className="block text-xs font-semibold text-slate-900 mb-1"
            >
              Page Filename
            </label>
            <input
              id="custom-note-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Executive_Summary.md"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="custom-note-body"
              className="block text-xs font-semibold text-slate-900 mb-1"
            >
              Document Body (Supports Markdown Headings & Lists)
            </label>
            <textarea
              id="custom-note-body"
              rows={7}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Append Page to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
