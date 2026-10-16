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
    <div className="w-full flex flex-col rounded-[14px] overflow-hidden bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/30">
      
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#1A1A1A] border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-1">
          <button 
            title="Bold"
            onClick={() => insertText("**", "**")}
            disabled={isPreview}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <Bold size={14} />
          </button>
          <button 
            title="Italic"
            onClick={() => insertText("_", "_")}
            disabled={isPreview}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <Italic size={14} />
          </button>
          <button 
            title="Bullet List"
            onClick={() => insertText("- ")}
            disabled={isPreview}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <List size={14} />
          </button>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/10 mx-1" />
          <button 
            title="Insert Image URL"
            onClick={addImage}
            disabled={isPreview}
            className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <ImageIcon size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Image</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#2C2C2E] p-0.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${!isPreview ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            <Edit3 size={12} /> Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${isPreview ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            <Eye size={12} /> Preview
          </button>
        </div>
      </div>

      {/* Editor Area */}
      {isPreview ? (
        <div className="p-4 min-h-[160px] text-[13px] text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert prose-emerald max-w-none overflow-y-auto amazing-scrollbar bg-white dark:bg-transparent">
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
            <p className="text-slate-400 italic">Nothing to preview...</p>
          )}
        </div>
      ) : (
        <textarea
          id="rich-text-editor"
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={6}
          placeholder={placeholder || "Describe your psychological state, rationale, and any observations... Use Markdown!"}
          className="w-full px-4 py-3.5 bg-transparent border-none text-[13px] font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-0 resize-none leading-relaxed amazing-scrollbar"
        />
      )}
    </div>
  );
}
