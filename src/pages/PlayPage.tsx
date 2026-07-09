import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestion, generateAllSimpleQuestions } from '../lib/questions';
import type { Question } from '../lib/questions';
import { getTimeLimitSec, getLevelType, MASTERY_STREAK } from '../config/gameConfig';
import { tryUpdateBestScore } from '../lib/bestScore';
import { FELT_COLORS } from '../config/uiConfig';
import PlayingCard from '../components/PlayingCard';
import RangeGrid from '../components/RangeGrid';

function initQState(firstQuestion: Question, level: number) {
  return {
    question: firstQuestion,
    timeLimitMs: getTimeLimitSec(firstQuestion.type, level) * 1000,
  };
}

// 不正解時にフィードバックを見せてからリザルトへ遷移するまでの時間
const WRONG_FEEDBACK_MS = 1400;
// 正解時に「正解！」を表示しておく時間（進行は止めない）
const CORRECT_FLASH_MS = 700;

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
  // 不正解時に選んだ選択肢の位置（null = 未回答）
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  // 正解直後の「正解！」表示フラグ
  const [correctFlash, setCorrectFlash] = useState(false);

  // Refs so the timer interval can read latest values without re-running the effect
  const stateRef = useRef({ score, level, question });
  useEffect(() => {
    stateRef.current = { score, level, question };
  }, [score, level, question]);

  // 不正解表示中はタイマーを止めるためのフラグ
  const frozenRef = useRef(false);
  const correctFlashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const startTime = Date.now();

    const id = setInterval(() => {
      if (frozenRef.current) return;
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

  // アンマウント時に残っているタイムアウトを掃除
  useEffect(() => {
    return () => {
      if (correctFlashTimeout.current) clearTimeout(correctFlashTimeout.current);
    };
  }, []);

  function handleChoice(choice: number, index: number) {
    if (wrongPick !== null) return;

    if (choice !== question.answer) {
      // 不正解: タイマーを止めて正解をハイライトし、少し見せてからリザルトへ
      frozenRef.current = true;
      setWrongPick(index);
      const isNewBest = tryUpdateBestScore(score, level);
      setTimeout(() => {
        navigate('/result', { state: { score, level, question, isNewBest } });
      }, WRONG_FEEDBACK_MS);
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
    // 「正解！」を出しつつ即座に次の問題へ進む
    setCorrectFlash(true);
    if (correctFlashTimeout.current) clearTimeout(correctFlashTimeout.current);
    correctFlashTimeout.current = setTimeout(() => setCorrectFlash(false), CORRECT_FLASH_MS);

    setScore(newScore);
    setProgressInLevel(nextProgress);
    setQState({ question: nextQ, timeLimitMs: nextTimeLimitMs });
    setTimeLeftMs(nextTimeLimitMs);
    setTimerKey(k => k + 1);
  }

  const masteryRequired = level === 1 ? simpleQueue.length : MASTERY_STREAK;
  const progress = Math.max(0, timeLeftMs / timeLimitMs);
  // 残り時間が少なくなるとバーの色で警告する
  const timerColor = progress > 0.5 ? '#f5b83d' : progress > 0.25 ? '#fb923c' : '#ef4444';

  // レベル別の問題タイプ表示名
  const levelTypeLabel: Record<string, string> = {
    simple: '基礎',
    range: 'レンジ表',
    flop: 'フロップ',
    turn: 'ターン',
    river: 'リバー',
  };
  const currentTypeLabel = levelTypeLabel[getLevelType(level)] ?? '';

  const answered = wrongPick !== null;
  const feedbackText = answered
    ? `不正解… 正解は ${question.answer}`
    : correctFlash
      ? '正解！'
      : '';
  const feedbackColor = answered ? '#f87171' : '#4ade80';

  return (
    <div
      className="min-h-dvh flex justify-center"
      style={{ background: '#0a0f1e', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div
        className="w-full max-w-107.5 min-h-dvh flex flex-col relative"
        style={{ color: '#eef1f8' }}
      >
        {/* レベルアップオーバーレイ */}
        {levelUpVisible && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1e]/80 z-20 pointer-events-none">
            <div className="text-center">
              <p className="text-5xl font-bold" style={{ color: '#f5b83d' }}>Level Up!</p>
              <p className="text-2xl mt-2 text-slate-300">Lv.{level}</p>
            </div>
          </div>
        )}

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4.5 pt-3.5 pb-2.5">
          <div className="flex flex-col gap-0.5">
            <div className="text-[15px] font-bold">Lv.{level} {currentTypeLabel}</div>
            <div className="text-xs" style={{ color: '#7d8aa8' }}>
              {progressInLevel}/{masteryRequired}
            </div>
          </div>
          <div className="text-base font-bold">{score} 連続正解</div>
        </div>

        {/* タイマーバー */}
        <div className="h-1.25 mb-1" style={{ background: '#1c2438' }}>
          <div
            className="h-full"
            style={{
              width: `${progress * 100}%`,
              background: timerColor,
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        {question.rangeCells ? (
          /* レンジ表問題: グリッドと問題文を表示（フェルトは使わない） */
          <div className="flex-1 flex flex-col justify-center px-4 pt-2.5">
            <RangeGrid cells={question.rangeCells} />
            <div className="text-center text-[17px] font-bold leading-normal whitespace-pre-line px-1 pt-3.5">
              {question.text}
            </div>
            <div className="text-center text-xs pt-1" style={{ color: '#7d8aa8' }}>
              ハイライトされたエリアのコンボ数は？
            </div>
          </div>
        ) : (
        /* ポーカーテーブル */
        <div className="flex-1 flex flex-col justify-center px-3.5 pt-2.5">
          <div
            className="relative flex flex-col items-center gap-5.5 px-4 pt-8.5 pb-6.5"
            style={{
              borderRadius: '46% / 40%',
              background: `radial-gradient(ellipse at 50% 32%, ${FELT_COLORS.light} 0%, ${FELT_COLORS.base} 62%, ${FELT_COLORS.dark} 100%)`,
              border: '7px solid #3a2a1c',
              boxShadow:
                '0 0 0 2px #59422c, 0 14px 30px rgba(0,0,0,0.55), inset 0 3px 18px rgba(0,0,0,0.45)',
            }}
          >
            {question.board ? (
              <>
                {/* ボード */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="text-[11px] font-bold tracking-[0.18em]"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    ボード
                  </div>
                  <div className="flex gap-2">
                    {question.board.map(card => (
                      <PlayingCard key={`${card.rank}${card.suit}`} card={card} variant="board" />
                    ))}
                  </div>
                </div>

                {/* フェルト上の問題文 */}
                <div
                  className="text-center text-base font-semibold px-2"
                  style={{
                    color: 'rgba(255,255,255,0.92)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  相手が{' '}
                  <span className="font-extrabold" style={{ color: '#ffd166' }}>
                    {question.handLabel}
                  </span>{' '}
                  を持っているコンボ数は？
                </div>

                {/* 自分のハンド */}
                {question.hero && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex">
                      {question.hero.map((card, i) => (
                        <PlayingCard
                          key={`${card.rank}${card.suit}`}
                          card={card}
                          variant="hero"
                          tiltDeg={i === 0 ? -5 : 5}
                        />
                      ))}
                    </div>
                    <div
                      className="text-[11px] font-bold tracking-[0.18em]"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      あなたのハンド
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* 単純問題（Lv1）はカードなしで問題文のみ表示 */
              <div
                className="text-center text-base font-semibold leading-relaxed whitespace-pre-line px-2 py-8"
                style={{
                  color: 'rgba(255,255,255,0.92)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              >
                {question.text}
              </div>
            )}
          </div>
        </div>
        )}

        {/* フィードバック */}
        <div
          className="h-7.5 flex items-center justify-center text-[15px] font-bold"
          style={{ color: feedbackColor }}
        >
          {feedbackText}
        </div>

        {/* 選択肢 */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-5.5">
          {question.choices.map((choice, i) => {
            // 回答後は正解を緑、選んだ誤答を赤、その他を減灯して表示
            let bg = '#1a2338';
            let border = '#2a3552';
            let fg = '#eef1f8';
            if (answered) {
              if (choice === question.answer) {
                bg = '#1c5c3a';
                border = '#2f9d63';
              } else if (i === wrongPick) {
                bg = '#5c2430';
                border = '#a33a4d';
              } else {
                fg = '#5a668a';
              }
            }
            return (
              <button
                key={choice}
                onClick={() => handleChoice(choice, i)}
                disabled={answered}
                className="h-16 rounded-xl text-[22px] font-bold active:scale-[0.97] touch-manipulation"
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  color: fg,
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                }}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
