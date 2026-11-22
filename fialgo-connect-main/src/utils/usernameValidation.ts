// ============================================================================
// TRADIFIVE HANDLE & USERNAME RESTRICTION POLICY
// Prohibits deities/gods, prime ministers, heads of state, regulatory bodies,
// platform impersonation, and abusive terms.
// ============================================================================

// 1. RELIGION / DEITIES / SACRED FIGURES
export const RELIGIOUS_TERMS = new Set([
  // Universal / English
  "god", "gods", "almighty", "lord", "deity", "divine", "creator", "holy", "holyspirit",
  "jesus", "christ", "jesuschrist", "messiah", "yahweh", "jehova", "jehovah", "elohim",
  "allah", "prophet", "muhammad", "mohammed", "prophetmuhammad", "rasool", "nabi",
  "buddha", "gautamabuddha", "bodhisattva",
  "mahavir", "mahavira", "tirthankar", "tirthankara",
  "guru", "gurunanak", "nanak", "waheguru", "gobindsingh",
  "bible", "quran", "koran", "torah", "gita", "geeta", "bhagavadgita", "vedas", "ramayana", "upanishad",
  "temple", "church", "mosque", "gurudwara", "devil", "satan", "lucifer",

  // Hindu / Indian Deities & Sacred Figures
  "bhagwan", "ishwar", "paramatma", "devta", "devi",
  "shiva", "shiv", "mahadev", "bholenath", "shanker", "shankara", "rudra", "neelkanth", "natraj", "shambhu",
  "vishnu", "narayana", "hari", "jagannath",
  "krishna", "kanha", "govind", "gopal", "radhakrishna", "radha", "radhey", "madhav", "keshav", "murlidhar",
  "ram", "rama", "sita", "shreeram", "sitaram", "raghav", "raghupati", "ayodhya", "shriram",
  "ganesh", "ganesha", "ganpati", "vinayaka", "lambodar", "vighnaharta",
  "hanuman", "bajrangbali", "maruti", "anjaneya", "sankatmochan",
  "brahma", "saraswati", "lakshmi", "laxmi", "durga", "kali", "parvati", "ambey", "sherawali", "chamunda",
  "saibaba", "shirdi", "sai"
]);

// 2. PRIME MINISTERS / PRESIDENTS / POLITICAL TITLES / HEADS OF STATE
export const POLITICAL_AND_LEADERSHIP_TERMS = new Set([
  // Official Titles & Offices
  "primeminister", "prime_minister", "pmo", "pm_india", "pmindia",
  "president", "rashtrapati", "vicepresident",
  "chiefminister", "chief_minister", "cmo", "governor",
  "minister", "cabinetminister", "parliament", "sansad", "loksabha", "rajyasabha",
  "government", "govt", "govtofindia", "whitehouse", "kremlin",
  "mp", "mla", "senator", "congressman", "diplomat", "ambassador",
  "king", "queen", "emperor", "monarch", "royalty",

  // Heads of State & Key Political Leaders (India & International)
  "modi", "narendramodi", "pmmodi", "pm_modi",
  "manmohansingh", "atalbiharivajpayee", "indiragandhi", "nehru", "jawaharlalnehru", "gandhi", "mahatmagandhi",
  "rahulgandhi", "amitshah", "rajnathsingh", "arvindkejriwal", "kejriwal", "yogi", "adityanath", "yogiadityanath",
  "trump", "donaldtrump", "biden", "joebiden", "obama", "barackobama",
  "putin", "vladimirputin", "zelensky", "volodymyrzelensky", "xijinping", "kimjongun",
  "rishisunak", "emmanuelmacron", "justintrudeau"
]);

// 3. REGULATORS / LAW ENFORCEMENT / COURTS
export const REGULATORY_AND_ENFORCEMENT_TERMS = new Set([
  "sebi", "rbi", "police", "cops", "fbi", "cia", "cbi", "ed", "interpol", "nsg", "raw",
  "sec", "irs", "finra", "judge", "magistrate", "supremecourt", "highcourt", "judiciary"
]);

// 4. PLATFORM RESERVED & SYSTEM NAMES
export const SYSTEM_RESERVED_TERMS = new Set([
  "admin", "administrator", "moderator", "mod", "support", "system", "root",
  "staff", "ceo", "founder", "owner", "official", "help", "security", "billing",
  "verified", "tradifive", "tradifiveofficial", "tradifiveteam", "tradifivesupport",
  "tradifiveadmin", "fialgo", "bot", "algo_official", "null", "undefined"
]);

// 5. HIGH-PRIORITY RESTRICTED SUBSTRINGS (Blocked anywhere inside a handle)
const HIGH_PRIORITY_SUBSTRINGS = [
  "primeminister",
  "prime_minister",
  "narendramodi",
  "pmmodi",
  "pm_modi",
  "rashtrapati",
  "chiefminister",
  "chief_minister",
  "bhagwan",
  "bholenath",
  "mahadev",
  "bajrangbali",
  "prophetmuhammad",
  "tradifive",
  "fialgo",
  "administrator",
  "moderator"
];

// Combine all sets for lookup
export const ALL_RESTRICTED_USERNAMES = new Set([
  ...RELIGIOUS_TERMS,
  ...POLITICAL_AND_LEADERSHIP_TERMS,
  ...REGULATORY_AND_ENFORCEMENT_TERMS,
  ...SYSTEM_RESERVED_TERMS
]);

export interface UsernameValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateUsername = (username: string): UsernameValidationResult => {
  if (!username || !username.trim()) {
    return { isValid: false, message: "Username cannot be empty." };
  }

  const clean = username.trim().toLowerCase();

  // Length limits
  if (clean.length < 3) {
    return { isValid: false, message: "Username must be at least 3 characters." };
  }
  if (clean.length > 24) {
    return { isValid: false, message: "Username cannot exceed 24 characters." };
  }

  // Allowed character set (alphanumeric, underscores, single periods)
  if (!/^[a-z0-9][a-z0-9._]*[a-z0-9]$/.test(clean)) {
    return {
      isValid: false,
      message: "Usernames can only contain letters, numbers, underscores, and periods, and cannot start or end with symbols."
    };
  }

  // 1. Check High-Priority Substrings anywhere in handle
  for (const sub of HIGH_PRIORITY_SUBSTRINGS) {
    if (clean.includes(sub)) {
      if (sub.includes("primeminister") || sub.includes("narendramodi") || sub.includes("pmmodi") || sub.includes("minister")) {
        return { isValid: false, message: "Handles referencing prime ministers, political leaders, or government offices are not permitted." };
      }
      if (sub.includes("mahadev") || sub.includes("bhagwan") || sub.includes("bajrangbali") || sub.includes("prophet")) {
        return { isValid: false, message: "Handles referencing religious deities, gods, or sacred figures are not permitted." };
      }
      return { isValid: false, message: "This username contains reserved platform terms and cannot be claimed." };
    }
  }

  // 2. Exact match in full restricted dictionary
  if (ALL_RESTRICTED_USERNAMES.has(clean)) {
    if (POLITICAL_AND_LEADERSHIP_TERMS.has(clean)) {
      return { isValid: false, message: "Handles referencing prime ministers, presidents, or political titles are not permitted." };
    }
    if (RELIGIOUS_TERMS.has(clean)) {
      return { isValid: false, message: "Handles referencing religious deities, gods, or holy figures are not permitted." };
    }
    if (REGULATORY_AND_ENFORCEMENT_TERMS.has(clean)) {
      return { isValid: false, message: "Handles referencing regulatory bodies or law enforcement are not permitted." };
    }
    return { isValid: false, message: "This username is reserved and cannot be claimed." };
  }

  // 3. Stripped match (removing numbers and separators: e.g. "god_123", "shiva-07", "modi.1")
  const stripped = clean.replace(/[0-9_.-]/g, '');
  if (stripped.length >= 3 && ALL_RESTRICTED_USERNAMES.has(stripped)) {
    if (POLITICAL_AND_LEADERSHIP_TERMS.has(stripped)) {
      return { isValid: false, message: "Handles referencing prime ministers, political leaders, or government titles are not permitted." };
    }
    if (RELIGIOUS_TERMS.has(stripped)) {
      return { isValid: false, message: "Handles referencing religious deities, gods, or holy figures are not permitted." };
    }
    return { isValid: false, message: "This username format is reserved and cannot be claimed." };
  }

  // 4. Token-based word boundary checks (e.g. "god_trader", "trader_god", "pm_office", "shiva_fx")
  const tokens = clean.split(/[0-9_.-]+/).filter(Boolean);
  for (const token of tokens) {
    if (ALL_RESTRICTED_USERNAMES.has(token)) {
      if (POLITICAL_AND_LEADERSHIP_TERMS.has(token)) {
        return { isValid: false, message: `The term '${token}' refers to a political figure or title and cannot be used in a handle.` };
      }
      if (RELIGIOUS_TERMS.has(token)) {
        return { isValid: false, message: `The term '${token}' refers to a religious deity or sacred figure and cannot be used in a handle.` };
      }
      if (SYSTEM_RESERVED_TERMS.has(token)) {
        return { isValid: false, message: `The term '${token}' is reserved for official platform operations.` };
      }
    }
  }

  // 5. Prefix & Suffix sensitive checks for prominent terms
  const prominentRootTerms = [
    "god", "shiva", "shiv", "krishna", "ram", "jesus", "allah", "buddha", "hanuman",
    "modi", "trump", "biden", "putin", "admin", "tradifive"
  ];
  for (const root of prominentRootTerms) {
    if (clean.startsWith(root) || clean.endsWith(root)) {
      // Check if it's not a common standard English dictionary word
      const benignExceptions = new Set(["ramen", "rambler", "rampart", "ramp"]);
      if (!benignExceptions.has(clean)) {
        return {
          isValid: false,
          message: `Usernames containing '${root}' are restricted under community guidelines.`
        };
      }
    }
  }

  return { isValid: true };
};
