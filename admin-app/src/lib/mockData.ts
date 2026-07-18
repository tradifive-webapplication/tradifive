/* ═══════════════════════════════════════════════════════════════
   MOCK DATA — All company HR data. Replace with Supabase later.
═══════════════════════════════════════════════════════════════ */

export type EmployeeStatus = "active" | "on_leave" | "terminated";
export type CandidateStage = "applied" | "interview" | "offer" | "hired" | "rejected";

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
  role_title: string;
  role_level: "employee" | "head" | "cto" | "ceo";
  phone: string;
  avatar_initials: string;
  avatar_color: string;
  joined_at: string;
  status: EmployeeStatus;
  salary: number;
  reporting_to: string | null;
  skills: string[];
  location: string;
  performance_score: number; // 0-100
}

export interface AttendanceRecord {
  employee_id: string;
  date: string; // YYYY-MM-DD
  status: "present" | "absent" | "late" | "on_leave" | "holiday";
  check_in?: string;
  check_out?: string;
}

export interface HiringCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_applied: string;
  department: string;
  stage: CandidateStage;
  resume_url?: string;
  notes: string;
  added_by: string;
  created_at: string;
  experience_years: number;
}

export interface InternalMessage {
  id: string;
  from_id: string;
  from_name: string;
  from_initials: string;
  to_id: string;
  to_name: string;
  message: string;
  read: boolean;
  created_at: string;
}

// All mock employee, attendance, candidate, and messaging data has been removed.
// The application now fetches this data from the Supabase database.

/* ─── SYSTEM HEALTH MOCK ─────────────────────── */
export function generateSystemMetrics() {
  return {
    cpu: Math.floor(Math.random() * 30 + 25), // 25–55%
    memory: Math.floor(Math.random() * 20 + 45), // 45–65%
    network_in: (Math.random() * 5 + 2).toFixed(1), // 2–7 MB/s
    network_out: (Math.random() * 2 + 0.5).toFixed(1), // 0.5–2.5 MB/s
    db_latency: Math.floor(Math.random() * 40 + 20), // 20–60ms
    active_connections: Math.floor(Math.random() * 50 + 80), // 80–130
    requests_per_min: Math.floor(Math.random() * 300 + 400), // 400–700
    error_rate: (Math.random() * 0.5).toFixed(2), // 0–0.5%
  };
}
