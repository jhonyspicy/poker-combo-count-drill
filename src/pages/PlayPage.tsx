import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { generateQuestion } from '../lib/questions';
import type { Question } from '../lib/questions';
import type { Difficulty } from '../config/gameConfig';
import { DIFFICULTY_CONFIG, getTimeLimitSec, isDifficulty } from '../config/gameConfig';
import { tryUpdateBestScore } from '../lib/bestScore';
import RangeGrid from '../components/RangeGrid';
import FeltStrip from '../components/FeltStrip';

// 不正解時にフィードバックを見せてからリザルトへ遷移するまでの時間
const WRONG_FEEDBACK_MS = 1400;
// 正解時に「正解！」を表示しておく時間（進行は止めない）
const CORRECT_FLASH_MS = 700;

// ルートパラメータの難易度を検証してからゲーム本体をマウントする
export default function PlayPage() {
  const { difficulty } = useParams();
  if (!isDifficulty(difficulty)) return <Navigate to="/" replace />;
  // 難易度が変わったらゲームを最初から作り直す
  return <PlayGame key={difficulty} difficulty={difficulty} />;
}

function questionTimeLimitMs(difficulty: Difficulty, question: Question, streak: number): number {
  return getTimeLimitSec(difficulty, question.street ?? null, streak) * 1000;
}

function PlayGame({ difficulty }: { difficulty: Difficulty }) {
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [{ question, timeLimitMs }, setQState] = useState(() => {
    const first = generateQuestion(difficulty);
    return { question: first, timeLimitMs: questionTimeLimitMs(difficulty, first, 0) };
  });
  const [timerKey, setTimerKey] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(timeLimitMs);
  // 不正解時に選んだ選択肢の位置（null = 未回答）
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  // 正解直後の「正解！」表示フラグ
  const [correctFlash, setCorrectFlash] = useState(false);

  // タイマーのインターバルから最新値を読むための ref（effect の再実行を避ける）
  const stateRef = useRef({ score, question });
  useEffect(() => {
    stateRef.current = { score, question };
  }, [score, question]);

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
        const { score: s, question: q } = stateRef.current;
        const isNewBest = tryUpdateBestScore(difficulty, s);
        navigate('/result', { state: { score: s, difficulty, question: q, isNewBest } });
      } else {
        setTimeLeftMs(remaining);
      }
    }, 50);

    return () => clearInterval(id);
  }, [timerKey, timeLimitMs, navigate, difficulty]);

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
      const isNewBest = tryUpdateBestScore(difficulty, score);
      setTimeout(() => {
        navigate('/result', { state: { score, difficulty, question, isNewBest } });
      }, WRONG_FEEDBACK_MS);
      return;
    }

    // 正解: スコアを伸ばし、短くなった制限時間で次の問題へ
    const newScore = score + 1;
    const nextQ = generateQuestion(difficulty);
    const nextTimeLimitMs = questionTimeLimitMs(difficulty, nextQ, newScore);

    // 「正解！」を出しつつ即座に次の問題へ進む
    setCorrectFlash(true);
    if (correctFlashTimeout.current) clearTimeout(correctFlashTimeout.current);
    correctFlashTimeout.current = setTimeout(() => setCorrectFlash(false), CORRECT_FLASH_MS);

    setScore(newScore);
    setQState({ question: nextQ, timeLimitMs: nextTimeLimitMs });
    setTimeLeftMs(nextTimeLimitMs);
    setTimerKey(k => k + 1);
  }

  const progress = Math.max(0, timeLeftMs / timeLimitMs);
  // 残り時間が少なくなるとバーの色で警告する
  const timerColor = progress > 0.5 ? '#f5b83d' : progress > 0.25 ? '#fb923c' : '#ef4444';

  const answered = wrongPick !== null;
  const feedbackText = answered
    ? `不正解… 正解は ${question.answer}`
    : correctFlash
      ? '正解！'
      : '';
  const feedbackColor = answered ? '#f87171' : '#4ade80';

  // 3要素同時表示（上級）ではレンジ表を小さめにして1画面に収める
  const hasBoard = !!(question.board && question.hero);
  const rangeGridWidth = hasBoard ? 290 : 360;

  return (
    <div
      className="min-h-dvh flex justify-center"
      style={{ background: '#0a0f1e', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <div
        className="w-full max-w-107.5 min-h-dvh flex flex-col"
        style={{ color: '#eef1f8' }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4.5 pt-3.5 pb-2.5">
          <div className="text-[15px] font-bold">{DIFFICULTY_CONFIG[difficulty].label}</div>
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

        {/* 問題要素（レンジ表 / ボード＋自分のハンド / 文章）の出し分け */}
        <div className="flex-1 flex flex-col justify-center gap-3 px-4 pt-2">
          {question.rangeCells && (
            <RangeGrid
              cells={question.rangeCells}
              label={question.rangeLabel ?? 'レンジ表'}
              maxWidthPx={rangeGridWidth}
            />
          )}

          {hasBoard && <FeltStrip board={question.board!} hero={question.hero!} />}

          <QuestionText question={question} />
        </div>

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
                className="h-15 rounded-xl text-[22px] font-bold active:scale-[0.97] touch-manipulation"
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

// 問題タイプに応じた問題文の描画（キーワードを金色で強調する）
function QuestionText({ question }: { question: Question }) {
  const baseClass = 'text-center text-[14.5px] font-semibold leading-relaxed px-1';
  const baseStyle = { color: '#d7ddec' };
  const gold = { color: '#ffd166' };

  if (question.type === 'board-count') {
    return (
      <div className={baseClass} style={baseStyle}>
        相手が{' '}
        <span className="font-extrabold text-base" style={gold}>
          {question.handLabel}
        </span>{' '}
        を持っているコンボ数は？
      </div>
    );
  }

  if (question.type === 'range-vs-board') {
    const verb = question.advancedKind === 'lose' ? '負けています' : '勝っています';
    return (
      <div className={baseClass} style={baseStyle}>
        相手のレンジがレンジ表の通りだとします。
        上記のボードとハンドのとき、あなたは
        <span className="font-extrabold" style={gold}>
          何コンボに{verb}
        </span>
        か？
      </div>
    );
  }

  // 初級はパターンのラベルをそのまま表示する
  return (
    <div className={`${baseClass} whitespace-pre-line text-[17px] font-bold`} style={baseStyle}>
      {question.text}
    </div>
  );
}
