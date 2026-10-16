export const BANNED_USERNAMES = new Set([
  // Football/Soccer
  "ronaldo", "cr7", "messi", "leomessi", "neymar", "mbappe", "pele", "maradona", "haaland",
  
  // Cricket
  "dhoni", "msd", "msdhoni", "virat", "koli", "kohli", "viratkohli", "sachin", "tendulkar", 
  "rohit", "rohitsharma", "babar", "babarazam", "abd", "abdevilliers", "gayle", "chrisgayle",
  
  // Other Sports
  "lebron", "jordan", "kobe", "tigerwoods", "muhammadali", "miketyson",
  
  // Politics/Leaders
  "trump", "donaldtrump", "biden", "joebiden", "obama", "barackobama", 
  "modi", "narendramodi", "putin", "zelensky", "kimjongun", "gandhi",

  // Religion/Beliefs
  "god", "temple", "jesus", "christ", "allah", "prophet", "shiva", "vishnu", "krishna", 
  "ram", "buddha", "church", "mosque", "hindu", "muslim", "christian", "devil", "satan",

  // Business/Tech figures
  "elon", "musk", "elonmusk", "billgates", "stevejobs", "zuckerberg", "markzuckerberg",
  "tata", "ratantata", "ambani", "mukeshambani", "adani", "gautamadani",

  // System/Reserved
  "admin", "administrator", "mod", "moderator", "support", "system", "root", 
  "official", "tradifive", "fialgo", "ceo", "founder", "owner", "staff", 
  "help", "info", "contact", "billing", "security", "bot"
]);

const RESTRICTED_SUBSTRINGS = [
  "admin", "moderator", "tradifive", "fialgo", "official", "support"
];

export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (!username) return { isValid: false, message: "Username cannot be empty" };
  if (username.length < 3) return { isValid: false, message: "Username must be at least 3 characters" };
  
  const lower = username.toLowerCase();
  
  // 1. Check for highly restricted substrings anywhere in the name
  if (RESTRICTED_SUBSTRINGS.some(sub => lower.includes(sub))) {
    return { isValid: false, message: "This username contains reserved keywords and is not allowed." };
  }

  // 2. Exact match check
  if (BANNED_USERNAMES.has(lower)) {
    return { isValid: false, message: "This username is reserved and cannot be used." };
  }
  
  // 3. Remove numbers and special characters and check exact match again
  // e.g. "ronaldo7", "messi_10", "dhoni.07", "god123"
  const stripped = lower.replace(/[0-9_.-]/g, '');
  if (BANNED_USERNAMES.has(stripped)) {
    return { isValid: false, message: "This username format is reserved and cannot be used." };
  }
  
  return { isValid: true };
};
