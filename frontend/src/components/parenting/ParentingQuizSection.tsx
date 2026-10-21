import { useState, useEffect } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Award,
  ChevronRight,
  History
} from "lucide-react";
import {
  PARENTING_QUIZ_QUESTIONS,
  ParentingQuizQuestion
} from "@/data/parentingActivitiesData";
import {
  saveQuizResult,
  getQuizHistory,
  QuizSessionRecord
} from "@/lib/parentingStorage";

interface ParentingQuizSectionProps {
  onSessionComplete?: () => void;
}

const QUESTIONS_PER_SESSION = 5;

function pickRandomQuestions(count: number): ParentingQuizQuestion[] {
  const shuffled = [...PARENTING_QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function ParentingQuizSection({ onSessionComplete }: ParentingQuizSectionProps) {
  const [questions, setQuestions] = useState<ParentingQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [sessionRecord, setSessionRecord] = useState<QuizSessionRecord | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizSessionRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    startNewQuiz();
    setQuizHistory(getQuizHistory());
  }, []);

  const startNewQuiz = () => {
    const selected = pickRandomQuestions(QUESTIONS_PER_SESSION);
    setQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setCheckedQuestions({});
    setQuizFinished(false);
    setSessionRecord(null);
  };

  const currentQ = questions[currentIndex];
  const selectedOption = selectedAnswers[currentIndex];
  const isChecked = checkedQuestions[currentIndex] || false;

  const handleSelectOption = (index: number) => {
    if (isChecked) return; // locked after check
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: index }));
  };

  const handleCheckAnswer = () => {
    if (selectedOption === undefined) return;
    setCheckedQuestions((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const finishQuiz = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    const record = saveQuizResult(score, questions.length);
    setSessionRecord(record);
    setQuizFinished(true);
    setQuizHistory(getQuizHistory());
    if (onSessionComplete) onSessionComplete();
  };

  const retakeSameQuestions = () => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setQuizFinished(false);
    setSessionRecord(null);
    setCurrentIndex(0);
  };

  if (!currentQ && !quizFinished) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#EBE3D9]">
        <div className="w-8 h-8 border-2 border-[#C98A84] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-[#695B64]">Loading quiz questions...</p>
      </div>
    );
  }

  // ── COMPLETION SCREEN ──
  if (quizFinished && sessionRecord) {
    const scorePct = sessionRecord.percentage;
    let badgeText = "Parenting Explorer 🌱";
    let encouragement = "Every small mindful reflection helps you connect deeper with your child!";
    let bgGlow = "from-amber-50 to-orange-50 border-amber-200 text-amber-800";

    if (scorePct === 100) {
      badgeText = "Empathetic Master Parent 👑";
      encouragement = "Incredible wisdom! Your deep understanding of child neuroscience and empathy is truly shining.";
      bgGlow = "from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800";
    } else if (scorePct >= 80) {
      badgeText = "Mindful Connector 🌟";
      encouragement = "Fantastic insight! You have a wonderful grasp of positive boundaries and emotional co-regulation.";
      bgGlow = "from-rose-50 to-amber-50 border-rose-200 text-rose-800";
    } else if (scorePct >= 60) {
      badgeText = "Curious Guide 💡";
      encouragement = "Great effort! Parenting is a lifelong learning journey—each question offers a fresh perspective.";
      bgGlow = "from-blue-50 to-indigo-50 border-blue-200 text-blue-800";
    }

    return (
      <div className="bg-white rounded-3xl border border-[#EBE3D9] p-6 sm:p-10 shadow-sm max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAEEED] text-[#C98A84] flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#EBE3D9] text-xs font-bold text-[#C98A84] shadow-xs">
            <Award className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </div>

          <h3 className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
            Quiz Completed!
          </h3>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-[#C98A84]">
                {sessionRecord.score} / {sessionRecord.total}
              </div>
              <div className="text-xs text-[#695B64] font-medium mt-1">Score ({sessionRecord.percentage}%)</div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#4E424B] max-w-md mx-auto leading-relaxed">
            {encouragement}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#EBE3D9]">
          <button
            onClick={startNewQuiz}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try 5 New Questions</span>
          </button>

          <button
            onClick={retakeSameQuestions}
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#FAF7F2] hover:bg-gray-100 text-[#2D222A] text-xs font-semibold border border-[#EBE3D9] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#695B64]" />
            <span>Retake This Quiz</span>
          </button>

          {quizHistory.length > 1 && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-white hover:bg-gray-50 text-[#695B64] text-xs font-medium border border-[#EBE3D9] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Quizzes ({quizHistory.length})</span>
            </button>
          )}
        </div>

        {/* History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 bg-[#2D222A]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#EBE3D9] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#EBE3D9] pb-3">
                <div className="font-editorial-serif font-bold text-lg text-[#2D222A] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#C98A84]" />
                  <span>Your Quiz History</span>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-xs text-[#695B64] hover:text-[#2D222A] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {quizHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3D9] text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#2D222A]">
                        {item.score} / {item.total} correct
                      </span>
                      <span className="text-[11px] text-[#695B64] ml-2">({item.percentage}%)</span>
                    </div>
                    <span className="text-[10px] text-[#695B64]">{item.dateFormatted}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ACTIVE QUIZ SESSION ──
  const progressPct = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="bg-white rounded-3xl border border-[#EBE3D9] p-6 sm:p-9 shadow-sm max-w-3xl mx-auto space-y-6">
      {/* Quiz Header with progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#695B64]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAEEED] text-[#C98A84] font-bold text-[10px] uppercase">
              {currentQ.category}
            </span>
            <span className="text-[11px] font-medium text-[#695B64]">
              {currentQ.ageGroup === "all" ? "All Ages" : `Ages ${currentQ.ageGroup}`}
            </span>
          </div>

          <div className="font-bold text-[#2D222A] flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#C98A84]" />
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#EBE3D9]/60">
          <div
            className="h-full bg-gradient-to-r from-[#C98A84] to-[#B87A74] transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Statement */}
      <div className="pt-2">
        <h3 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[#2D222A] leading-snug">
          {currentQ.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-3 pt-1">
        {currentQ.options.map((option, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const isCorrect = optIdx === currentQ.correctIndex;

          let btnClass = "border-[#EBE3D9] bg-white hover:bg-[#FAF7F2] text-[#2D222A]";
          let indicatorIcon = null;

          if (isChecked) {
            if (isCorrect) {
              btnClass = "border-emerald-300 bg-emerald-50/80 text-emerald-900 font-semibold ring-2 ring-emerald-400/30";
              indicatorIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
            } else if (isSelected) {
              btnClass = "border-rose-300 bg-rose-50/80 text-rose-900 ring-2 ring-rose-400/30";
              indicatorIcon = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
            } else {
              btnClass = "border-gray-200 bg-gray-50/60 text-gray-400 opacity-70";
            }
          } else if (isSelected) {
            btnClass = "border-[#C98A84] bg-[#FAEEED]/70 text-[#2D222A] font-semibold ring-2 ring-[#C98A84]/40 shadow-xs";
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={isChecked}
              onClick={() => handleSelectOption(optIdx)}
              className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-start gap-3 cursor-pointer disabled:cursor-default ${btnClass}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isChecked && isCorrect
                    ? "bg-emerald-500 text-white"
                    : isChecked && isSelected
                    ? "bg-rose-500 text-white"
                    : isSelected
                    ? "bg-[#C98A84] text-white"
                    : "bg-[#FAF7F2] border border-[#EBE3D9] text-[#695B64]"
                }`}
              >
                {String.fromCharCode(65 + optIdx)}
              </div>

              <span className="flex-1 leading-relaxed pt-0.5">{option}</span>

              {indicatorIcon}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner (Appears after Check Answer) */}
      {isChecked && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAEEED] to-[#FFF9F5] border border-[#C98A84]/30 space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C98A84]">
            <Sparkles className="w-4 h-4" />
            <span>
              {selectedOption === currentQ.correctIndex ? "Spot On! 🎉" : "Insightful Learning Moment 💡"}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-[#4E424B] leading-relaxed">
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EBE3D9]">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-full border border-[#EBE3D9] bg-white text-xs font-medium text-[#695B64] hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          {!isChecked ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedOption === undefined}
              className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-bold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Check Answer</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-[#2D222A] hover:bg-[#3E303A] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{isLastQuestion ? "Finish Quiz & View Score" : "Next Question"}</span>
              {isLastQuestion ? <Trophy className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
