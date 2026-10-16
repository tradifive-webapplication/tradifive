import { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useDashboardData } from "@/hooks/useDashboardData";

const dataMap: Record<string, any[]> = {
  "Today": [
    { time: "09:00", balance: 10000, equity: 10000 },
    { time: "10:00", balance: 10000, equity: 10045 },
    { time: "11:00", balance: 10000, equity: 9980 },
    { time: "12:00", balance: 10000, equity: 10120 },
    { time: "13:00", balance: 10120, equity: 10150 },
    { time: "14:00", balance: 10120, equity: 10090 },
    { time: "15:00", balance: 10120, equity: 10210 },
    { time: "16:00", balance: 10210, equity: 10180 },
    { time: "17:00", balance: 10210, equity: 10340 },
  ],
  "7D": [
    { time: "Mon", balance: 9500, equity: 9450 },
    { time: "Tue", balance: 9600, equity: 9700 },
    { time: "Wed", balance: 9600, equity: 9550 },
    { time: "Thu", balance: 9800, equity: 9920 },
    { time: "Fri", balance: 9800, equity: 10050 },
    { time: "Sat", balance: 10210, equity: 10180 },
    { time: "Sun", balance: 10210, equity: 10340 },
  ],
  "1M": [
    { time: "W1", balance: 8000, equity: 8100 },
    { time: "W2", balance: 8500, equity: 8300 },
    { time: "W3", balance: 9200, equity: 9500 },
    { time: "W4", balance: 10210, equity: 10340 },
  ]
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] p-3 rounded-xl shadow-lg border border-border/60 text-sm">
        <p className="text-slate-500 font-bold mb-2">{label}</p>
        <div className="space-y-1.5">
          <p className="flex items-center gap-2 text-[#22C55E] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
            Equity: ${payload[1]?.value?.toLocaleString()}
          </p>
          <p className="flex items-center gap-2 text-[#3B82F6] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
            Balance: ${payload[0]?.value?.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, index, dataLength } = props;
  
  // Only render dot for the last data point of Equity
  if (index === dataLength - 1) {
    return (
      <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="visible">
        <circle cx="6" cy="6" r="4" fill="#22C55E" />
        <circle cx="6" cy="6" r="6" fill="#22C55E" opacity="0.4" className="animate-ping" />
        <circle cx="6" cy="6" r="2" fill="#fff" />
      </svg>
    );
  }
  return null;
};

const BlurOverlay = () => (
  <div className="absolute inset-0 z-50 bg-white/5 dark:bg-slate-900/5 rounded-[20px]" />
);

export default function EquityChart() {
  const [timeFilter, setTimeFilter] = useState("Today");
  const [dbData, setDbData] = useState<any[]>([]);

  useEffect(() => {
    let tradeSubscription: any;

    const loadChartData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: metricsData } = await supabase.from('mt5_accounts').select('balance').eq('user_id', user.id).single();
      const baseBalance = metricsData?.balance || 10000;
      
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('closed_at', { ascending: true });
        
      if (data && data.length > 0) {
        let runningBalance = baseBalance; 
        const chartData = data.map((t: any) => {
          runningBalance += (t.profit || 0);
          return {
            time: t.closed_at ? new Date(t.closed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now',
            balance: baseBalance,
            equity: runningBalance
          };
        });
        setDbData(chartData);
      }

      // subscribe to realtime for chart
      tradeSubscription = supabase.channel('chart-trades-channel')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` }, payload => {
             const t = payload.new;
             setDbData(prev => {
                const arr = prev.length > 0 ? prev : dataMap['Today'];
                const lastBalance = arr[arr.length - 1].equity;
                const newPoint = {
                  time: t.closed_at ? new Date(t.closed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                  balance: lastBalance - (t.profit || 0), // Estimate base balance
                  equity: lastBalance + (t.profit || 0)
                };
                return [...prev, newPoint];
             });
          })
          .subscribe();
    };
    loadChartData();

    return () => {
      if(tradeSubscription) supabase.removeChannel(tradeSubscription);
    };
  }, []);

  const { accountMetrics, recentTrades, isDemoMode } = useDashboardData();
  const hasData = accountMetrics && dbData.length > 0;
  
  let finalData;
  if (isDemoMode || !hasData) {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    finalData = [
      { time: yesterday.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }), balance: 0, equity: 0 },
      { time: today.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }), balance: 0, equity: 0 }
    ];
  } else {
    finalData = dbData;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] p-7 rounded-[28px] shadow-sm border border-slate-100 dark:border-[#333333]/60 flex flex-col relative h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Account Growth</h3>
          <div className="flex items-center gap-5 mt-2.5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"></span> 
              Balance
            </div>
            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.3)]"></span> 
              Equity (LIVE)
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-100/50 dark:bg-blue-500 p-1 rounded-2xl border border-slate-200 dark:border-[#333333]/50">
          {["Today", "7D", "1M"].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                timeFilter === filter ? "bg-white shadow-md text-slate-900" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={finalData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} 
              dy={15}
              minTickGap={20}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} 
              domain={['auto', 'auto']}
              tickCount={6}
              tickFormatter={(value) => `$${Math.round(value)}`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1.5, strokeDasharray: '4 4' }} />

            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#3B82F6" 
              strokeWidth={2.5}
              fill="url(#colorBalance)" 
              activeDot={{ r: 4, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
            />
            
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke="#22C55E" 
              strokeWidth={3}
              fill="url(#colorEquity)" 
              activeDot={{ r: 6, fill: "#22C55E", stroke: "#fff", strokeWidth: 2 }}
              dot={(props) => <CustomDot {...props} dataLength={finalData.length} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}





