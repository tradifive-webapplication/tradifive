import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Activity, 
    CreditCard, 
    MessageSquare, 
    ShieldAlert, 
    UserPlus, 
    Settings, 
    Download, 
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
    Terminal,
    ArrowRight,
    Clock
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type ActivityType = "all" | "trading" | "transactions" | "social" | "system";
type StatusType = "success" | "pending" | "failed" | "info" | "warning";

export default function TradeHistory() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ActivityType>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Auth session check on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast.error("Authentication required", {
                    description: "Please sign in to access the Audit Log."
                });
                navigate("/login");
            }
        });
    }, [navigate]);

    const { loading, activities, refetch } = useActivityLogs();

    const filteredActivities = activities.filter(a => {
        if (activeTab !== "all" && a.type !== activeTab) return false;
        if (
            searchQuery && 
            !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !a.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !(a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ) return false;
        return true;
    });

    const getStatusBadge = (status: StatusType) => {
        switch (status) {
            case "success": return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Success</span>;
            case "failed": return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Failed</span>;
            case "pending": return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Pending</span>;
            case "warning": return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">Warning</span>;
            case "info": return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-[#222] dark:text-slate-400 border border-slate-200 dark:border-white/5">Info</span>;
        }
    };

    const handleExportCSV = () => {
        toast.success("Audit Log Exported", {
            description: "Telemetry logs successfully formatted as CSV and downloaded."
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: "Activity Log", path: "/history" }]}>
            <div className="max-w-6xl mx-auto w-full font-sans pb-10">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Audit Log</h1>
                        <p className="text-[14px] font-medium text-slate-500">Enterprise-grade record of all system, social, and trading events.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-[13px] font-bold shadow-sm hover:opacity-90 transition-opacity">
                            <Download size={16} /> Export to CSV
                        </button>
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="flex flex-col lg:flex-row items-center gap-4 mb-6">
                    {/* Search */}
                    <div className="relative w-full lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search logs by ID or text..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm text-[13px] font-medium outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    
                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                        {[
                            { id: "all", label: "All Logs" },
                            { id: "trading", label: "Trading" },
                            { id: "transactions", label: "Billing" },
                            { id: "social", label: "Social" },
                            { id: "system", label: "System" }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ActivityType)}
                                className={`shrink-0 px-4 py-2 rounded-lg text-[12px] font-bold transition-all border ${
                                    activeTab === tab.id 
                                        ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-[#121212] dark:text-slate-400 dark:border-white/5 dark:hover:bg-[#1A1A1A]"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* DATA TABLE */}
                <div className="bg-white dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#1E1E1E] border-b border-slate-200 dark:border-white/5">
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-12">Type</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Event Description</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Reference ID</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Timestamp</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#222]">
                                {filteredActivities.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                                            <Terminal size={24} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-[13px] font-medium">No audit logs match your query.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredActivities.map((activity) => {
                                        const isExpanded = expandedId === activity.id;
                                        const Icon = activity.icon;
                                        return (
                                            <Fragment key={activity.id}>
                                                <tr 
                                                    onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                                                    className={`hover:bg-slate-50 dark:hover:bg-[#151515] transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-[#151515]' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="text-slate-400 dark:text-slate-400">
                                                            <Icon size={16} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5">{activity.title}</p>
                                                        <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-1">{activity.description}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[12px] font-mono font-medium bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                                            {activity.referenceId}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">{activity.timestamp}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(activity.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && activity.details && (
                                                    <tr>
                                                        <td colSpan={6} className="p-0 border-t-0">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="bg-slate-50/80 dark:bg-[#1E1E1E] overflow-hidden"
                                                            >
                                                                <div className="px-6 py-6 border-b border-slate-200 dark:border-white/5">
                                                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                        <Filter size={12} /> Log Payload Data
                                                                    </h4>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                                        {Object.entries(activity.details).map(([key, value], i) => (
                                                                            <div key={i}>
                                                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{key}</p>
                                                                                <p className={`text-[13px] font-medium ${
                                                                                    value.startsWith('+') ? 'text-emerald-600 font-bold' :
                                                                                    value.startsWith('-') ? 'text-rose-600 font-bold' :
                                                                                    'text-slate-900 dark:text-white'
                                                                                }`}>
                                                                                    {value}
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination footer */}
                    <div className="px-6 py-4 bg-white dark:bg-[#121212] border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[12px] font-medium text-slate-500">
                        <span>Showing {filteredActivities.length} logs</span>
                        <div className="flex items-center gap-4">
                            <button className="hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50" disabled>Previous</button>
                            <button className="hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </div>

            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </DashboardLayout>
    );
}
