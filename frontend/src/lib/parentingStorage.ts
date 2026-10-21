export interface QuizSessionRecord {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  percentage: number;
  dateFormatted: string;
}

export interface ScenarioAnswerRecord {
  selectedOptionIndex: number;
  timestamp: number;
}

export interface MythAnswerRecord {
  userChoiceFact: boolean;
  isCorrect: boolean;
  timestamp: number;
}

export interface ParentingProgressSummary {
  quizzesTaken: number;
  bestQuizScore: number | null;
  latestQuizScore: number | null;
  completedChallengesCount: number;
  totalChallengesCount: number;
  scenariosExploredCount: number;
  mythsExploredCount: number;
  favoriteActivitiesCount: number;
}

const STORAGE_KEYS = {
  QUIZ_HISTORY: "kutty_parenting_quiz_history",
  CHALLENGES: "kutty_parenting_completed_challenges",
  SCENARIOS: "kutty_parenting_scenarios_explored",
  MYTHS: "kutty_parenting_myths_answered",
  FAVORITES: "kutty_parenting_favorites"
} as const;

export const PARENTING_STORAGE_EVENT = "kutty_parenting_storage_updated";

function notifyChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PARENTING_STORAGE_EVENT));
  }
}

function safeGetJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[ParentingStorage] Corrupted storage for key "${key}", recovering with fallback.`, err);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return fallback;
  }
}

function safeSetJSON<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notifyChange();
    return true;
  } catch (err) {
    console.warn(`[ParentingStorage] Failed to save key "${key}" to localStorage:`, err);
    return false;
  }
}

// ── QUIZ PROGRESS ──

export function getQuizHistory(): QuizSessionRecord[] {
  const records = safeGetJSON<unknown[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
  if (!Array.isArray(records)) return [];
  // Validate schema
  return records.filter(
    (item): item is QuizSessionRecord =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as any).score === "number" &&
      typeof (item as any).total === "number"
  );
}

export function saveQuizResult(score: number, total: number): QuizSessionRecord {
  const history = getQuizHistory();
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const newRecord: QuizSessionRecord = {
    id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    score,
    total,
    percentage,
    dateFormatted: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    }).format(new Date())
  };

  const updated = [newRecord, ...history].slice(0, 30); // Keep last 30 quizzes
  safeSetJSON(STORAGE_KEYS.QUIZ_HISTORY, updated);
  return newRecord;
}

export function clearQuizHistory(): void {
  safeSetJSON(STORAGE_KEYS.QUIZ_HISTORY, []);
}

// ── CHALLENGES PROGRESS ──

export function getCompletedChallenges(): string[] {
  const list = safeGetJSON<unknown[]>(STORAGE_KEYS.CHALLENGES, []);
  if (!Array.isArray(list)) return [];
  return list.filter((id): id is string => typeof id === "string");
}

export function isChallengeCompleted(challengeId: string): boolean {
  const completed = getCompletedChallenges();
  return completed.includes(challengeId);
}

export function toggleChallengeCompletion(challengeId: string): boolean {
  const current = getCompletedChallenges();
  let updated: string[];
  const wasCompleted = current.includes(challengeId);

  if (wasCompleted) {
    updated = current.filter((id) => id !== challengeId);
  } else {
    // Avoid duplicates using Set
    updated = Array.from(new Set([...current, challengeId]));
  }

  safeSetJSON(STORAGE_KEYS.CHALLENGES, updated);
  return !wasCompleted;
}

export function markChallengeCompleted(challengeId: string): void {
  const current = getCompletedChallenges();
  if (!current.includes(challengeId)) {
    const updated = [...current, challengeId];
    safeSetJSON(STORAGE_KEYS.CHALLENGES, updated);
  }
}

export function resetChallenges(): void {
  safeSetJSON(STORAGE_KEYS.CHALLENGES, []);
}

// ── SCENARIOS PROGRESS ──

export function getScenarioHistory(): Record<string, ScenarioAnswerRecord> {
  const data = safeGetJSON<Record<string, unknown>>(STORAGE_KEYS.SCENARIOS, {});
  if (typeof data !== "object" || data === null || Array.isArray(data)) return {};
  const clean: Record<string, ScenarioAnswerRecord> = {};
  for (const [key, val] of Object.entries(data)) {
    if (
      typeof val === "object" &&
      val !== null &&
      typeof (val as any).selectedOptionIndex === "number"
    ) {
      clean[key] = {
        selectedOptionIndex: (val as any).selectedOptionIndex,
        timestamp: (val as any).timestamp || Date.now()
      };
    }
  }
  return clean;
}

export function saveScenarioAnswer(scenarioId: string, optionIndex: number): void {
  const history = getScenarioHistory();
  history[scenarioId] = {
    selectedOptionIndex: optionIndex,
    timestamp: Date.now()
  };
  safeSetJSON(STORAGE_KEYS.SCENARIOS, history);
}

export function resetScenarioHistory(): void {
  safeSetJSON(STORAGE_KEYS.SCENARIOS, {});
}

// ── MYTH OR FACT PROGRESS ──

export function getMythHistory(): Record<string, MythAnswerRecord> {
  const data = safeGetJSON<Record<string, unknown>>(STORAGE_KEYS.MYTHS, {});
  if (typeof data !== "object" || data === null || Array.isArray(data)) return {};
  const clean: Record<string, MythAnswerRecord> = {};
  for (const [key, val] of Object.entries(data)) {
    if (
      typeof val === "object" &&
      val !== null &&
      typeof (val as any).userChoiceFact === "boolean" &&
      typeof (val as any).isCorrect === "boolean"
    ) {
      clean[key] = {
        userChoiceFact: (val as any).userChoiceFact,
        isCorrect: (val as any).isCorrect,
        timestamp: (val as any).timestamp || Date.now()
      };
    }
  }
  return clean;
}

export function saveMythAnswer(
  mythId: string,
  userChoiceFact: boolean,
  isCorrect: boolean
): void {
  const history = getMythHistory();
  history[mythId] = {
    userChoiceFact,
    isCorrect,
    timestamp: Date.now()
  };
  safeSetJSON(STORAGE_KEYS.MYTHS, history);
}

export function resetMythHistory(): void {
  safeSetJSON(STORAGE_KEYS.MYTHS, {});
}

// ── FAVORITE ACTIVITIES ──

export function getFavoriteActivities(): string[] {
  const list = safeGetJSON<unknown[]>(STORAGE_KEYS.FAVORITES, []);
  if (!Array.isArray(list)) return [];
  return list.filter((id): id is string => typeof id === "string");
}

export function toggleFavoriteActivity(activityId: string): boolean {
  const current = getFavoriteActivities();
  let updated: string[];
  const isFav = current.includes(activityId);
  if (isFav) {
    updated = current.filter((id) => id !== activityId);
  } else {
    updated = Array.from(new Set([...current, activityId]));
  }
  safeSetJSON(STORAGE_KEYS.FAVORITES, updated);
  return !isFav;
}

// ── SUMMARY & RESET ALL ──

export function getParentingProgressSummary(totalChallengesCount = 8): ParentingProgressSummary {
  const quizHistory = getQuizHistory();
  const challenges = getCompletedChallenges();
  const scenarios = getScenarioHistory();
  const myths = getMythHistory();
  const favorites = getFavoriteActivities();

  let bestScore: number | null = null;
  let latestScore: number | null = null;

  if (quizHistory.length > 0) {
    latestScore = quizHistory[0].percentage;
    bestScore = Math.max(...quizHistory.map((q) => q.percentage));
  }

  return {
    quizzesTaken: quizHistory.length,
    bestQuizScore: bestScore,
    latestQuizScore: latestScore,
    completedChallengesCount: challenges.length,
    totalChallengesCount,
    scenariosExploredCount: Object.keys(scenarios).length,
    mythsExploredCount: Object.keys(myths).length,
    favoriteActivitiesCount: favorites.length
  };
}

export function resetAllParentingProgress(): void {
  safeSetJSON(STORAGE_KEYS.QUIZ_HISTORY, []);
  safeSetJSON(STORAGE_KEYS.CHALLENGES, []);
  safeSetJSON(STORAGE_KEYS.SCENARIOS, {});
  safeSetJSON(STORAGE_KEYS.MYTHS, {});
  safeSetJSON(STORAGE_KEYS.FAVORITES, []);
  notifyChange();
}
