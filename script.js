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
      .filter((tok) => tok.length > 0 && !STOPWORDS.has(tok));
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
     ------------------------------------------------------- */

  function buildResponse(userQuestion) {
    const trimmed = userQuestion.trim();

    if (trimmed.length === 0) {
      return null; // handled separately as input validation
    }

    // Very short / low-content questions ("hi", "ok", "?") are treated
    // as unresolved rather than forced into a guess.
    const meaningfulTokens = tokenize(trimmed);
    if (meaningfulTokens.length === 0) {
      return {
        resolved: false,
        text:
          "I need a little more detail to help with that. Could you rephrase your question, " +
          "for example by naming a topic such as leave, expenses, IT, or safety?",
        department: null,
        topic: null
      };
    }

    const { entry, score } = findBestMatch(trimmed);

    if (entry) {
      return {
        resolved: true,
        text: entry.answer,
        department: entry.department,
        topic: entry.topic
      };
    }

    // No confident match — never fabricate. Route to a department instead.
    const department = guessDepartment(trimmed);

    if (department) {
      return {
        resolved: false,
        text:
          `I don't have enough information in the current knowledge base to answer this accurately. ` +
          `Please contact the ${department} Department for assistance.`,
        department: department,
        topic: null
      };
    }

    return {
      resolved: false,
      text:
        "I don't have enough information in the current knowledge base to answer this accurately. " +
        "Please contact your line manager or the HR Department, who can direct you to the right team.",
      department: "HR",
      topic: null
    };
  }

  /* -------------------------------------------------------
     6. UI WIRING
     ------------------------------------------------------- */

  const chatWindow = document.getElementById("chatWindow");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const clearBtn = document.getElementById("clearBtn");
  const suggestionButtons = document.getElementById("suggestionButtons");

  const WELCOME_MESSAGE =
    "Hello. How can I assist you today? You can ask about leave, working hours, expenses, " +
    "IT support, attendance, workplace safety, or sustainability practices.";

  function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function appendUserMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg msg-user";

    const role = document.createElement("div");
    role.className = "msg-role";
    role.textContent = "You";

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = text;

    wrapper.appendChild(role);
    wrapper.appendChild(bubble);
    chatWindow.appendChild(wrapper);
    scrollToBottom();
  }

  function appendAssistantMessage(response) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg msg-assistant";

    const role = document.createElement("div");
    role.className = "msg-role";
    role.textContent = "Policy Assistant";

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

  function handleAsk(rawQuestion) {
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
    // Small delay reads more naturally as a response rather than an instant echo.
    window.setTimeout(function () {
      appendAssistantMessage(response);
    }, 220);

    chatInput.value = "";
    chatInput.focus();
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

  // Initial render.
  renderWelcomeMessage();
})();
