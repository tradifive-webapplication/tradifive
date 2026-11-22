import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bold, Italic, List, Image as ImageIcon, Eye, Edit3 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("rich-text-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newVal = value.substring(0, start) + before + selected + after + value.substring(end);
    
    onChange(newVal);
    
    // Focus back on textarea after state updates
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL (e.g. from TradingView or Imgur):");
    if (url) {
      insertText(`![Trade Setup](${url})`);
    }
  };

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#15171C] border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10">
      
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-200/70 dark:border-white/[0.06]">
        <div className="flex items-center gap-1">
          <button 
            type="button"
            title="Bold"
            onClick={() => insertText("**", "**")}
            disabled={isPreview}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <Bold size={14} strokeWidth={2.5} />
          </button>
          <button 
            type="button"
            title="Italic"
            onClick={() => insertText("_", "_")}
            disabled={isPreview}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <Italic size={14} strokeWidth={2.5} />
          </button>
          <button 
            type="button"
            title="Bullet List"
            onClick={() => insertText("- ")}
            disabled={isPreview}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <List size={14} strokeWidth={2.5} />
          </button>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1.5" />
          <button 
            type="button"
            title="Insert Image URL"
            onClick={addImage}
            disabled={isPreview}
            className="px-2.5 py-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <ImageIcon size={13} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Image</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-1 bg-white dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              !isPreview 
                ? "bg-slate-100 dark:bg-white/15 text-slate-900 dark:text-white shadow-2xs" 
                : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Edit3 size={11} strokeWidth={2.5} /> Edit
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              isPreview 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs" 
                : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Eye size={11} strokeWidth={2.5} /> Preview
          </button>
        </div>
      </div>

      {/* Editor Area */}
      {isPreview ? (
        <div className="p-4 min-h-[140px] text-[13px] text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert prose-emerald max-w-none overflow-y-auto amazing-scrollbar bg-white dark:bg-transparent">
          {value ? (
            <ReactMarkdown
              components={{
                img: ({node, ...props}) => (
                  <img {...props} className="max-w-full rounded-xl border border-slate-200 dark:border-white/10 shadow-sm my-2" />
                )
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-slate-400 dark:text-zinc-500 italic text-[12px]">No notes written yet. Click 'Edit' to document your trade thoughts.</p>
          )}
        </div>
      ) : (
        <textarea
          id="rich-text-editor"
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={5}
          placeholder={placeholder || "Describe your psychological state, rationale, and any observations... Use Markdown!"}
          className="w-full px-4 py-3.5 bg-transparent border-none text-[13px] font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-0 resize-none leading-relaxed amazing-scrollbar"
        />
      )}
    </div>
  );
}
