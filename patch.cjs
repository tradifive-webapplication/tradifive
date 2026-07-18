const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// 1. Insert variables
const searchStr = "  const isLocked = privacySettings.is_private && !followedUsers[profile?.id ?? ''] && currentUserId !== profile?.id;";
const replacementStr = searchStr + `

  const displayTradesCount = isLocked ? 0 : totalTradesCount;
  const displayWinRate = isLocked ? "0%" : winRateVal;
  const displayRoi = isLocked ? "0.00%" : roiVal;
  const displayAvgRR = isLocked ? "1 : 0.0" : avgRRVal;
  const displayStreak = isLocked ? "0 Days" : streakVal;
  
  const displayAdvMetrics = isLocked ? {
     totalPnlPercent: "+0.0%",
     chartPath: "M0,20 L100,20",
     profitFactor: "0.00",
     expectancy: "0.00",
     maxDrawdown: "0.0%",
     consistencyScore: 0,
     emotionalDiscipline: 0,
     revengeRisk: "Low",
     confidenceScore: 0,
     bestSession: "N/A",
     suggestedImprovement: "N/A"
  } : advMetrics;`;

content = content.replace(searchStr, replacementStr);

// 2. Replace variables in UI
content = content.replace(/totalTradesCount\.toLocaleString\(\)/g, 'displayTradesCount.toLocaleString()');
content = content.replace(/winRateVal/g, 'displayWinRate');
content = content.replace(/roiVal/g, 'displayRoi');
content = content.replace(/avgRRVal/g, 'displayAvgRR');
content = content.replace(/streakVal/g, 'displayStreak');

// Fix the setters!
content = content.replace(/setdisplayWinRate/g, 'setWinRateVal');
content = content.replace(/setdisplayRoi/g, 'setRoiVal');
content = content.replace(/setdisplayAvgRR/g, 'setAvgRRVal');
content = content.replace(/setdisplayStreak/g, 'setStreakVal');

// advMetrics
content = content.replace(/advMetrics\./g, 'displayAdvMetrics.');

// 3. Skeletons - Main Column
const mainContentStart = `<div className="space-y-6">
              {/* --- QUICK STATS GRID CARDS (5 Cards) --- */}`;
const mainSkeleton = `{loading ? (
              <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-10 w-64 rounded-full bg-slate-200 dark:bg-slate-800 mt-6" />
                <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
              {/* --- QUICK STATS GRID CARDS (5 Cards) --- */}`;

content = content.replace(mainContentStart, mainSkeleton);

const mainContentEnd = `          </div>
        </div>
          
          {/* --- COLUMN 3: RIGHT SIDEBAR (col-span-3) --- */}`;
const mainContentEndRep = `            </div>
            )}
          </div>
        </div>
          
          {/* --- COLUMN 3: RIGHT SIDEBAR (col-span-3) --- */}`;

content = content.replace(mainContentEnd, mainContentEndRep);

// 4. Skeletons - Right Sidebar
const rightSidebarStart = `<div className="md:col-span-4 lg:col-span-3 space-y-6">
            
            {/* A. Suggested Traders Widget */}`;
const rightSidebarSkeleton = `<div className="md:col-span-4 lg:col-span-3 space-y-6">
            {loading ? (
              <div className="space-y-6 animate-pulse">
                 <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
                 <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
                 <div className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800" />
                 <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : (
              <>
            {/* A. Suggested Traders Widget */}`;

content = content.replace(rightSidebarStart, rightSidebarSkeleton);

const rightSidebarEnd = `            </div>

          </div>
        </div>
      </div>`;
const rightSidebarEndRep = `            </>
            )}
          </div>
        </div>
      </div>`;

content = content.replace(rightSidebarEnd, rightSidebarEndRep);

fs.writeFileSync('src/pages/UserProfilePublic.tsx', content);
console.log('Success!');
