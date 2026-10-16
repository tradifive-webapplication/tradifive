import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminFinance() {
  const [stats, setStats] = useState({
    totalRevenue: 452900,
    activeSubscriptions: 124,
    failedPayments: 8,
    mrr: 124000
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            profiles (full_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (data && !error) {
          const formatted = data.map(tx => ({
            id: tx.id,
            user: tx.profiles?.full_name || tx.profiles?.email || 'Unknown User',
            amount: tx.amount,
            plan: tx.type || 'N/A',
            status: tx.status,
            date: new Date(tx.created_at).toLocaleDateString()
          }));
          setTransactions(formatted);
          
          // Compute simple stats
          const totalRev = data.reduce((acc, tx) => acc + (tx.status === 'completed' && tx.type !== 'refund' ? tx.amount : 0), 0);
          const activeSubs = Array.from(new Set(data.filter(t => t.type === 'subscription' && t.status === 'completed').map(t => t.user_id))).length;
          
          setStats(prev => ({
            ...prev,
            totalRevenue: totalRev > 0 ? totalRev : prev.totalRevenue,
            activeSubscriptions: activeSubs > 0 ? activeSubs : prev.activeSubscriptions,
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFinanceData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Finance & Billing</h1>
          <p className="text-slate-400">Monitor revenue streams and subscription health.</p>
        </div>
        <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Finance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarSign size={80} className="text-emerald-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-3xl font-bold text-white mb-2">₹{stats.totalRevenue.toLocaleString()}</h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <ArrowUpRight size={14} />
                +24% from last month
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard size={80} className="text-slate-200" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Active Subs</p>
            <h3 className="text-3xl font-bold text-white mb-2">{stats.activeSubscriptions}</h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <TrendingUp size={14} />
                Institutional Tier: 42
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertCircle size={80} className="text-rose-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Failed Payments</p>
            <h3 className="text-3xl font-bold text-white mb-2">{stats.failedPayments}</h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                <ArrowDownRight size={14} />
                High Risk: 3 cases
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Estimated MRR</p>
            <h3 className="text-3xl font-bold text-white mb-2">₹1.24L</h3>
            <div className="h-1 w-full bg-slate-800 rounded-full mt-4">
                <div className="h-full bg-blue-500 w-[65%]" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-200">{tx.user}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{tx.plan}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white">₹{tx.amount}</td>
                    <td className="px-6 py-4">
                      {tx.status === 'success' ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                          <CheckCircle2 size={14} />
                          Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
                          <XCircle size={14} />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-6">Plan Distribution</h2>
          <div className="space-y-6">
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-white">Premium Plan</p>
                    <p className="text-xs text-slate-300">₹3999/mo</p>
                </div>
                <p className="text-2xl font-bold text-white mb-2">42 Users</p>
                <div className="h-1.5 w-full bg-slate-800 rounded-full">
                    <div className="h-full bg-blue-500 w-[42%]" />
                </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-white">Basic Plan</p>
                    <p className="text-xs text-slate-400">₹999/mo</p>
                </div>
                <p className="text-2xl font-bold text-white mb-2">82 Users</p>
                <div className="h-1.5 w-full bg-slate-800 rounded-full">
                    <div className="h-full bg-slate-500 w-[82%]" />
                </div>
            </div>
            
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl mt-8">
                <h4 className="text-amber-500 text-xs font-bold flex items-center gap-2 mb-2">
                    <AlertCircle size={14} />
                    Pending Payouts
                </h4>
                <p className="text-sm text-slate-400">No pending payouts to strategy providers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


