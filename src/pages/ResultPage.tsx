import { useLocation, useNavigate } from 'react-router-dom';
import type { Question } from '../lib/questions';
import { loadBestScore } from '../lib/bestScore';

interface ResultState {
  score: number;
  level: number;
  question: Question;
  isNewBest: boolean;
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Guard: if navigated here directly without state, go to top
  if (!state) {
    navigate('/', { replace: true });
    return null;
  }

  const { score, level, question, isNewBest } = state as ResultState;
  const best = loadBestScore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-6 py-10 max-w-lg mx-auto">
      {/* Score */}
      <div className="text-center mt-6 w-full">
        <p className="text-slate-400 text-sm uppercase tracking-widest">今回のスコア</p>
        <p className="text-7xl font-bold mt-2">{score}</p>
        <p className="text-slate-400 text-sm mt-1">連続正解 / Lv.{level}</p>
      </div>

      {/* New best banner */}
      {isNewBest && score > 0 && (
        <div className="mt-4 bg-amber-500/20 border border-amber-400 rounded-xl px-4 py-2 text-center">
          <p className="text-amber-400 font-bold text-sm">🏆 自己ベスト更新！</p>
        </div>
      )}

      {/* Best score (if not updated this session) */}
      {!isNewBest && best && (
        <div className="mt-4 text-center text-slate-500 text-sm">
          <p>自己ベスト: <span className="text-slate-300 font-semibold">{best.score}</span> 連続正解</p>
        </div>
      )}

      {/* Explanation */}
      <div className="mt-8 w-full bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">ゲームオーバーの問題</p>
        <p className="text-sm whitespace-pre-line text-slate-200 leading-relaxed mb-4">
          {question.text}
        </p>
        <div className="border-t border-slate-700 pt-3">
          <p className="text-emerald-400 font-bold text-sm mb-1">
            正解: {question.answer} コンボ
          </p>
          <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
            {question.explanation}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-auto pt-10 w-full space-y-3">
        <button
          onClick={() => navigate('/play')}
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-lg rounded-2xl py-4 transition-all touch-manipulation"
        >
          もう一度
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-medium text-base rounded-2xl py-4 transition-all touch-manipulation"
        >
          トップへ戻る
        </button>
      </div>
    </div>
  );
}
