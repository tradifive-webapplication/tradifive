import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  CheckCircle2,
  XCircle,
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminFinance() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    failedPayments: 0,
    mrr: 0
  });

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchFinanceData = async () => {
      // 1. Fetch transactions
      const { data: txs, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (!error && txs) {
        // Fetch profiles to map names
        const userIds = [...new Set(txs.map(t => t.user_id).filter(Boolean))];
        let profilesData: any[] = [];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
          profilesData = profiles || [];
        }

        const mappedTxs = txs.map(tx => ({
          id: tx.id,
          user: profilesData.find(p => p.id === tx.user_id)?.full_name || 'System User',
          amount: tx.amount || 0,
          plan: tx.type || 'Standard',
          status: tx.status === 'completed' || tx.status === 'success' ? 'success' : 'failed',
          date: new Date(tx.created_at).toISOString().split('T')[0]
        }));
        
        setTransactions(mappedTxs);
        
        // Compute stats
        const totalRev = mappedTxs.filter(t => t.status === 'success').reduce((sum, t) => sum + Number(t.amount), 0);
        const failedCount = mappedTxs.filter(t => t.status === 'failed').length;
        
        // Fetch active subscriptions count from profiles
        const { count: activeSubs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).not('subscription_status', 'is', null);
        
        setStats({
          totalRevenue: totalRev,
          activeSubscriptions: activeSubs || 0,
          failedPayments: failedCount,
          mrr: totalRev // Simplification for MRR based on available data
        });
      }
    };
    fetchFinanceData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Financial Operations</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Revenue Monitoring Console</p>
        </div>
        <Button variant="outline" className="border-slate-800 bg-slate-900/50 text-slate-300 rounded-xl px-6 h-12">
          <Download size={16} className="mr-2" />
          Export Ledger
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/20 transition-all">
            <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign size={100} className="text-blue-500" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Gross Revenue</p>
            <h3 className="text-3xl font-bold text-white mb-3">₹{stats.totalRevenue.toLocaleString()}</h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <ArrowUpRight size={14} />
                +24.8%
            </div>
        </div>
        
        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-indigo-500/20 transition-all">
            <div className="absolute -top-4 -right-4 p-8 opacity-5">
                <BarChart2 size={100} className="text-indigo-500" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Subscriptions</p>
            <h3 className="text-3xl font-bold text-white mb-3">{stats.activeSubscriptions}</h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                Premium: 42 users
            </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-rose-500/20 transition-all">
            <div className="absolute -top-4 -right-4 p-8 opacity-5">
                <AlertCircle size={100} className="text-rose-500" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Failed Payouts</p>
            <h3 className="text-3xl font-bold text-white mb-3">{stats.failedPayments}</h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                <ArrowDownRight size={14} />
                Critical: 2
            </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Target MRR</p>
            <h3 className="text-3xl font-bold text-white mb-3">₹1.24L</h3>
            <div className="h-1.5 w-full bg-slate-800/50 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-blue-600 w-[65%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-lg font-bold">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-black/20">
                <tr>
                  <th className="px-8 py-5">User</th>
                  <th className="px-6 py-5">Tier</th>
                  <th className="px-6 py-5 text-right">Amount</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-8 py-5 text-sm font-bold text-slate-300">{tx.user}</td>
                    <td className="px-6 py-5 text-xs text-slate-500 uppercase font-bold tracking-tight">{tx.plan}</td>
                    <td className="px-6 py-5 text-sm font-bold text-white text-right">₹{tx.amount}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {tx.status === 'success' ? (
                            <CheckCircle2 className="text-emerald-500" size={14} />
                        ) : (
                            <XCircle className="text-rose-500" size={14} />
                        )}
                        <span className={`text-[10px] font-bold uppercase ${tx.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl">
          <h2 className="text-lg font-bold">Service Tiers</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-bold text-white">Obsidian Elite</p>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">₹4,999</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">42 Total</p>
                <div className="h-1 w-full bg-slate-800 rounded-full">
                    <div className="h-full bg-blue-500 w-[42%] group-hover:w-[45%] transition-all duration-500" />
                </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl group hover:border-slate-700 transition-all">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-bold text-white">Basic Trader</p>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">₹1,299</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">82 Total</p>
                <div className="h-1 w-full bg-slate-800 rounded-full">
                    <div className="h-full bg-slate-500 w-[82%] group-hover:w-[85%] transition-all duration-500" />
                </div>
            </div>
          </div>

          <div className="mt-auto bg-amber-500/5 border border-amber-500/10 p-6 rounded-2xl">
              <h4 className="text-amber-500 text-[10px] font-bold flex items-center gap-2 mb-3 uppercase tracking-widest">
                  <AlertCircle size={14} />
                  Pending Settlements
              </h4>
              <p className="text-xs text-slate-500 italic">Financial reconciliation in progress for April cycles.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
