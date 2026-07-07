import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestion } from '../lib/questions';
import { getTimeLimitSec, QUESTIONS_PER_LEVEL } from '../config/gameConfig';
import { tryUpdateBestScore } from '../lib/bestScore';

function initQuestion() {
  const q = generateQuestion(1);
  return { question: q, timeLimitMs: getTimeLimitSec(q.type, 1) * 1000 };
}

export default function PlayPage() {
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [questionsInLevel, setQuestionsInLevel] = useState(0);
  const [{ question, timeLimitMs }, setQState] = useState(initQuestion);
  const [timerKey, setTimerKey] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(() => initQuestion().timeLimitMs);
  const [levelUpVisible, setLevelUpVisible] = useState(false);

  // Refs so the timer interval can read latest values without re-running the effect
  const stateRef = useRef({ score, level, question });
  stateRef.current = { score, level, question };

  useEffect(() => {
    const startTime = Date.now();
    setTimeLeftMs(timeLimitMs);

    const id = setInterval(() => {
      const remaining = timeLimitMs - (Date.now() - startTime);
      if (remaining <= 0) {
        clearInterval(id);
        const { score: s, level: l, question: q } = stateRef.current;
        const isNewBest = tryUpdateBestScore(s, l);
        navigate('/result', { state: { score: s, level: l, question: q, isNewBest } });
      } else {
        setTimeLeftMs(remaining);
      }
    }, 50);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerKey, timeLimitMs, navigate]);

  function handleChoice(choice: number) {
    if (choice !== question.answer) {
      const isNewBest = tryUpdateBestScore(score, level);
      navigate('/result', { state: { score, level, question, isNewBest } });
      return;
    }

    const newScore = score + 1;
    const newQInLevel = questionsInLevel + 1;
    let nextLevel = level;

    if (newQInLevel >= QUESTIONS_PER_LEVEL) {
      nextLevel = level + 1;
      setLevel(nextLevel);
      setQuestionsInLevel(0);
      setLevelUpVisible(true);
      setTimeout(() => setLevelUpVisible(false), 1500);
    } else {
      setQuestionsInLevel(newQInLevel);
    }

    const nextQ = generateQuestion(nextLevel);
    const nextTimeLimitMs = getTimeLimitSec(nextQ.type, nextLevel) * 1000;
    setScore(newScore);
    setQState({ question: nextQ, timeLimitMs: nextTimeLimitMs });
    setTimerKey(k => k + 1);
  }

  const progress = Math.max(0, timeLeftMs / timeLimitMs);
  const timerColor =
    progress > 0.5 ? 'bg-emerald-500' : progress > 0.25 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative">
      {/* Level up overlay */}
      {levelUpVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20 pointer-events-none">
          <div className="text-center">
            <p className="text-5xl font-bold text-amber-400">Level Up!</p>
            <p className="text-2xl mt-2 text-slate-300">Lv.{level}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-slate-800">
        <span className="text-slate-400 text-sm font-medium">Lv.{level}</span>
        <span className="text-lg font-bold">{score} 連続正解</span>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-slate-800">
        <div
          className={`h-full ${timerColor}`}
          style={{ width: `${progress * 100}%`, transition: 'width 0.05s linear' }}
        />
      </div>

      {/* Question + choices */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-center leading-relaxed whitespace-pre-line">
            {question.text}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          {question.choices.map((choice) => (
            <button
              key={choice}
              onClick={() => handleChoice(choice)}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-2xl p-5 text-center text-2xl font-bold transition-all touch-manipulation"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
