const fs = require('fs');
let content = fs.readFileSync('src/pages/Notifications.tsx', 'utf8');

// 1. Update acceptFollowRequest
const acceptFuncStart = content.indexOf('const acceptFollowRequest = async (requestId: string, requesterId: string) => {');
const acceptFuncEnd = content.indexOf('};', acceptFuncStart) + 2;

const newAcceptFunc = `const acceptFollowRequest = async (requestId: string, requesterId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Delete request
      await supabase.from("social_follow_requests").delete().eq("id", requestId);
      
      // Create follow
      await supabase.from("social_follows").insert([{ follower_id: requesterId, following_id: user.id }]);
      
      // Mark as accepted locally instead of filtering it out immediately
      setFollowRequests(prev => prev.map(r => r.id === requestId ? { ...r, accepted: true } : r));
      toast.success("Follow request accepted");
    } catch (e: any) {
      toast.error("Failed to accept request");
    }
  };`;

content = content.slice(0, acceptFuncStart) + newAcceptFunc + content.slice(acceptFuncEnd);


// 2. Update the follow request rendering
const reqMapStart = content.indexOf('{followRequests.map(req => (');
const reqMapEnd = content.indexOf('))}</div>', reqMapStart) !== -1 
  ? content.indexOf('))}</div>', reqMapStart) + 3
  : content.indexOf('))}', reqMapStart) + 3;

const newReqMap = `{followRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#1E2130] rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(\`/user/\${req.requester_id}\`)}>
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
                  {req.accepted ? (
                    <>
                      <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2">Accepted</span>
                      <button onClick={(e) => { e.stopPropagation(); setFollowRequests(prev => prev.filter(r => r.id !== req.id)); }} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[12px] font-bold rounded-full transition-all">Delete</button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); acceptFollowRequest(req.id, req.requester_id); }} className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-bold rounded-full transition-all">Accept</button>
                      <button onClick={(e) => { e.stopPropagation(); declineFollowRequest(req.id); }} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[12px] font-bold rounded-full transition-all">Decline</button>
                    </>
                  )}
                </div>
              </div>
            ))}`;

content = content.slice(0, reqMapStart) + newReqMap + content.slice(reqMapEnd);

fs.writeFileSync('src/pages/Notifications.tsx', content);
console.log('Fixed follow requests UI');
