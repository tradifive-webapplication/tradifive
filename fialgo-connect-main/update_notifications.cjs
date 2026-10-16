const fs = require('fs');
let content = fs.readFileSync('src/pages/Notifications.tsx', 'utf8');

// Add followRequests state
if (!content.includes('followRequests')) {
    const statePos = content.indexOf('const [notifications, setNotifications] = useState');
    content = content.slice(0, statePos) + 'const [followRequests, setFollowRequests] = useState<any[]>([]);\n  ' + content.slice(statePos);
}

// Update fetchNotifications to also fetch follow requests
const fetchNotificationsPos = content.indexOf('const { data, error } = await supabase');
if (!content.includes('const { data: requestsData } = await supabase')) {
    const requestsFetchCode = `
        const { data: requestsData } = await supabase
          .from("social_follow_requests")
          .select("*, requester:profiles!social_follow_requests_requester_id_fkey(id, display_name, username, avatar_url)")
          .eq("target_id", user.id)
          .order("created_at", { ascending: false });
        if (requestsData) {
          setFollowRequests(requestsData);
        }
        `;
    content = content.slice(0, fetchNotificationsPos) + requestsFetchCode + content.slice(fetchNotificationsPos);
}

// Add accept/decline request functions
const functionsPos = content.indexOf('const markRead = async');
if (!content.includes('const acceptFollowRequest = async')) {
    const acceptDeclineCode = `
  const acceptFollowRequest = async (requestId: string, requesterId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Delete request
      await supabase.from("social_follow_requests").delete().eq("id", requestId);
      
      // Create follow
      await supabase.from("social_follows").insert([{ follower_id: requesterId, following_id: user.id }]);
      
      setFollowRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success("Follow request accepted");
    } catch (e: any) {
      toast.error("Failed to accept request");
    }
  };

  const declineFollowRequest = async (requestId: string) => {
    try {
      await supabase.from("social_follow_requests").delete().eq("id", requestId);
      setFollowRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success("Follow request declined");
    } catch (e: any) {
      toast.error("Failed to decline request");
    }
  };\n\n`;
    content = content.slice(0, functionsPos) + acceptDeclineCode + content.slice(functionsPos);
}

// Add Follow Requests UI section above the NOTIFICATIONS LIST
const listPos = content.indexOf('{/* ── NOTIFICATIONS LIST ── */}');
if (!content.includes('followRequests.length > 0')) {
    const requestsUICode = `
        {/* ── FOLLOW REQUESTS ── */}
        {followRequests.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 mb-4 px-1">
              <UserPlus size={16} className="text-blue-500" />
              <h2 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Follow Requests ({followRequests.length})</h2>
            </div>
            {followRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#1E2130] rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(\`/user/\${req.requester?.id}\`)}>
                  {req.requester?.avatar_url ? (
                    <img src={req.requester.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <UserPlus size={16} className="text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{req.requester?.display_name || req.requester?.username}</p>
                    <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Wants to follow you</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); acceptFollowRequest(req.id, req.requester_id); }} className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-bold rounded-full transition-all">Accept</button>
                  <button onClick={(e) => { e.stopPropagation(); declineFollowRequest(req.id); }} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[12px] font-bold rounded-full transition-all">Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}\n\n`;
    content = content.slice(0, listPos) + requestsUICode + content.slice(listPos);
}

fs.writeFileSync('src/pages/Notifications.tsx', content);
console.log('Successfully updated Notifications.tsx');
