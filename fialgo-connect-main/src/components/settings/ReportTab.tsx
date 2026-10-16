import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Send, AlertCircle, MessageSquare, CreditCard, Bug, UploadCloud, X, FileImage, FileVideo } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ReportTab() {
  const [reportCategory, setReportCategory] = useState('bug');
  const [reportSubject, setReportSubject] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportSubject || !reportDescription) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         toast.error("You must be logged in to submit tickets.");
         return;
      }
      
      const uploadedUrls: string[] = [];
      if (attachments.length > 0) {
         toast.loading(`Uploading ${attachments.length} attachments...`, { id: 'upload' });
         
         for (const file of attachments) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;
            
            // Try uploading to 'support-attachments'
            const { error: uploadError, data } = await supabase.storage.from('support-attachments').upload(filePath, file);
            if (!uploadError && data) {
               const { data: { publicUrl } } = supabase.storage.from('support-attachments').getPublicUrl(filePath);
               uploadedUrls.push(publicUrl);
            } else {
               // Fallback: Base64 for small images if bucket is missing
               if (file.size < 500000 && file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  const base64 = await new Promise<string>((resolve) => {
                     reader.onloadend = () => resolve(reader.result as string);
                     reader.readAsDataURL(file);
                  });
                  uploadedUrls.push(base64);
               } else if (uploadError) {
                  console.error("Upload error:", uploadError);
               }
            }
         }
         toast.dismiss('upload');
      }

      let finalDescription = reportDescription;
      if (uploadedUrls.length > 0) {
         finalDescription += '\n\n--- ATTACHMENTS ---\n';
         uploadedUrls.forEach(url => {
            if (url.startsWith('data:image') || url.match(/\.(jpeg|jpg|gif|png)$/i)) {
               finalDescription += `\n[IMAGE_ATTACHMENT:${url}]`;
            } else {
               finalDescription += `\n[VIDEO_ATTACHMENT:${url}]`;
            }
         });
      }

      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: reportSubject,
        description: finalDescription,
        status: 'open',
        priority: 'medium',
      });

      if (error) {
         toast.error("Failed to submit ticket. " + error.message);
         return;
      }

      toast.success('Your report has been submitted to the admin team!');
      setReportSubject('');
      setReportDescription('');
      setReportCategory('bug');
      setAttachments([]);
      
    } catch (err: any) {
      toast.dismiss('upload');
      toast.error('An unexpected error occurred.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Max 3 files constraint
      if (attachments.length + newFiles.length > 3) {
        toast.error('You can only upload up to 3 attachments');
        return;
      }
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const categories = [
    { id: 'bug', label: 'Technical Bug', icon: Bug, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20 dark:border-rose-500/30' },
    { id: 'billing', label: 'Billing Issue', icon: CreditCard, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30' },
    { id: 'features', label: 'Feature Request', icon: AlertCircle, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20 dark:border-indigo-500/30' },
    { id: 'feedback', label: 'General Feedback', icon: MessageSquare, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30' },
  ];

  return (
    <div className="w-full space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Report a Problem
        </h2>
        <p className="text-[14px] font-medium text-slate-500 dark:text-[#80848E] max-w-2xl">
          Submit bug tickets, billing issues, or feedback directly to our developer team. We review every submission to improve your experience.
        </p>
      </div>

      {/* Main Form Container - Premium Glassmorphism */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-2 border-white dark:border-[#222B3F] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),_0_0_0_2px_#E7E7E7] dark:shadow-none rounded-[24px] p-5 sm:p-6 relative overflow-hidden group">
        
        {/* Abstract background gradient decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-500/10 to-orange-500/10 dark:from-rose-500/5 dark:to-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

        <form onSubmit={handleReportSubmit} className="relative z-10 space-y-6">
          
          {/* Category Selection Grid */}
          <div className="space-y-2">
            <label className="text-[13px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = reportCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setReportCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 gap-2 relative overflow-hidden ${
                      isSelected 
                        ? `${cat.bg} scale-[1.02] shadow-md` 
                        : 'bg-white/50 dark:bg-[#1A1E29]/50 border-transparent hover:bg-white dark:hover:bg-[#1A1E29] hover:scale-[1.02] text-slate-500 dark:text-slate-400 hover:shadow-sm'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors duration-300 ${isSelected ? 'bg-white dark:bg-white/10 shadow-sm' : 'bg-slate-100 dark:bg-[#222B3F] group-hover:bg-slate-200 dark:group-hover:bg-[#2A344C]'}`}>
                      <Icon size={20} className={isSelected ? cat.color : ''} />
                    </div>
                    <span className={`text-[12px] font-bold ${isSelected ? 'text-slate-900 dark:text-white' : ''}`}>
                      {cat.label}
                    </span>
                    {isSelected && (
                       <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current opacity-50 shadow-[0_0_10px_currentColor] animate-pulse" style={{ color: 'inherit' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent opacity-50" />

          {/* Form Fields */}
          <div className="space-y-5">
            <div className="space-y-1.5 group/field">
              <label className="text-[12px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex justify-between items-end">
                <span>Subject Summary</span>
              </label>
              <input 
                type="text" 
                placeholder="Brief title of the problem"
                value={reportSubject} 
                onChange={e => setReportSubject(e.target.value)} 
                className="w-full bg-white/80 dark:bg-[#131620]/80 backdrop-blur-sm border-2 border-slate-200 dark:border-[#222B3F] rounded-xl px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-white outline-none hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-300 shadow-inner"
              />
            </div>

            <div className="space-y-1.5 group/field">
              <label className="text-[12px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex justify-between items-end">
                <span>Description Details</span>
                <span className="text-[10px] font-semibold text-slate-400 normal-case tracking-normal transition-opacity duration-300 opacity-50 group-hover/field:opacity-100">Be as specific as possible</span>
              </label>
              <textarea
                rows={4}
                placeholder="Explain the steps to reproduce the bug or provide details regarding your feedback..."
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
                className="w-full bg-white/80 dark:bg-[#131620]/80 backdrop-blur-sm border-2 border-slate-200 dark:border-[#222B3F] rounded-xl px-4 py-3 text-[14px] font-medium text-slate-800 dark:text-[#dbdee1] outline-none hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-300 shadow-inner resize-none leading-relaxed"
              />
            </div>

            {/* Media Attachments Area */}
            <div className="space-y-2">
              <label className="text-[12px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex justify-between items-end">
                <span>Attachments (Optional)</span>
                <span className="text-[10px] font-semibold text-slate-400 normal-case tracking-normal">Images or Video (Max 3)</span>
              </label>
              
              <div 
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group/upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/upload:text-indigo-500 group-hover/upload:bg-indigo-50 dark:group-hover/upload:bg-indigo-500/10 transition-colors">
                   <UploadCloud size={20} />
                </div>
                <div className="text-center">
                   <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover/upload:text-indigo-600 dark:group-hover/upload:text-indigo-400 transition-colors">Click or drag files to upload</p>
                   <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">PNG, JPG, MP4 up to 50MB</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  multiple 
                  onChange={handleFileChange}
                />
              </div>

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3 relative group/file shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        {file.type.startsWith('video') ? <FileVideo size={20} /> : <FileImage size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                        className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center absolute -top-2 -right-2 opacity-0 scale-75 group-hover/file:opacity-100 group-hover/file:scale-100 transition-all hover:bg-rose-200 dark:hover:bg-rose-500/30"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-[14px] rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[-100%] hover:translate-y-[100%] transition-transform duration-1000" />
              <Send size={16} className="relative z-10" />
              <span className="relative z-10">Submit Ticket</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
