/* =========================================================
   Al Khaznah Tannery — Employee Policy Assistant
   Vanilla JS. No backend, no API, no build step.

   Sections:
   1. Knowledge base data
   2. Department routing keywords
   3. Text normalization + tokenization
   4. Matching / scoring engine
   5. Response builder
   6. UI wiring (chat window, input, suggestions, clear)
   ========================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------
     1. KNOWLEDGE BASE
     Each entry has:
       id           unique key
       department   HR | Finance | IT | Operations
       topic        short label shown in the UI
       keywords     terms/phrases used for matching (weighted list)
       answer       the fictional sample policy text
     ------------------------------------------------------- */

  const KNOWLEDGE_BASE = [
    // ---------------- HR ----------------
    {
      id: "hr-annual-leave",
      department: "HR",
      topic: "Annual Leave",
      keywords: [
        "annual leave", "vacation", "vacation days", "leave days", "days off",
        "how many leave", "holiday allowance", "pto", "time off", "yearly leave"
      ],
      answer:
        "Full-time employees accrue 22 working days of annual leave per calendar year, accrued monthly. " +
        "Leave requests should be submitted through the HR portal at least 5 working days in advance and " +
        "require manager approval. Unused leave of up to 5 days may be carried over into the following year."
    },
    {
      id: "hr-sick-leave",
      department: "HR",
      topic: "Sick Leave",
      keywords: [
        "sick leave", "sick day", "sick days", "medical leave", "unwell", "ill",
        "medical certificate", "calling in sick"
      ],
      answer:
        "Employees are entitled to up to 15 days of paid sick leave per year. A medical certificate is required " +
        "for absences of 2 consecutive days or more. Employees should notify their line manager before their " +
        "shift start time whenever possible."
    },
    {
      id: "hr-working-hours",
      department: "HR",
      topic: "Working Hours",
      keywords: [
        "working hours", "work hours", "shift timing", "shift hours", "office hours",
        "start time", "end time", "standard hours", "what time do i start"
      ],
      answer:
        "Standard working hours are Sunday to Thursday, 8:00 AM to 5:00 PM, with a one-hour lunch break. " +
        "Production floor staff follow shift schedules issued monthly by their department supervisor."
    },
    {
      id: "hr-attendance",
      department: "HR",
      topic: "Attendance",
      keywords: [
        "attendance", "clock in", "clock out", "late arrival", "punctuality",
        "attendance policy", "biometric", "time tracking"
      ],
      answer:
        "Employees must clock in and out using the biometric terminals at each site entrance. Three unexplained " +
        "late arrivals within a month will trigger an automatic notice from HR to the employee and their manager."
    },
    {
      id: "hr-employee-records",
      department: "HR",
      topic: "Employee Records",
      keywords: [
        "employee records", "update my details", "change address", "personal information",
        "update phone number", "hr file", "employment file"
      ],
      answer:
        "Employees can update personal details such as address, phone number, and emergency contacts through the " +
        "HR self-service portal. Changes to bank account details require submission of a signed request form to HR."
    },
    {
      id: "hr-remote-work",
      department: "HR",
      topic: "Remote Work",
      keywords: [
        "remote work", "work from home", "wfh", "hybrid", "telework",
        "work remotely", "home office"
      ],
      answer:
        "Remote work is available only to eligible office-based roles and must be pre-approved by a direct manager. " +
        "Production, warehouse, and site-based roles are not eligible for remote work due to operational requirements."
    },

    // ---------------- FINANCE ----------------
    {
      id: "fin-expense-claims",
      department: "Finance",
      topic: "Expense Claims",
      keywords: [
        "expense claim", "expense claims", "submit an expense", "reimbursement",
        "claim expenses", "expense form", "how do i get reimbursed"
      ],
      answer:
        "Expense claims are submitted through the Finance portal with itemized receipts attached. Claims under " +
        "AED 500 are typically processed within 5 working days. Claims must be submitted within 30 days of the expense."
    },
    {
      id: "fin-expense-deadline",
      department: "Finance",
      topic: "Expense Submission Deadline",
      keywords: [
        "expense deadline", "when to submit expenses", "submission deadline",
        "expense cutoff", "expense submission date"
      ],
      answer:
        "All expense claims for a given month must be submitted no later than the 5th working day of the following " +
        "month to be included in that month's reimbursement cycle. Late submissions roll over to the next cycle."
    },
    {
      id: "fin-business-meals",
      department: "Finance",
      topic: "Business Meals",
      keywords: [
        "business meals", "client dinner", "meal allowance", "food expense",
        "entertainment expense", "client lunch"
      ],
      answer:
        "Business meals with clients or partners are reimbursable up to AED 150 per person, subject to prior " +
        "manager approval and an itemized receipt. Alcohol is not covered under this policy."
    },

    // ---------------- IT ----------------
    {
      id: "it-password-reset",
      department: "IT",
      topic: "Password Reset",
      keywords: [
        "password reset", "forgot my password", "reset password", "locked out",
        "can't log in", "cannot log in", "forgot password"
      ],
      answer:
        "Passwords can be reset from the login screen using the \"Forgot Password\" link, which sends a reset code " +
        "to your registered company email. If you no longer have access to your email, contact the IT Help Desk directly."
    },
    {
      id: "it-email-access",
      department: "IT",
      topic: "Email / Outlook Access",
      keywords: [
        "email access", "outlook", "can't access email", "email not working",
        "email issue", "outlook not opening", "mailbox"
      ],
      answer:
        "Outlook access issues are usually resolved by a mailbox re-sync, which IT can trigger remotely. Submit an " +
        "IT ticket with your username and a screenshot of any error message for the fastest response."
    },
    {
      id: "it-laptop-support",
      department: "IT",
      topic: "Laptop / Computer Support",
      keywords: [
        "laptop", "computer not working", "laptop issue", "laptop broken",
        "computer support", "device not working", "screen not working", "my laptop isn't working"
      ],
      answer:
        "For hardware issues, log a ticket through the IT Help Desk with a description of the problem. A loaner " +
        "device can be issued within 1 business day while your equipment is being repaired."
    },
    {
      id: "it-network-wifi",
      department: "IT",
      topic: "Network / Wi-Fi Support",
      keywords: [
        "wifi", "wi-fi", "network issue", "can't connect to wifi", "internet not working",
        "connection problem", "network down"
      ],
      answer:
        "If you cannot connect to the office Wi-Fi, first try forgetting and rejoining the \"AKT-Staff\" network. " +
        "If the issue continues across multiple devices, it is likely a site-wide outage — check the IT status " +
        "board or submit a ticket for updates."
    },

    // ---------------- OPERATIONS ----------------
    {
      id: "ops-ppe-safety",
      department: "Operations",
      topic: "PPE and Workplace Safety",
      keywords: [
        "ppe", "personal protective equipment", "safety gear", "gloves", "safety goggles",
        "protective equipment", "safety policy", "do i need ppe", "chemical safety",
        "tannery floor", "tanning drum"
      ],
      answer:
        "PPE, including chemical-resistant gloves, safety goggles, and closed-toe footwear, is mandatory in all " +
        "tanning, dyeing, and finishing areas at all times. Staff working near tanning drums or the wastewater " +
        "treatment plant require additional respiratory protection. Supervisors conduct spot checks, and PPE is " +
        "issued free of charge through the site stores."
    },
    {
      id: "ops-incident-reporting",
      department: "Operations",
      topic: "Incident Reporting",
      keywords: [
        "report an accident", "incident reporting", "workplace accident", "injury report",
        "report injury", "safety incident", "near miss", "chemical spill"
      ],
      answer:
        "Workplace incidents, including near misses and chemical spills, must be reported to the on-site " +
        "Operations Supervisor immediately and logged in the Incident Report system within 24 hours. Medical " +
        "attention should always be sought first."
    },
    {
      id: "ops-production-access",
      department: "Operations",
      topic: "Production Area Access",
      keywords: [
        "production area access", "restricted area", "enter production floor",
        "access badge", "who can enter production", "tannery access"
      ],
      answer:
        "Access to the tannery floor, dyeing, and finishing areas requires a valid site access badge and " +
        "completion of the site safety induction. Visitors and non-production staff must be accompanied by an " +
        "authorized escort at all times."
    },
    {
      id: "ops-sustainability",
      department: "Operations",
      topic: "Sustainability Practices",
      keywords: [
        "sustainability", "solar power", "water recycling", "recycled water",
        "eco friendly", "environmental practices", "chrome free tanning", "camel leather"
      ],
      answer:
        "Al Khaznah Leathers operates a solar-powered production line and an on-site water treatment plant that " +
        "recycles process water for irrigation and reuse. Employees working in tanning and finishing follow " +
        "chrome-free handling procedures as part of the site's Leather Working Group certification requirements. " +
        "For department-specific sustainability guidelines, contact your Operations Supervisor."
    }
  ];

  /* -------------------------------------------------------
     2. DEPARTMENT ROUTING KEYWORDS
     Used as a fallback when no specific KB answer matches
     confidently, so the assistant can still point the
     employee to the right department instead of guessing.
     ------------------------------------------------------- */

  const DEPARTMENT_ROUTES = [
    {
      department: "HR",
      keywords: [
        "leave", "attendance", "working hours", "employee record", "employment",
        "salary", "payroll", "contract", "probation", "resignation", "promotion",
        "hr", "vacation", "sick"
      ]
    },
    {
      department: "Finance",
      keywords: [
        "expense", "reimburse", "payment", "invoice", "salary", "payroll",
        "allowance", "budget", "finance", "travel allowance", "claim", "tax"
      ]
    },
    {
      department: "IT",
      keywords: [
        "password", "email", "outlook", "laptop", "computer", "wifi", "wi-fi",
        "network", "login", "access", "software", "printer", "it", "system", "app"
      ]
    },
    {
      department: "Operations",
      keywords: [
        "ppe", "safety", "production", "incident", "accident", "warehouse",
        "machine", "equipment", "site", "operations", "hazard"
      ]
    }
  ];

  // Descriptive metadata for the "Departments" view — a quick reference
  // card per department, independent of the matching engine above.
  const DEPARTMENT_INFO = [
    {
      department: "HR",
      description:
        "Handles leave, attendance, working hours, employee records, and general employment questions.",
      topics: ["Annual Leave", "Sick Leave", "Working Hours", "Attendance", "Employee Records", "Remote Work"]
    },
    {
      department: "Finance",
      description:
        "Handles expense claims, reimbursements, and business spending questions.",
      topics: ["Expense Claims", "Submission Deadlines", "Business Meals"]
    },
    {
      department: "IT",
      description:
        "Handles account access, hardware issues, and connectivity problems.",
      topics: ["Password Reset", "Email / Outlook", "Laptop Support", "Wi-Fi & Network"]
    },
    {
      department: "Operations",
      description:
        "Handles workplace safety, site access, incident reporting, and production floor procedures.",
      topics: ["PPE & Safety", "Incident Reporting", "Site Access", "Sustainability"]
    }
  ];

  /* -------------------------------------------------------
     3. TEXT NORMALIZATION + TOKENIZATION
     ------------------------------------------------------- */

  const STOPWORDS = new Set([
    "a", "an", "the", "is", "are", "was", "were", "do", "does", "did",
    "i", "my", "me", "you", "your", "we", "our", "it", "its", "to", "of",
    "for", "in", "on", "at", "and", "or", "how", "what", "when", "where",
    "can", "could", "should", "would", "please", "about", "get", "have",
    "has", "will", "am", "be", "with", "this", "that", "there", "if"
  ]);

  function normalize(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9'\-\s]/g, " ") // strip punctuation, keep letters/numbers
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(text) {
    return normalize(text)
      .split(" ")
      .filter((tok) => tok.length > 0 && !STOPWORDS.has(tok))
      .map(stem);
  }

  // Lightweight plural stemming so "expenses" matches a keyword written as
  // "expense", "policies" matches "policy", and so on — without a full
  // stemming library. Deliberately conservative: it leaves words like
  // "status", "access", "process", and "basis" untouched so it doesn't
  // mangle words that only happen to end in "s".
  function stem(word) {
    if (word.length <= 3) return word;
    if (word.endsWith("ies")) return word.slice(0, -3) + "y";
    if (word.endsWith("ss") || word.endsWith("us") || word.endsWith("is")) return word;
    if (word.endsWith("s")) return word.slice(0, -1);
    return word;
  }

  /* -------------------------------------------------------
     4. MATCHING / SCORING ENGINE

     Approach: for each KB entry, score every keyword phrase
     against the user's question. A keyword phrase scores by:
       - full-phrase substring match (strong signal), or
       - proportion of the phrase's tokens found in the
         question's tokens (partial signal)
     The entry's score is the best keyword score it produced.
     The highest-scoring entry above CONFIDENCE_THRESHOLD wins.
     ------------------------------------------------------- */

  // A keyword either matches or it doesn't — no fractional "almost matched"
  // credit. This keeps the assistant from confidently answering with the
  // wrong policy just because one common word overlapped.
  const CONFIDENCE_THRESHOLD = 1;

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function containsWholePhrase(haystack, phrase) {
    // Word-boundary match so short keywords (e.g. "pto") never match
    // as a substring of an unrelated word (e.g. "laptop").
    const pattern = new RegExp("(^|\\s)" + escapeRegExp(phrase) + "($|\\s)");
    return pattern.test(haystack);
  }

  function scoreKeywordAgainstQuestion(keyword, normalizedQuestion, questionTokens) {
    const normalizedKeyword = normalize(keyword);

    // Strong signal: the keyword phrase appears directly in the question
    // as whole word(s), not merely as a substring of another word.
    if (normalizedKeyword.length > 2 && containsWholePhrase(normalizedQuestion, normalizedKeyword)) {
      return 1;
    }

    // Otherwise, the keyword only counts as a match if every one of its
    // meaningful (non-stopword) words shows up somewhere in the question.
    // This lets word order and phrasing vary ("vacation days" vs
    // "days of vacation") without letting a single shared common word
    // (e.g. "personal") drag in an unrelated policy.
    const keywordContentTokens = tokenize(keyword);
    if (keywordContentTokens.length === 0) return 0;

    const questionTokenSet = new Set(questionTokens);
    const allPresent = keywordContentTokens.every((kt) => questionTokenSet.has(kt));

    return allPresent ? 1 : 0;
  }

  function findBestMatch(userQuestion) {
    const normalizedQuestion = normalize(userQuestion);
    const questionTokens = tokenize(userQuestion);

    let best = { entry: null, score: 0 };

    KNOWLEDGE_BASE.forEach((entry) => {
      let entryScore = 0;
      entry.keywords.forEach((keyword) => {
        const score = scoreKeywordAgainstQuestion(keyword, normalizedQuestion, questionTokens);
        if (score > entryScore) entryScore = score;
      });

      if (entryScore > best.score) {
        best = { entry, score: entryScore };
      }
    });

    if (best.entry && best.score >= CONFIDENCE_THRESHOLD) {
      return best;
    }
    return { entry: null, score: best.score };
  }

  function guessDepartment(userQuestion) {
    const normalizedQuestion = normalize(userQuestion);
    const questionTokens = new Set(tokenize(userQuestion));

    let best = { department: null, score: 0 };

    DEPARTMENT_ROUTES.forEach((route) => {
      let routeScore = 0;
      route.keywords.forEach((keyword) => {
        const normalizedKeyword = normalize(keyword);
        if (normalizedKeyword.includes(" ")) {
          if (containsWholePhrase(normalizedQuestion, normalizedKeyword)) routeScore += 1;
        } else if (questionTokens.has(normalizedKeyword)) {
          routeScore += 1;
        }
      });

      if (routeScore > best.score) {
        best = { department: route.department, score: routeScore };
      }
    });

    return best.department; // may be null if nothing matches at all
  }

  /* -------------------------------------------------------
     5. RESPONSE BUILDER

     Priority order for a submitted question:
       1. Empty input                      -> validation (handled in UI layer)
       2. Small talk (hi, thanks, bye...)   -> warm human reply, no lookup
       3. Symbols/numbers only, no letters  -> gentle "that's not quite a question" nudge
       4. Vague / no real topic yet         -> invite them to continue, not a scope refusal
       5. Confident knowledge-base match    -> the actual policy answer
       6. Recognizable topic, no exact hit  -> route to the right department
       7. Gibberish (no real words at all)  -> friendly "couldn't make that out" nudge
       8. Real words, but off-topic         -> friendly "that's outside my scope" nudge
     Steps 2, 3, 4, 7, and 8 never fabricate an answer and never pretend a
     department can help when the question isn't actually about policy.
     ------------------------------------------------------- */

  function pickVariant(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // Words that only signal "I'm about to ask something" rather than naming
  // an actual topic — e.g. "I have a question", "can you help me". If every
  // meaningful word in the input is one of these, the person just hasn't
  // gotten to their real question yet, so we invite them to continue
  // instead of telling them we can't help.
  const VAGUE_META_WORDS = new Set([
    "question", "questions", "query", "queries", "ask", "asking", "asked",
    "doubt", "doubts", "concern", "concerns", "help", "assist", "assistance",
    "info", "information", "something", "anything", "thing", "issue", "issues",
    "need", "needs", "needed", "want", "wants", "wanted", "got", "talk",
    "speak", "chat", "quick"
  ]);

  // A modest vocabulary of "real, recognizable words" built from every
  // keyword in the knowledge base plus everyday conversational words.
  // Used only to tell apart "a real sentence I just don't cover" from
  // "keyboard mashing" — it doesn't need to be exhaustive to do that job.
  const EVERYDAY_WORDS = [
    "hi", "hello", "hey", "morning", "afternoon", "evening", "thanks", "thank",
    "please", "help", "question", "ask", "asking", "policy", "policies",
    "company", "staff", "employee", "employees", "work", "working", "office",
    "need", "want", "tell", "know", "information", "info", "contact", "today",
    "tomorrow", "sorry", "yes", "no", "ok", "okay", "bye", "goodbye", "team",
    "manager", "supervisor", "department", "site", "tannery", "leather",
    "joke", "weather", "name", "who", "why", "explain", "understand", "sure",
    "good", "great", "fine", "sorry", "issue", "problem", "help me"
  ];

  const KNOWLEDGE_VOCABULARY = (function buildVocabulary() {
    const vocab = new Set();
    KNOWLEDGE_BASE.forEach((entry) => {
      entry.keywords.forEach((kw) => {
        tokenize(kw).forEach((tok) => vocab.add(tok));
      });
    });
    DEPARTMENT_ROUTES.forEach((route) => {
      route.keywords.forEach((kw) => {
        tokenize(kw).forEach((tok) => vocab.add(tok));
      });
    });
    EVERYDAY_WORDS.forEach((w) => {
      tokenize(w).forEach((tok) => vocab.add(tok));
      if (w.indexOf(" ") === -1) vocab.add(w);
    });
    return vocab;
  })();

  const SMALL_TALK = new Set([
    "hi", "hello", "hey", "hiya", "yo", "good morning", "good afternoon",
    "good evening", "thanks", "thank you", "cheers", "ok", "okay", "bye",
    "goodbye", "see you", "test", "testing"
  ]);

  function isSmallTalk(normalizedQuestion) {
    return SMALL_TALK.has(normalizedQuestion);
  }

  function buildResponse(userQuestion) {
    const trimmed = userQuestion.trim();

    if (trimmed.length === 0) {
      return null; // handled separately as input validation
    }

    const normalizedQuestion = normalize(trimmed);

    // 2. Small talk — greet back like a person would, not a script.
    if (isSmallTalk(normalizedQuestion)) {
      const greeting = pickVariant([
        "Hello! What can I help you with today — leave, expenses, IT, or something else?",
        "Hi there. Happy to help — what would you like to know?",
        "Hey! Ask me anything about leave, expenses, IT support, or workplace policies."
      ]);
      return { resolved: true, text: greeting, department: null, topic: null };
    }

    // 3. No letters at all — just digits, symbols, or stray keys.
    if (!/[a-z]/i.test(trimmed)) {
      const text = pickVariant([
        "That looks like it might have been a stray key press rather than a question — mind giving it another go? " +
          "You can ask me things like \"how many leave days do I get\" or \"how do I reset my password.\"",
        "I'm not seeing an actual question in there, just numbers or symbols. Try typing it out, for example: " +
          "\"what are the working hours\" or \"how do I submit an expense claim.\"",
        "Hmm, that didn't come through as a question I can work with. Feel free to type it in plain words — " +
          "something like \"do I need PPE in the production area\" works well."
      ]);
      return { resolved: false, text, department: null, topic: null };
    }

    const meaningfulTokens = tokenize(trimmed);
    if (meaningfulTokens.length === 0) {
      const text = pickVariant([
        "Could you say a little more? Try naming a topic, like leave, expenses, IT, or safety.",
        "I need a bit more to go on — what's the topic? For example, leave, working hours, or IT support."
      ]);
      return { resolved: false, text, department: null, topic: null };
    }

    // 4. Vague "I have a question" / "can you help me" style input — the
    // person hasn't named a topic yet, so invite them to continue rather
    // than telling them we can't help.
    const nonMetaTokens = meaningfulTokens.filter((tok) => !VAGUE_META_WORDS.has(tok));
    if (nonMetaTokens.length === 0) {
      const text = pickVariant([
        "Of course — go ahead. What would you like to know? I can help with leave, expenses, IT support, attendance, or workplace safety.",
        "Sure, happy to help. What's on your mind? Try asking about leave, expense claims, IT support, or safety procedures.",
        "I'm listening — what would you like to ask? I cover things like leave, working hours, expenses, and IT support."
      ]);
      return { resolved: true, text, department: null, topic: null };
    }

    // 5. Confident knowledge-base match.
    const { entry } = findBestMatch(trimmed);

    if (entry) {
      return {
        resolved: true,
        text: entry.answer,
        department: entry.department,
        topic: entry.topic
      };
    }

    // 6. No exact policy match, but the question clearly touches a
    // department's territory (e.g. mentions "salary" or "travel allowance").
    const department = guessDepartment(trimmed);

    if (department) {
      const text = pickVariant([
        `I don't have a specific answer for that in the current knowledge base, but this sounds like something for the ${department} Department — worth reaching out to them directly.`,
        `That's not covered in what I have on file. The ${department} Department would be the right team to ask.`,
        `I can't confirm that from the knowledge base I have, so I'd point you to the ${department} Department for an accurate answer.`
      ]);
      return { resolved: false, text, department, topic: null };
    }

    // 7 / 8. Nothing matched. Work out whether this reads like real
    // language (just outside scope) or genuine gibberish, and reply
    // in a tone that matches which one it is.
    const recognizedCount = meaningfulTokens.filter((tok) => KNOWLEDGE_VOCABULARY.has(tok)).length;
    const looksLikeGibberish = recognizedCount === 0;

    if (looksLikeGibberish) {
      const text = pickVariant([
        "I couldn't quite make sense of that one — could you rephrase it? I'm best with questions about leave, " +
          "expenses, IT support, attendance, or workplace safety.",
        "Hmm, that one lost me. Try rewording it — something like \"what's the sick leave policy\" or " +
          "\"how do I connect to Wi-Fi\" is the kind of thing I can help with.",
        "Not sure I followed that. Could you try asking again in plain words? I cover leave, expenses, IT, and " +
          "workplace safety topics."
      ]);
      return { resolved: false, text, department: null, topic: null };
    }

    const text = pickVariant([
      "That's a bit outside what I'm set up to help with here — I'm focused on company policies. Try asking " +
        "about leave, expenses, IT support, or workplace safety.",
      "I'm built specifically for policy questions, so that one's outside my lane. Ask me about things like " +
        "annual leave, expense claims, or IT support instead.",
      "That's not something I can help with through this tool — I only cover company policy topics. Try leave, " +
        "attendance, expenses, or IT."
    ]);
    return { resolved: false, text, department: null, topic: null };
  }

  /* -------------------------------------------------------
     6. UI WIRING
     ------------------------------------------------------- */

  const chatWindow = document.getElementById("chatWindow");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const clearBtn = document.getElementById("clearBtn");
  const suggestionButtons = document.getElementById("suggestionButtons");

  const WELCOME_MESSAGE =
    "Hello. How can I assist you today? You can ask about leave, working hours, expenses, " +
    "IT support, attendance, workplace safety, or sustainability practices.";

  function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function appendUserMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg msg-user";

    const role = document.createElement("div");
    role.className = "msg-role";
    role.textContent = "You · " + formatTime(new Date());

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = text;

    wrapper.appendChild(role);
    wrapper.appendChild(bubble);
    chatWindow.appendChild(wrapper);
    scrollToBottom();
  }

  function appendTypingIndicator() {
    const wrapper = document.createElement("div");
    wrapper.className = "msg msg-assistant";
    wrapper.id = "typingIndicator";

    const role = document.createElement("div");
    role.className = "msg-role";
    role.textContent = "Policy Assistant";

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble typing-bubble";
    bubble.innerHTML =
      '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

    wrapper.appendChild(role);
    wrapper.appendChild(bubble);
    chatWindow.appendChild(wrapper);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
  }

  function appendAssistantMessage(response) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg msg-assistant";

    const role = document.createElement("div");
    role.className = "msg-role";
    role.textContent = "Policy Assistant · " + formatTime(new Date());

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = response.text;

    wrapper.appendChild(role);
    wrapper.appendChild(bubble);

    // Metadata line: department / topic or unresolved status.
    if (response.department || response.topic) {
      const meta = document.createElement("div");
      meta.className = "msg-meta" + (response.resolved ? "" : " meta-unresolved");

      if (response.department) {
        const deptSpan = document.createElement("span");
        deptSpan.innerHTML =
          '<span class="meta-label">Department: </span><span class="meta-value">' +
          escapeHtml(response.department) +
          "</span>";
        meta.appendChild(deptSpan);
      }

      if (response.resolved && response.topic) {
        const topicSpan = document.createElement("span");
        topicSpan.innerHTML =
          '<span class="meta-label">Topic: </span><span class="meta-value">' +
          escapeHtml(response.topic) +
          "</span>";
        meta.appendChild(topicSpan);
      }

      if (!response.resolved) {
        const statusSpan = document.createElement("span");
        statusSpan.innerHTML =
          '<span class="meta-label">Status: </span><span class="meta-value">Not available in knowledge base</span>';
        meta.appendChild(statusSpan);
      }

      bubble.appendChild(meta);
    }

    chatWindow.appendChild(wrapper);
    scrollToBottom();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderWelcomeMessage() {
    chatWindow.innerHTML = "";
    appendAssistantMessage({
      resolved: true,
      text: WELCOME_MESSAGE,
      department: null,
      topic: null
    });
  }

  function setInputBusy(isBusy) {
    chatInput.disabled = isBusy;
    sendBtn.disabled = isBusy;
    suggestionButtons.querySelectorAll(".chip").forEach((chip) => {
      chip.disabled = isBusy;
    });
  }

  let isBusy = false;

  function handleAsk(rawQuestion) {
    if (isBusy) return;
    const question = rawQuestion.replace(/\s+/g, " ").trim();

    if (question.length === 0) {
      chatInput.classList.add("input-error");
      chatInput.setAttribute("placeholder", "Please type a question before sending.");
      chatInput.focus();
      return;
    }

    chatInput.classList.remove("input-error");
    appendUserMessage(question);

    const response = buildResponse(question);
    chatInput.value = "";
    isBusy = true;
    setInputBusy(true);
    appendTypingIndicator();

    // Small delay reads more naturally as a considered response rather
    // than an instant, robotic echo.
    window.setTimeout(function () {
      removeTypingIndicator();
      appendAssistantMessage(response);
      isBusy = false;
      setInputBusy(false);
      chatInput.focus();
    }, 500 + Math.random() * 400);
  }

  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleAsk(chatInput.value);
  });

  chatInput.addEventListener("input", function () {
    chatInput.classList.remove("input-error");
  });

  clearBtn.addEventListener("click", function () {
    renderWelcomeMessage();
    chatInput.value = "";
    chatInput.focus();
  });

  suggestionButtons.addEventListener("click", function (event) {
    const target = event.target.closest(".chip");
    if (!target) return;
    const question = target.getAttribute("data-question");
    if (question) {
      handleAsk(question);
    }
  });

  /* -------------------------------------------------------
     View switching (Assistant / Policy Directory / Departments)
     ------------------------------------------------------- */

  const viewTabs = document.querySelectorAll(".view-tab");
  const viewPanels = document.querySelectorAll(".view");

  function switchView(viewName) {
    viewTabs.forEach((tab) => {
      const isActive = tab.getAttribute("data-view") === viewName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    viewPanels.forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.getAttribute("data-view-panel") !== viewName);
    });
  }

  viewTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      switchView(tab.getAttribute("data-view"));
    });
  });

  /* -------------------------------------------------------
     Policy Directory (browse / search all policies)
     ------------------------------------------------------- */

  const directoryGroups = document.getElementById("directoryGroups");
  const directorySearch = document.getElementById("directorySearch");
  const directoryEmpty = document.getElementById("directoryEmpty");
  const directoryCount = document.getElementById("directoryCount");

  const DEPARTMENT_ORDER = ["HR", "Finance", "IT", "Operations"];

  function renderDirectory(filterText) {
    const query = normalize(filterText || "");
    directoryGroups.innerHTML = "";

    let totalShown = 0;

    DEPARTMENT_ORDER.forEach((dept) => {
      const entries = KNOWLEDGE_BASE.filter((entry) => {
        if (entry.department !== dept) return false;
        if (!query) return true;
        const haystack = normalize(entry.topic + " " + entry.answer + " " + entry.keywords.join(" "));
        return haystack.includes(query);
      });

      if (entries.length === 0) return;

      totalShown += entries.length;

      const groupWrap = document.createElement("div");
      groupWrap.className = "directory-group";

      const groupTitle = document.createElement("h3");
      groupTitle.className = "directory-group-title";
      groupTitle.textContent = dept + " (" + entries.length + ")";
      groupWrap.appendChild(groupTitle);

      entries.forEach((entry) => {
        const card = document.createElement("div");
        card.className = "policy-card";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "policy-card-toggle";
        toggle.innerHTML =
          "<span>" + escapeHtml(entry.topic) + "</span>" +
          '<span class="policy-card-chevron" aria-hidden="true">&#9656;</span>';

        const body = document.createElement("div");
        body.className = "policy-card-body is-hidden";
        body.textContent = entry.answer;

        toggle.addEventListener("click", function () {
          const isOpen = card.classList.toggle("is-open");
          body.classList.toggle("is-hidden", !isOpen);
        });

        card.appendChild(toggle);
        card.appendChild(body);
        groupWrap.appendChild(card);
      });

      directoryGroups.appendChild(groupWrap);
    });

    directoryEmpty.classList.toggle("is-hidden", totalShown > 0);
    directoryCount.textContent = query
      ? totalShown + " polic" + (totalShown === 1 ? "y" : "ies") + " match \"" + filterText.trim() + "\""
      : "Browse every sample policy on file, grouped by department (" + KNOWLEDGE_BASE.length + " total).";
  }

  directorySearch.addEventListener("input", function () {
    renderDirectory(directorySearch.value);
  });

  renderDirectory("");

  /* -------------------------------------------------------
     Departments quick-reference grid
     ------------------------------------------------------- */

  const departmentGrid = document.getElementById("departmentGrid");

  function renderDepartments() {
    departmentGrid.innerHTML = "";

    DEPARTMENT_INFO.forEach((dept) => {
      const card = document.createElement("div");
      card.className = "department-card";

      const title = document.createElement("h3");
      title.className = "department-card-title";
      title.textContent = dept.department;

      const desc = document.createElement("p");
      desc.className = "department-card-desc";
      desc.textContent = dept.description;

      const topicList = document.createElement("ul");
      topicList.className = "department-card-topics";
      dept.topics.forEach((topic) => {
        const li = document.createElement("li");
        li.textContent = topic;
        topicList.appendChild(li);
      });

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(topicList);
      departmentGrid.appendChild(card);
    });
  }

  renderDepartments();

  const headerStats = document.getElementById("headerStats");
  if (headerStats) {
    headerStats.textContent =
      KNOWLEDGE_BASE.length + " sample policies on file · " + DEPARTMENT_ORDER.length + " departments · Available 24/7";
  }

  // Initial render.
  renderWelcomeMessage();
})();
