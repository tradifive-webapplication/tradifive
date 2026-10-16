import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Trash2,
  RefreshCcw,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminWaitlist() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchWaitlist = async () => {
    setLoading(true);
    let query = supabase.from('waitlist').select('*');
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const { data } = await query.order('created_at', { ascending: false });
    setWaitlist(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWaitlist();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this entry from the waitlist?")) return;

    try {
      const { error } = await supabase.from('waitlist').delete().eq('id', id);
      if (error) throw error;
      toast.success("Waitlist entry removed");
      fetchWaitlist();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove entry");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('waitlist').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success("Status updated");
      fetchWaitlist();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Waitlist Management</h1>
          <p className="text-slate-400">Manage early access requests and waitlist signups.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <Input 
                    placeholder="Search waitlist..." 
                    className="bg-slate-900 border-slate-800 pl-10 w-[250px] focus:ring-blue-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={fetchWaitlist} variant="outline" className="bg-slate-900 border-slate-800">
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            </Button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/80">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {waitlist.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        {loading ? "Loading..." : "No waitlist entries found."}
                    </td>
                </tr>
              ) : (
                  waitlist.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-400 gap-2">
                          <Clock size={14} className="text-slate-500" />
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{entry.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-400">{entry.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <select 
                            value={entry.status || "pending"}
                            onChange={(e) => handleUpdateStatus(entry.id, e.target.value)}
                            className="bg-slate-800 border-none text-xs rounded-full px-3 py-1 outline-none text-slate-200"
                         >
                            <option value="pending">Pending</option>
                            <option value="invited">Invited</option>
                            <option value="approved">Approved</option>
                         </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-400 max-w-[200px] truncate" title={entry.feedback}>
                            {entry.feedback || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8">
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
