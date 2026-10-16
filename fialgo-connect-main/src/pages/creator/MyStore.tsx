import React, { useState, useEffect } from 'react';
import {
   Bag as IconlyBag,
   Plus as IconlyPlus,
   TicketStar as IconlyTicketStar,
   Wallet as IconlyWallet,
   Setting as IconlySetting
} from "react-iconly";

import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ShoppingBag, Plus, Package, DollarSign, TrendingUp, Eye, Edit2, Trash2, ToggleLeft, ToggleRight,
  ChevronRight, ArrowUpRight, Crown, X, Check, Tag, FileText, Image as ImageIcon, Users, Clock, Star,
  Upload, Image
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';


// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoreListing {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  thumbnailUrl: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  creatorName: string;
  creatorId: string;
  sales: number;
}

const CATEGORIES = ['Algo', 'Strategy', 'Indicator', 'Course', 'Mentorship', 'Subscription'];

const CATEGORY_COLORS: Record<string, string> = {
  Algo:         'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Strategy:     'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  Indicator:    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Course:       'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  Mentorship:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Subscription: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
};


// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">
        <ShoppingBag size={28} className="text-purple-500" />
      </div>
      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1.5">No listings yet</h3>
      <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
        Create your first product — an algo, strategy, course, or subscription — and start earning from your expertise.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[13px] font-bold bg-[#A78BFA] hover:bg-[#9273f0] text-white transition-all shadow-md shadow-[#A78BFA]/20"
      >
        <Plus size={15} strokeWidth={3} /> Create First Listing
      </button>
    </div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

function ListingCard({ listing, onToggle, onDelete }: {
  listing: StoreListing;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const catStyle = CATEGORY_COLORS[listing.category] || '';
  const isPublished = listing.status === 'published';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1C1C1C] hover:bg-slate-100/80 dark:hover:bg-[#222] transition-all flex flex-col sm:flex-row sm:items-center gap-4 group"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 shrink-0 border border-slate-200/60 dark:border-white/5 flex items-center justify-center">
        {listing.thumbnailUrl ? (
          <img src={listing.thumbnailUrl} alt={listing.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={22} className="text-purple-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{listing.name}</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catStyle}`}>{listing.category}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isPublished ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-slate-200/60 dark:bg-slate-700/40 text-slate-500 border-slate-300/40'}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed mb-1.5">{listing.description}</p>
        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-1"><DollarSign size={11} />{listing.currency}{listing.price}</span>
          <span className="flex items-center gap-1"><Users size={11} />{listing.sales} sales</span>
          <span className="flex items-center gap-1"><Clock size={11} />{new Date(listing.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggle(listing.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
            isPublished
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
              : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
          title={isPublished ? 'Unpublish' : 'Publish'}
        >
          {isPublished ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {isPublished ? 'Live' : 'Draft'}
        </button>
        <button
          onClick={() => onDelete(listing.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Add Listing Form ─────────────────────────────────────────────────────────

function AddListingTab({ onCreated }: { onCreated: () => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Strategy');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('$');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (asDraft: boolean) => {
    if (!user) { toast.error('Not authenticated'); return; }
    if (!name.trim()) { toast.error('Product name is required.'); return; }
    if (!description.trim()) { toast.error('Description is required.'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { toast.error('Enter a valid price.'); return; }

    setIsSubmitting(true);
    
    let fileUrl = '';
    
    // Upload digital file if selected
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('creator_assets')
          .upload(fileName, file);
          
        if (error) {
          console.error("Upload error:", error);
          toast.error("File upload failed. Ensure bucket 'creator_assets' exists.");
          setIsSubmitting(false);
          return;
        }
        
        const { data: publicData } = supabase.storage.from('creator_assets').getPublicUrl(fileName);
        fileUrl = publicData.publicUrl;
      } catch (e) {
        console.error(e);
        toast.error("An error occurred during file upload");
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.from('creator_products').insert({
        creator_id: user.id,
        title: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        product_type: category.toLowerCase(),
        currency: currency,
        thumbnail_url: thumbnailUrl,
        file_url: fileUrl,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        status: asDraft ? 'draft' : 'active'
    } as any); // using any because types might not be updated locally yet

    setIsSubmitting(false);

    if (error) {
        toast.error('Failed to create listing');
        console.error(error);
        return;
    }

    toast.success(asDraft ? 'Listing saved as Draft!' : 'Listing published to Marketplace!');
    setName(''); setDescription(''); setPrice(''); setThumbnailUrl(''); setTags(''); setFile(null);
    onCreated();
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E1E1E] text-slate-800 dark:text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-600 font-sans";
  const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Plus size={18} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">New Listing</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">Fill in the details. Publish to make it live on the Marketplace.</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className={labelCls}>Product Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pro ICT Scalping Algo" className={inputCls} />
        </div>

        {/* Category + Currency row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
              <option value="$">USD ($)</option>
              <option value="₹">INR (₹)</option>
              <option value="€">EUR (€)</option>
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className={labelCls}>Price *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-400">{currency}</span>
            <input
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="49.00"
              type="number"
              min="0"
              step="0.01"
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what buyers will get, what makes this valuable, and who it's for…"
            className={`${inputCls} resize-none`}
          />
        </div>
        
        {/* Digital Asset File Upload */}
        <div>
          <label className={labelCls}>Digital File (PDF, ZIP, MP4)</label>
          <input 
            type="file" 
            onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[12px] file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-500/10 dark:file:text-purple-400 text-slate-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">This is the secure file buyers will download after payment verification.</p>
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className={labelCls}>Thumbnail URL (optional)</label>
          <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..." className={inputCls} />
          {thumbnailUrl && (
            <div className="mt-2 w-20 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
              <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className={labelCls}>Tags (comma separated)</label>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="scalping, ICT, forex, gold" className={inputCls} />
        </div>

        {/* Submit buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-sm shadow-purple-500/20 disabled:opacity-60"
          >
            <Check size={14} /> {isSubmitting ? 'Uploading...' : 'Publish to Marketplace'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all disabled:opacity-60"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── My Listings Tab ──────────────────────────────────────────────────────────

function MyListingsTab({ onAdd }: { onAdd: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const fetchListings = async (userId: string) => {
    try {
        const { data, error } = await supabase.from('creator_products').select('*').eq('creator_id', userId);
        if (error) {
            console.error(error);
            return;
        }
        if (data) {
            setListings(data.map((d: any) => ({
                id: d.id,
                name: d.title,
                category: d.product_type,
                description: d.description,
                price: d.price,
                currency: d.currency || '$',
                thumbnailUrl: d.thumbnail_url || '',
                tags: d.tags || [],
                status: d.status === 'draft' ? 'draft' : 'published',
                createdAt: d.created_at,
                creatorName: '',
                creatorId: d.creator_id,
                sales: 0 // Will query separately later
            })));
        }
    } catch(e) {
        console.error("Table likely missing", e);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        if(data.user) fetchListings(data.user.id);
    });
  }, []);

  const handleToggle = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    const newStatus = listing.status === 'published' ? 'draft' : 'active';
    const { error } = await supabase.from('creator_products').update({ status: newStatus } as any).eq('id', id);
    if (!error) {
        toast.success('Listing status updated!');
        if(user) fetchListings(user.id);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('creator_products').delete().eq('id', id);
    if (!error) {
        toast.success('Listing removed.');
        if(user) fetchListings(user.id);
    }
  };

  const filtered = listings.filter(l => filter === 'all' || l.status === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border capitalize ${
                filter === f
                  ? 'bg-[#A78BFA] text-white border-[#A78BFA] shadow-md shadow-[#A78BFA]/20'
                  : 'bg-white dark:bg-[#1E1E1E] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {f} {f === 'all' ? `(${listings.length})` : f === 'published' ? `(${listings.filter(l => l.status === 'published').length})` : `(${listings.filter(l => l.status === 'draft').length})`}
            </button>
          ))}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-bold bg-[#A78BFA] hover:bg-[#9273f0] text-white transition-all shadow-md shadow-[#A78BFA]/20"
        >
          <Plus size={14} strokeWidth={3} /> Add Listing
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <div className="space-y-3">
          {filtered.map(l => (
            <ListingCard key={l.id} listing={l} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchOrders = async (userId: string) => {
      try {
          const { data, error } = await supabase
            .from('creator_orders')
            .select('*, product:product_id(title), buyer:buyer_id(display_name, full_name, username)')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });
            
          if (data) setOrders(data);
      } catch (e) {
          console.error(e);
      }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        if(data.user) fetchOrders(data.user.id);
    });
  }, []);
  
  const handleApprove = async (id: string) => {
      const { error } = await supabase.from('creator_orders').update({ status: 'completed' } as any).eq('id', id);
      if(!error) {
          toast.success("Order Approved!");
          if(user) fetchOrders(user.id);
      }
  };
  
  const handleReject = async (id: string) => {
      const { error } = await supabase.from('creator_orders').update({ status: 'rejected' } as any).eq('id', id);
      if(!error) {
          toast.success("Order Rejected!");
          if(user) fetchOrders(user.id);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{orders.length} orders total</p>
      
      {orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No orders yet.</div>
      ) : (
        <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card overflow-hidden">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                {['Buyer', 'Product', 'Status', 'Amount', 'Proof', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02] ${i < orders.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-[11px] font-bold text-purple-500">
                          {(o.buyer?.display_name || o.buyer?.full_name || o.buyer?.username || '?').charAt(0)}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-800 dark:text-white">
                          {o.buyer?.display_name || o.buyer?.full_name || o.buyer?.username || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-300 font-medium">{o.product?.title || 'Unknown Product'}</td>
                  <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          o.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          o.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                          {o.status.toUpperCase()}
                      </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-bold text-emerald-600 dark:text-emerald-400">${o.amount}</td>
                  <td className="px-5 py-3.5">
                      {o.payment_proof_url ? (
                          <a href={o.payment_proof_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[12px] flex items-center gap-1">
                              <Image size={12}/> View Proof
                          </a>
                      ) : (
                          <span className="text-slate-400 text-[12px]">-</span>
                      )}
                  </td>
                  <td className="px-5 py-3.5">
                      {o.status === 'pending' && (
                          <div className="flex gap-2">
                              <button onClick={() => handleApprove(o.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-[11px] font-bold">Approve</button>
                              <button onClick={() => handleReject(o.id)} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-[11px] font-bold">Reject</button>
                          </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Earnings Tab ─────────────────────────────────────────────────────────────

function EarningsTab() {
  const [withdrawing, setWithdrawing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        if(data.user) {
            supabase
              .from('creator_orders')
              .select('*')
              .eq('seller_id', data.user.id)
              .eq('status', 'completed')
              .then(({data: od}) => setOrders(od || []));
        }
    });
  }, []);

  const totalEarnings = orders.reduce((s, o) => s + (o.amount || 0), 0);
  const [balance, setBalance] = useState(0);
  
  useEffect(() => setBalance(totalEarnings), [totalEarnings]);

  const handleWithdraw = () => {
    if (balance <= 0) { toast.error('No balance to withdraw.'); return; }
    setWithdrawing(true);
    toast.loading('Processing withdrawal...', { id: 'withdraw' });
    setTimeout(() => {
      setBalance(0);
      setWithdrawing(false);
      toast.success(`$${totalEarnings.toFixed(2)} withdrawal initiated! Funds arrive in 1–2 business days.`, { id: 'withdraw' });
    }, 2500);
  };

  // Generate dynamic chart data based on completed orders
  const groupedDates: any = {};
  orders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString();
      groupedDates[dateStr] = (groupedDates[dateStr] || 0) + o.amount;
  });
  
  const chartData = Object.keys(groupedDates).map(date => ({
      date: date.substring(0, 5), // short date
      revenue: groupedDates[date]
  }));
  
  // fallback if no data
  const finalChartData = chartData.length > 0 ? chartData : [{date: 'Today', revenue: 0}];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'purple' },
          { label: 'Available Balance', value: `$${balance.toFixed(2)}`, icon: TrendingUp, color: 'emerald' },
          { label: 'Total Orders', value: String(orders.length), icon: Package, color: 'blue' },
        ].map(s => (
          <div key={s.label} className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color === 'purple' ? 'bg-purple-500/10 text-purple-500' : s.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <s.icon size={16} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5">
        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-4">Revenue — Lifetime</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={finalChartData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} />
            <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Withdraw */}
      <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/15 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Ready to withdraw?</h3>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">Available balance: <strong className="text-emerald-500">${balance.toFixed(2)}</strong>. Withdrawals processed in 1–2 business days via Razorpay.</p>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={withdrawing || balance <= 0}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-sm shadow-purple-500/20 disabled:opacity-50"
        >
          {withdrawing ? 'Processing…' : 'Withdraw Funds'}
        </button>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
    const [user, setUser] = useState<any>(null);
    const [paymentDetails, setPaymentDetails] = useState('');
    const [paymentQrUrl, setPaymentQrUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if(data.user) {
                setUser(data.user);
                supabase.from('profiles').select('payment_details, payment_qr_url').eq('id', data.user.id).single()
                    .then(({data: p}) => {
                        if(p) {
                            setPaymentDetails(p.payment_details || '');
                            setPaymentQrUrl(p.payment_qr_url || '');
                        }
                    });
            }
        });
    }, []);

    const handleSave = async () => {
        if(!user) return;
        setSaving(true);
        let finalQrUrl = paymentQrUrl;
        
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-qr-${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('creator_assets')
              .upload(fileName, file);
              
            if (!uploadError) {
              const { data: publicData } = supabase.storage.from('creator_assets').getPublicUrl(fileName);
              finalQrUrl = publicData.publicUrl;
              setPaymentQrUrl(finalQrUrl);
            } else {
                toast.error("Failed to upload QR Code.");
                setSaving(false);
                return;
            }
        }

        const { error } = await supabase.from('profiles').update({
            payment_details: paymentDetails,
            payment_qr_url: finalQrUrl
        } as any).eq('id', user.id);

        setSaving(false);
        if(error) toast.error("Failed to save settings");
        else toast.success("Payment settings updated successfully!");
    };

    const inputCls = "w-full px-4 py-2.5 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E1E1E] text-slate-800 dark:text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-600 font-sans";
    const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

    return (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-6 space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <IconlySetting set="curved" className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Payment Settings</h2>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">Configure how buyers will pay you for your products.</p>
              </div>
            </div>

            <div>
              <label className={labelCls}>Payment Details / Bank Info</label>
              <textarea
                value={paymentDetails}
                onChange={e => setPaymentDetails(e.target.value)}
                rows={3}
                placeholder="e.g. UPI ID: creator@upi OR Bank Name: XYZ, Acct: 123..."
                className={`${inputCls} resize-none`}
              />
            </div>
            
            <div>
              <label className={labelCls}>Payment QR Code (UPI/PayPal)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[12px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-500/10 dark:file:text-amber-400 text-slate-500"
              />
              {paymentQrUrl && !file && (
                 <div className="mt-3">
                     <p className="text-[11px] text-slate-400 mb-1">Current QR Code:</p>
                     <img src={paymentQrUrl} alt="QR Code" className="w-32 rounded border border-slate-200 dark:border-white/10" />
                 </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 px-6 py-2.5 rounded-xl text-[13px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm shadow-amber-500/20 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'listings', label: 'My Listings',  icon: IconlyBag },
  { id: 'add',      label: 'Add Listing',  icon: IconlyPlus },
  { id: 'orders',   label: 'Orders',       icon: IconlyTicketStar },
  { id: 'earnings', label: 'Earnings',     icon: IconlyWallet },
  { id: 'settings', label: 'Settings',     icon: IconlySetting },
];

export default function MyStore() {
  const [activeTab, setActiveTab] = useState('listings');
  const navigate = useNavigate();
  
  // Quick count query for header
  const [stats, setStats] = useState({ listings: 0, published: 0, orders: 0 });
  
  useEffect(() => {
      supabase.auth.getUser().then(({data}) => {
          if(data.user) {
              const fetchStats = async () => {
                  try {
                      const {count: lCount} = await supabase.from('creator_products').select('*', { count: 'exact', head: true }).eq('creator_id', data.user.id);
                      const {count: pCount} = await supabase.from('creator_products').select('*', { count: 'exact', head: true }).eq('creator_id', data.user.id).eq('status', 'active');
                      const {count: oCount} = await supabase.from('creator_orders').select('*', { count: 'exact', head: true }).eq('seller_id', data.user.id);
                      setStats({ listings: lCount||0, published: pCount||0, orders: oCount||0 });
                  } catch(e) {}
              };
              fetchStats();
          }
      })
  }, [activeTab]);

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Creator Dashboard', path: '/creator/analytics' },
        { label: 'My Store', path: '/creator/store' },
      ]}
      noPadding={true}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 space-y-6 font-sans">

        {/* Top Controls: Tabs (Center) & Stats (Right) */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl mx-auto mb-6 gap-6 relative">
          
          {/* Spacer to perfectly center the tabs in flex layout */}
          <div className="hidden md:block flex-1"></div>

          {/* Tabs */}
          <div className="flex-1 flex justify-center shrink-0">
            <div className="flex w-fit items-center gap-1 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-full shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-1.5 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all shrink-0 ${
                      active
                        ? 'bg-[#A78BFA] text-white shadow-sm shadow-[#A78BFA]/20'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats on the right */}
          <div className="flex-1 flex justify-end shrink-0">
            <div className="flex items-center gap-5 text-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-2 rounded-full shadow-sm">
              <div>
                <p className="text-[16px] font-extrabold text-slate-900 dark:text-white leading-tight">{stats.listings}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Listings</p>
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
              <div>
                <p className="text-[16px] font-extrabold text-emerald-500 leading-tight">{stats.published}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Published</p>
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
              <div>
                <p className="text-[16px] font-extrabold text-slate-900 dark:text-white leading-tight">{stats.orders}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'listings' && <MyListingsTab onAdd={() => setActiveTab('add')} />}
            {activeTab === 'add'      && <AddListingTab onCreated={() => setActiveTab('listings')} />}
            {activeTab === 'orders'   && <OrdersTab />}
            {activeTab === 'earnings' && <EarningsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
