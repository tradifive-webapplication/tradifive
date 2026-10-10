export interface Competition {
  id: number;
  title: string;
  status: 'Upcoming' | 'Active' | 'Finished';
  start: string;
  end: string;
  prize: string;
  contestants: string;
  time: string | null;
  finished: string | null;
}

export class ContestsService {
  static getCompetitions(): Competition[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth(); // 0-indexed

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Compute relative competitions based on current system time (e.g. May 2026)
    // 1. Upcoming (Next Month)
    const upcomingMonthIdx = (currentMonthIdx + 1) % 12;
    const upcomingYear = upcomingMonthIdx === 0 ? currentYear + 1 : currentYear;
    
    // 2. Active (Current Month)
    const activeMonthIdx = currentMonthIdx;
    
    // 3. Finished (Previous 2 Months)
    const prev1MonthIdx = (currentMonthIdx - 1 + 12) % 12;
    const prev1Year = prev1MonthIdx === 11 ? currentYear - 1 : currentYear;
    
    const prev2MonthIdx = (currentMonthIdx - 2 + 12) % 12;
    const prev2Year = prev2MonthIdx >= 10 && currentMonthIdx <= 1 ? currentYear - 1 : currentYear;

    return [
      {
        id: 1,
        title: `${months[upcomingMonthIdx]} Competition '${upcomingYear.toString().slice(-2)}`,
        status: 'Upcoming',
        start: `${months[upcomingMonthIdx].slice(0, 3)} 1, ${upcomingYear}`,
        end: `${months[upcomingMonthIdx].slice(0, 3)} 30, ${upcomingYear}`,
        prize: '₹10,000 Cash & ₹2.0M Challenges',
        contestants: '12,450',
        time: '12D 10H',
        finished: null
      },
      {
        id: 2,
        title: `${months[activeMonthIdx]} Competition '${currentYear.toString().slice(-2)}`,
        status: 'Active',
        start: `${months[activeMonthIdx].slice(0, 3)} 1, ${currentYear}`,
        end: `${months[activeMonthIdx].slice(0, 3)} 31, ${currentYear}`,
        prize: '₹8,000 Cash & ₹1.7M Challenges',
        contestants: '84,192',
        time: '6D 4H',
        finished: null
      },
      {
        id: 3,
        title: `${months[prev1MonthIdx]} Competition '${prev1Year.toString().slice(-2)}`,
        status: 'Finished',
        start: `${months[prev1MonthIdx].slice(0, 3)} 1, ${prev1Year}`,
        end: `${months[prev1MonthIdx].slice(0, 3)} 30, ${prev1Year}`,
        prize: '₹8,000 Cash & ₹1.7M Challenges',
        contestants: '79,020',
        time: null,
        finished: `${months[prev1MonthIdx].slice(0, 3)} 30, ${prev1Year}`
      },
      {
        id: 4,
        title: `${months[prev2MonthIdx]} Competition '${prev2Year.toString().slice(-2)}`,
        status: 'Finished',
        start: `${months[prev2MonthIdx].slice(0, 3)} 1, ${prev2Year}`,
        end: `${months[prev2MonthIdx].slice(0, 3)} 31, ${prev2Year}`,
        prize: '₹7,500 Cash & ₹1.5M Challenges',
        contestants: '71,940',
        time: null,
        finished: `${months[prev2MonthIdx].slice(0, 3)} 31, ${prev2Year}`
      }
    ];
  }
}
