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
    { id: 'bug', label: 'Technical Bug', icon: Bug },
    { id: 'billing', label: 'Billing Issue', icon: CreditCard },
    { id: 'features', label: 'Feature Request', icon: AlertCircle },
    { id: 'feedback', label: 'General Feedback', icon: MessageSquare },
  ];

  return (
    <div className="w-full space-y-5 pb-8">
      {/* Main Form Card */}
      <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6">
        <form onSubmit={handleReportSubmit} className="space-y-5">
          {/* Category Selection Grid */}
          <div className="space-y-2">
            <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block px-1">
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
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/40 dark:bg-blue-500/10 text-slate-900 dark:text-white ring-1 ring-[#2563EB]/25'
                        : 'border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-slate-500 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400'}`}>
                      <Icon size={17} />
                    </div>
                    <span className="text-[12px] font-semibold">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 dark:bg-white/[0.06]" />

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block px-1">
                Subject Summary
              </label>
              <input
                type="text"
                placeholder="Brief title of the problem"
                value={reportSubject}
                onChange={e => setReportSubject(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-[#1E1E24] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
                  Description Details
                </label>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">Be as specific as possible</span>
              </div>
              <textarea
                rows={4}
                placeholder="Explain the steps to reproduce the bug or provide details regarding your feedback..."
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-[#1E1E24] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Media Attachments Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
                  Attachments (Optional)
                </label>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">Images or Video (Max 3)</span>
              </div>

              <div
                className="w-full border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/70 dark:bg-white/[0.02] hover:border-[#2563EB] hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                  <UploadCloud size={18} />
                </div>
                <div className="text-center">
                  <p className="text-[12.5px] font-semibold text-slate-800 dark:text-white">Click to upload files</p>
                  <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">PNG, JPG, MP4 up to 50MB</p>
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
                    <div key={idx} className="bg-slate-50 dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-3 flex items-center gap-2.5 relative group">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-[#2563EB] dark:text-blue-400 shrink-0">
                        {file.type.startsWith('video') ? <FileVideo size={18} /> : <FileImage size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800 dark:text-white truncate">{file.name}</p>
                        <p className="text-[10.5px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                        className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 hover:bg-rose-200 transition-colors cursor-pointer"
                        aria-label="Remove attachment"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex justify-end">
            <button
              type="submit"
              className="h-9 px-5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[12.5px] shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Send size={14} />
              <span>Submit Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
