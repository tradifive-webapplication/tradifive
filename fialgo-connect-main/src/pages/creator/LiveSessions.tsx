import React, { useState, useEffect } from "react";
import { CommunityPageWrapper } from "@/components/CommunityShell";
import { Radio, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  platform: "Zoom" | "Google Meet" | "Microsoft Teams" | "Other";
  meetingLink: string;
  passcode?: string;
  createdAt: string;
  creatorName: string;
  creatorId: string;
}

const LS_KEY = "tradifive_live_sessions";

function getSessions(): LiveSession[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions: LiveSession[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new Event("tradifive_sessions_update"));
}

export default function LiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>(() => getSessions());
  const currentUserId = localStorage.getItem("tradifive_cached_username") || "";

  useEffect(() => {
    const handler = () => setSessions(getSessions());
    window.addEventListener("tradifive_sessions_update", handler);
    return () => window.removeEventListener("tradifive_sessions_update", handler);
  }, []);

  const handleDelete = (id: string) => {
    saveSessions(sessions.filter((s) => s.id !== id));
    toast.success("Session removed.");
  };

  const upcomingSessions = [...sessions].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  );

  return (
    <CommunityPageWrapper noPadding={true}>
      <div className="w-full">
        <div className="px-3.5 sm:px-6 pt-4 pb-24 w-full max-w-[760px] mx-auto space-y-4 font-sans">
          <h1 className="text-[24px] font-bold text-slate-900 dark:text-white tracking-tight px-0.5">
            Live
          </h1>

          {upcomingSessions.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200/85 dark:border-white/10 bg-white dark:bg-[#161618] min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200">
                <Radio size={28} strokeWidth={2} />
              </div>
              <h2 className="text-[19px] font-bold text-slate-900 dark:text-white tracking-tight mt-5">
                No live right now.
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-1.5 max-w-xs leading-relaxed">
                When TradiFive goes live, it shows here and in your Notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-[22px] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#161618] flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.07] text-slate-900 dark:text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {new Date(session.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-[20px] font-black leading-none my-0.5">
                      {new Date(session.date).getDate()}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">{session.time}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[15.5px] font-bold text-slate-900 dark:text-white">
                        {session.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10.5px] font-bold">
                        {session.platform}
                      </span>
                    </div>
                    {session.description && (
                      <p className="text-[13px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                        {session.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2 rounded-full tactile-black-pill text-[13px] font-bold"
                    >
                      Join Live
                    </a>
                    {session.creatorId === currentUserId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(session.id)}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CommunityPageWrapper>
  );
}
