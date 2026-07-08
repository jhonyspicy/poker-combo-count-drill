import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestion, generateAllSimpleQuestions } from '../lib/questions';
import type { Question } from '../lib/questions';
import { getTimeLimitSec, getLevelType, MASTERY_STREAK } from '../config/gameConfig';
import { tryUpdateBestScore } from '../lib/bestScore';

function initQState(firstQuestion: Question, level: number) {
  return {
    question: firstQuestion,
    timeLimitMs: getTimeLimitSec(firstQuestion.type, level) * 1000,
  };
}

export default function PlayPage() {
  const navigate = useNavigate();

  // Lv1用: ゲーム開始時に全単純問題をシャッフルして保持（以降変更しない）
  const [simpleQueue] = useState<Question[]>(() => generateAllSimpleQuestions());

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  // レベル内の正解数（レベルアップ時に0にリセット）
  const [progressInLevel, setProgressInLevel] = useState(0);
  const [{ question, timeLimitMs }, setQState] = useState(() =>
    initQState(simpleQueue[0], 1)
  );
  const [timerKey, setTimerKey] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(() =>
    getTimeLimitSec(simpleQueue[0].type, 1) * 1000
  );
  const [levelUpVisible, setLevelUpVisible] = useState(false);

  // Refs so the timer interval can read latest values without re-running the effect
  const stateRef = useRef({ score, level, question });
  useEffect(() => {
    stateRef.current = { score, level, question };
  }, [score, level, question]);

  useEffect(() => {
    const startTime = Date.now();

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
  }, [timerKey, timeLimitMs, navigate]);

  function handleChoice(choice: number) {
    if (choice !== question.answer) {
      const isNewBest = tryUpdateBestScore(score, level);
      navigate('/result', { state: { score, level, question, isNewBest } });
      return;
    }

    const newScore = score + 1;
    const newProgress = progressInLevel + 1;

    // Lv1: SIMPLE_POOL 全問正解でクリア、Lv2以降: MASTERY_STREAK 連続正解でレベルアップ
    const masteryRequired = level === 1 ? simpleQueue.length : MASTERY_STREAK;
    const isLevelClear = newProgress >= masteryRequired;

    const nextLevel = isLevelClear ? level + 1 : level;
    const nextProgress = isLevelClear ? 0 : newProgress;

    // 次の問題を取得
    let nextQ: Question;
    if (nextLevel === 1) {
      // Lv1中はキューの次の問題を順番に取り出す
      nextQ = simpleQueue[nextProgress];
    } else {
      nextQ = generateQuestion(nextLevel);
    }

    const nextTimeLimitMs = getTimeLimitSec(nextQ.type, nextLevel) * 1000;

    if (isLevelClear) {
      setLevel(nextLevel);
      setLevelUpVisible(true);
      setTimeout(() => setLevelUpVisible(false), 1500);
    }
    setScore(newScore);
    setProgressInLevel(nextProgress);
    setQState({ question: nextQ, timeLimitMs: nextTimeLimitMs });
    setTimeLeftMs(nextTimeLimitMs);
    setTimerKey(k => k + 1);
  }

  const masteryRequired = level === 1 ? simpleQueue.length : MASTERY_STREAK;
  const progress = Math.max(0, timeLeftMs / timeLimitMs);
  const timerColor =
    progress > 0.5 ? 'bg-emerald-500' : progress > 0.25 ? 'bg-amber-400' : 'bg-red-500';

  // レベル別の問題タイプ表示名
  const levelTypeLabel: Record<string, string> = {
    simple: '基礎',
    flop: 'フロップ',
    turn: 'ターン',
    river: 'リバー',
  };
  const currentTypeLabel = levelTypeLabel[getLevelType(level)] ?? '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative">
      {/* レベルアップオーバーレイ */}
      {levelUpVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20 pointer-events-none">
          <div className="text-center">
            <p className="text-5xl font-bold text-amber-400">Level Up!</p>
            <p className="text-2xl mt-2 text-slate-300">Lv.{level}</p>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-slate-800">
        <div className="flex flex-col">
          <span className="text-slate-400 text-sm font-medium">Lv.{level} {currentTypeLabel}</span>
          <span className="text-slate-500 text-xs">{progressInLevel}/{masteryRequired}</span>
        </div>
        <span className="text-lg font-bold">{score} 連続正解</span>
      </div>

      {/* タイマーバー */}
      <div className="h-2 bg-slate-800">
        <div
          className={`h-full ${timerColor}`}
          style={{ width: `${progress * 100}%`, transition: 'width 0.05s linear' }}
        />
      </div>

      {/* 問題と選択肢 */}
      <div className="flex-1 flex flex-col px-4 py-8 w-full">
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
