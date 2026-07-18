import { useState, useEffect } from "react";
import { Search, ShoppingBag, CheckCircle, XCircle, DollarSign, Activity, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function MarketplaceManagerPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`*, profiles:seller_id (full_name)`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching marketplace items:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('marketplace_items').update({ status }).eq('id', id);
    setProducts(products.map(p => p.id === id ? { ...p, status } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Marketplace</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Store & Product Listings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Products", val: products.filter(p => p.status === 'approved').length.toString() },
          { label: "Pending Approvals", val: products.filter(p => p.status === 'pending').length.toString(), alert: true },
          { label: "Total Sales Volume", val: "$" + products.reduce((acc, p) => acc + (p.price * (p.sales_count || 0)), 0).toLocaleString() },
          { label: "Platform Cut (30%)", val: "$" + (products.reduce((acc, p) => acc + (p.price * (p.sales_count || 0)), 0) * 0.3).toLocaleString(), color: "text-emerald-500" }
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-5 rounded">
            <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-xl font-bold ${m.alert && m.val !== '0' ? 'text-amber-500' : m.color ? m.color : 'text-white'}`}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden flex flex-col h-[calc(100vh-280px)]">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
           <div className="relative w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-[#121212] border border-white/5 rounded pl-9 pr-4 py-1.5 text-[11px] text-white w-full focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
             <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
             </div>
          ) : products.length === 0 ? (
             <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                No marketplace products found.
             </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Product</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Seller</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Metrics</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <ShoppingBag size={14} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-white">{p.name}</p>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{p.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] text-neutral-300">@{p.profiles?.full_name || 'Anonymous'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                       <div>
                          <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Price</p>
                          <p className="text-[12px] font-bold text-emerald-500">${p.price}</p>
                       </div>
                       <div>
                          <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Sales</p>
                          <p className="text-[12px] font-bold text-white">{p.sales_count || 0}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {p.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateStatus(p.id, 'approved')} className="p-1.5 rounded bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => updateStatus(p.id, 'rejected')} className="p-1.5 rounded bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                          <XCircle size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${
                        p.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      }`}>
                        <span className="text-[9px] font-bold uppercase tracking-widest">{p.status}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
