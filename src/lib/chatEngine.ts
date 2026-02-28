import { collegeKnowledge, KnowledgeEntry } from "@/data/collegeKnowledge";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Basic stemming: reduce common suffixes to root form
function stem(word: string): string {
  if (word.length < 4) return word;
  return word
    .replace(/ies$/, "y")
    .replace(/tion$/, "t")
    .replace(/sion$/, "s")
    .replace(/ment$/, "")
    .replace(/ness$/, "")
    .replace(/ated$/, "ate")
    .replace(/ting$/, "t")
    .replace(/ing$/, "")
    .replace(/ed$/, "")
    .replace(/ly$/, "")
    .replace(/er$/, "")
    .replace(/es$/, "")
    .replace(/s$/, "");
}

// Common filler words that should not drive matching
const STOP_WORDS = new Set([
  "what", "is", "the", "of", "in", "at", "for", "a", "an", "and", "or", "to",
  "how", "can", "do", "does", "which", "where", "when", "who", "whom", "why",
  "tell", "me", "about", "please", "give", "get", "its", "are", "was", "were",
  "has", "have", "had", "will", "would", "could", "should", "may", "might",
  "this", "that", "these", "those", "my", "your", "our", "their", "i", "we",
  "you", "he", "she", "it", "they", "be", "been", "being", "with", "from",
  "on", "up", "out", "so", "if", "then", "than", "but", "not", "no", "any",
  "all", "some", "know", "want", "need", "like", "also", "very", "just",
  "college", "bsiotr", "jspm", "sir", "madam",
]);

function getContentWords(text: string): string[] {
  return normalize(text).split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function getStemmedWords(text: string): string[] {
  return getContentWords(text).map(stem);
}

function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  // Stem comparison
  const sa = stem(a), sb = stem(b);
  if (sa === sb) return true;
  if (sa.includes(sb) || sb.includes(sa)) return true;
  return false;
}

function scoreEntry(query: string, entry: KnowledgeEntry): number {
  const normalizedQuery = normalize(query);
  const queryContentWords = getContentWords(query);
  let score = 0;

  // 1. EXACT full-phrase match (highest priority)
  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (normalizedQuery === normalizedKeyword) {
      score += 100;
    } else if (normalizedQuery.includes(normalizedKeyword) && normalizedKeyword.split(" ").length >= 2) {
      score += 20 + normalizedKeyword.split(" ").length * 5;
    } else if (normalizedKeyword.includes(normalizedQuery) && normalizedQuery.split(" ").length >= 2) {
      score += 15 + normalizedQuery.split(" ").length * 4;
    }
  }

  // 2. Content-word overlap with stemming
  for (const keyword of entry.keywords) {
    const keywordContentWords = getContentWords(keyword);
    if (keywordContentWords.length === 0) continue;

    let matchedWords = 0;
    for (const kw of keywordContentWords) {
      if (queryContentWords.some(qw => wordsMatch(qw, kw))) {
        matchedWords++;
      }
    }

    if (matchedWords > 0) {
      const ratio = matchedWords / keywordContentWords.length;
      score += Math.round(ratio * 15 * matchedWords);
    }
  }

  // 3. Penalize if query has many content words but entry only matches a few
  if (queryContentWords.length > 0) {
    let bestKeywordMatchRatio = 0;
    for (const keyword of entry.keywords) {
      const keywordContentWords = getContentWords(keyword);
      if (keywordContentWords.length === 0) continue;
      let matched = 0;
      for (const qw of queryContentWords) {
        if (keywordContentWords.some(kw => wordsMatch(qw, kw))) {
          matched++;
        }
      }
      const queryMatchRatio = matched / queryContentWords.length;
      bestKeywordMatchRatio = Math.max(bestKeywordMatchRatio, queryMatchRatio);
    }
    if (bestKeywordMatchRatio < 0.3 && score < 50) {
      score = Math.floor(score * 0.2);
    }
  }

  return score;
}

// Faculty name directory for direct lookups
const facultyDirectory: Record<string, string> = {
  "nagraj": "🎓 **Dr. T. K. Nagraj** is the **Principal** of JSPM's BSIOTR.\n\nHe is the head of the entire institute, responsible for all administration, academics, and institute-level development.\n\n*The HOD of IT is Dr. V. S. Wadne — a different person.*",
  "t k nagraj": "🎓 **Dr. T. K. Nagraj** is the **Principal** of JSPM's BSIOTR.\n\nHe is the head of the entire institute, responsible for all administration, academics, and institute-level development.",
  "vinod wadne": "👨‍💼 **Dr. V. S. Wadne (Vinod Wadne)**\n\n**Role:** Head of Department (HOD) — Information Technology\n**Department:** IT Department, BSIOTR\n**Subject:** Computer Networks and Security (CNS)\n\nDr. Wadne manages all academic and administrative activities of the IT department including faculty management, academic planning, student monitoring, and placement coordination.\n\n⚠️ *Dr. Wadne is the HOD of IT — NOT the Principal. The Principal is Dr. T. K. Nagraj.*",
  "v s wadne": "👨‍💼 **Dr. V. S. Wadne**\n\n**Role:** HOD — Information Technology Department\n**Subject:** Computer Networks and Security (CNS)\n\nDr. Wadne is the Head of Department (HOD) of IT at BSIOTR. He is NOT the Principal.",
  "wadne": "👨‍💼 **Dr. V. S. Wadne**\n\n**Role:** HOD — Information Technology Department\n**Subject:** Computer Networks and Security (CNS)\n\nDr. Wadne is the Head of Department (HOD) of IT at BSIOTR. He is NOT the Principal — the Principal is Dr. T. K. Nagraj.",
  "yogesh angal": "👨‍💼 **Dr. Yogesh S. Angal**\n\n**Role:** HOD — Electronics & Telecommunication Engineering (E&TC)\n**Additional Role:** Dean of R&D, BSIOTR\n**Achievement:** Elected as BoS Member of SPPU",
  "angal": "👨‍💼 **Dr. Yogesh S. Angal**\n\n**Role:** HOD — Electronics & Telecommunication Engineering (E&TC)\n**Additional Role:** Dean of R&D, BSIOTR\n**Achievement:** Elected as BoS Member of SPPU",
  "nilam ghuge": "👩‍💼 **Dr. Nilam N. Ghuge**\n\n**Role:** HOD — Electrical Engineering (EE) Department, BSIOTR",
  "ghuge": "👩‍💼 **Dr. Nilam N. Ghuge**\n\n**Role:** HOD — Electrical Engineering (EE) Department, BSIOTR",
  "bhadane": "**Prof. V. D. Bhadane** — IT Department\n- **Subjects:** DBMS\n- **Role:** Class Teacher (SE-A), Guardian Faculty Member (GFM)",
  "pawle": "**Prof. A. N. Pawle** — IT Department\n- **Subjects:** Computer Graphics, OE-II\n- **Role:** Class Teacher (SE-B), Guardian Faculty Member (GFM)",
  "sarda": "**Prof. P. G. Sarda** — IT Department\n- **Subjects:** DSBDA\n- **Role:** Guardian Faculty Member (GFM)",
  "khirsagar": "**Prof. V. A. Khirsagar** — IT Department\n- **Subjects:** Probability and Statistics (P&S)\n- **Role:** Class Teacher (TE-B)",
  "ambiger": "**Prof. A. T. Ambiger** — IT Department\n- **Subjects:** Programming and Applications, E-Commerce",
  "bhusare": "**Prof. V. P. Bhusare** — IT Department\n- **Subjects:** Environmental Studies (EVS)",
  "kotwal": "**Prof. R. S. Kotwal** — IT Department\n- **Subjects:** DBMS, Big Data Analytics",
  "chawre": "**Prof. P. V. Chawre** — IT Department\n- **Subjects:** Computer Graphics, Artificial Intelligence (AI)",
  "yedve": "**Prof. V. B. Yedve** — IT Department\n- **Subjects:** Artificial Intelligence (AI), Programming Applications",
  "bhujbal": "**Prof. S. N. Bhujbal** — IT Department\n- **Subjects:** Web Application Development (WAD)",
  "ingale": "**Prof. P. S. Ingale** — IT Department\n- **Subjects:** Data Science",
  "sadafal": "**Prof. N. P. Sadafal** — IT Department\n- **Subjects:** Open Elective",
  "khairnar": "**Prof. Smita Khairnar** — Computer Engineering Department\n- **Experience:** Tech Mahindra (industry)\n- **Qualification:** ME Computer",
};

// Detect if query is completely unrelated to college
function isUnrelatedQuery(query: string): boolean {
  const normalizedQ = normalize(query);
  const collegeKeywords = [
    "college", "bsiotr", "jspm", "admission", "course", "department", "hod", "faculty",
    "placement", "scholarship", "timetable", "facility", "exam", "hostel", "library",
    "lab", "campus", "principal", "teacher", "professor", "prof", "sir", "madam",
    "it department", "entc", "electrical", "mechanical", "civil", "computer",
    "fee", "cutoff", "cap", "seat", "syllabus", "subject", "semester", "year",
    "student", "result", "marks", "attendance", "backlog", "atkt", "kt",
    "wagholi", "pune", "sppu", "university", "engineering", "diploma",
    "wadne", "nagraj", "angal", "ghuge", "bhadane", "pawle", "sarda", "khirsagar",
    "ambiger", "bhusare", "kotwal", "chawre", "yedve", "bhujbal", "ingale", "sadafal", "khairnar",
    "notice", "event", "fest", "sports", "nss", "ncc", "club", "committee",
    "canteen", "parking", "transport", "bus", "gate", "office", "contact", "phone", "email",
    "training", "internship", "project", "mini project", "major project",
    "building", "d1", "d2", "location", "where", "located", "address",
    "established", "founded", "owner", "manages", "sawant", "aicte", "dte", "approved",
    "enquiry", "enquire", "history",
  ];
  return !collegeKeywords.some(kw => normalizedQ.includes(kw));
}

const UNRELATED_RESPONSE = "This chatbot only answers college-related questions. Please ask a question about JSPM's BSIOTR. 🎓";

const NO_INFO_RESPONSE = `I don't have information about that in the college database. 🙏\n\nPlease **contact the college inquiry office** or visit the official website:\n\n📞 **020-67335100**\n📧 **principal@jspmbsiotr.edu.in**\n🌐 **https://jspmbsiotr.edu.in/**`;

// Split a message into multiple questions
function splitQuestions(text: string): string[] {
  // Split on common delimiters: "and also", numbered lists, question marks followed by more text, newlines
  let parts: string[] = [];

  // First try splitting on question marks (keep as separate questions)
  const qMarkSplit = text.split(/\?\s*/g).filter(s => s.trim().length > 3);
  if (qMarkSplit.length > 1) {
    parts = qMarkSplit.map(s => s.trim());
  } else {
    // Try splitting on "and", "also", "&&", numbered patterns
    const combinedSplit = text.split(/\s*(?:\band\b\s+\balso\b|\balso\b|\band\s+(?=what|who|where|when|how|which|tell|give)|\d+\.\s+|\n+)\s*/i);
    if (combinedSplit.length > 1) {
      parts = combinedSplit.filter(s => s.trim().length > 3).map(s => s.trim());
    }
  }

  return parts.length > 1 ? parts : [text];
}

function findSingleAnswer(query: string, conversationHistory: Array<{role: string; content: string}>): string {
  const normalizedQuery = normalize(query);

  // ── Conversational context: resolve pronouns/follow-ups ──
  let enrichedQuery = query;
  if (conversationHistory.length > 0) {
    const hasPronouns = /^(he|she|they|his|her|their|this|that|it|same|tell me more|more info|what about|and |also |who is he|who is she|what does|more about)/.test(normalizedQuery);
    const isVeryShort = getContentWords(query).length <= 1 && normalizedQuery.length < 15;

    if (hasPronouns || isVeryShort) {
      // Find the last bot answer's topic from history
      const lastBotMsg = [...conversationHistory].reverse().find(m => m.role === "bot");
      const lastUserMsg = [...conversationHistory].reverse().find(m => m.role === "user");
      if (lastUserMsg) {
        enrichedQuery = `${lastUserMsg.content} ${query}`;
      }
    }
  }

  const normalizedEnrichedQuery = normalize(enrichedQuery);

  // Direct faculty name lookup
  for (const [name, answer] of Object.entries(facultyDirectory)) {
    if (normalizedQuery.includes(name) || normalizedEnrichedQuery.includes(name)) {
      return answer;
    }
  }

  // Score all entries
  const scored = collegeKnowledge.map(entry => ({
    entry,
    score: Math.max(scoreEntry(query, entry), scoreEntry(enrichedQuery, entry))
  })).filter(({ score }) => score > 0);

  scored.sort((a, b) => b.score - a.score);

  const CONFIDENCE_THRESHOLD = 10;
  if (scored.length === 0 || scored[0].score < CONFIDENCE_THRESHOLD) {
    return NO_INFO_RESPONSE;
  }

  const topEntry = scored[0].entry;
  let response = topEntry.answer;

  if (scored[0].score < 20) {
    response += "\n\n📌 *For more details, please contact the college office.*";
  }

  return response;
}

export function findAnswer(query: string, conversationHistory: Array<{role: string; content: string}> = []): string {
  if (!query.trim()) return "Please type a question! I'm here to help. 😊";

  const normalizedQuery = normalize(query);

  // Greetings
  const isOnlyGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|namaste|namaskar|hii|helo|howdy|sup)(\s*)$/.test(normalizedQuery);
  if (isOnlyGreeting) {
    return "Hello! 👋 How can I help you today?\n\nAsk me about admissions, faculty, timetables, placements, scholarships, or any BSIOTR queries!";
  }

  // Thanks
  const isOnlyThanks = /^(thank you|thanks|thank you so much|ty|thnx|thankyou|thx|dhanyavad)(\s*)$/.test(normalizedQuery);
  if (isOnlyThanks) {
    return "You're welcome! 😊 Feel free to ask if you have more questions about BSIOTR. 🎓";
  }

  // Goodbye
  const isOnlyBye = /^(bye|goodbye|see you|ok bye|okay bye|that's all|thats all|cya|good night)(\s*)$/.test(normalizedQuery);
  if (isOnlyBye) {
    return "Goodbye! 👋 Best of luck with your studies at BSIOTR! Come back anytime. 🎓";
  }

  // Check for "what did I ask" / "previous question" type queries
  const askingAboutHistory = /previous|earlier|before|last question|what did i ask|my question|chat history|our conversation/.test(normalizedQuery);
  if (askingAboutHistory && conversationHistory.length > 0) {
    const userMessages = conversationHistory.filter(m => m.role === "user");
    if (userMessages.length > 0) {
      const recent = userMessages.slice(-5);
      let historyText = "📝 **Your recent questions:**\n\n";
      recent.forEach((msg, i) => {
        historyText += `${i + 1}. ${msg.content}\n`;
      });
      historyText += "\nFeel free to ask any follow-up questions! 😊";
      return historyText;
    }
  }

  // ── STRICT RULE: Reject unrelated queries ──
  if (isUnrelatedQuery(normalizedQuery)) {
    return UNRELATED_RESPONSE;
  }

  // ── Multi-question support ──
  const questions = splitQuestions(query);
  if (questions.length > 1) {
    const answers: string[] = [];
    for (const q of questions) {
      if (isUnrelatedQuery(normalize(q))) continue;
      const answer = findSingleAnswer(q, conversationHistory);
      if (answer !== NO_INFO_RESPONSE) {
        answers.push(`**Q: ${q.charAt(0).toUpperCase() + q.slice(1)}**\n\n${answer}`);
      }
    }
    if (answers.length === 0) return NO_INFO_RESPONSE;
    return answers.join("\n\n---\n\n");
  }

  return findSingleAnswer(query, conversationHistory);
}
