import { useLocation, useNavigate } from 'react-router-dom';
import type { Question } from '../lib/questions';
import type { Difficulty } from '../config/gameConfig';
import { DIFFICULTY_CONFIG } from '../config/gameConfig';
import { loadBestScores } from '../lib/bestScore';

interface ResultState {
  score: number;
  difficulty: Difficulty;
  question: Question;
  isNewBest: boolean;
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // state なしの直アクセスはトップへ戻す
  if (!state) {
    navigate('/', { replace: true });
    return null;
  }

  const { score, difficulty, question, isNewBest } = state as ResultState;
  const best = loadBestScores()[difficulty];

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50 flex flex-col items-center px-4 py-10">
      {/* スコア */}
      <div className="text-center mt-6 w-full">
        <p className="text-slate-400 text-sm uppercase tracking-widest">
          {DIFFICULTY_CONFIG[difficulty].label}
        </p>
        <p className="text-7xl font-bold mt-2">{score}</p>
        <p className="text-slate-400 text-sm mt-1">連続正解</p>
      </div>

      {/* 自己ベスト更新バナー */}
      {isNewBest && score > 0 && (
        <div className="mt-4 bg-amber-500/20 border border-amber-400 rounded-xl px-4 py-2 text-center">
          <p className="text-amber-400 font-bold text-sm">
            🏆 {DIFFICULTY_CONFIG[difficulty].label}の自己ベスト更新！
          </p>
        </div>
      )}

      {/* 更新なしの場合はこの難易度の自己ベストを表示 */}
      {!isNewBest && best && (
        <div className="mt-4 text-center text-slate-500 text-sm">
          <p>
            {DIFFICULTY_CONFIG[difficulty].label}の自己ベスト:{' '}
            <span className="text-slate-300 font-semibold">{best.score}</span> 連続正解
          </p>
        </div>
      )}

      {/* 解説 */}
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

      {/* ボタン */}
      <div className="mt-auto pt-10 w-full space-y-3">
        <button
          onClick={() => navigate(`/play/${difficulty}`)}
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-lg rounded-2xl py-4 transition-all touch-manipulation"
        >
          もう一度（{DIFFICULTY_CONFIG[difficulty].label}）
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
