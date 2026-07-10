import { useNavigate, Link } from 'react-router-dom';
import { loadBestScores } from '../lib/bestScore';
import { DIFFICULTIES, DIFFICULTY_CONFIG } from '../config/gameConfig';

export default function TopPage() {
  const navigate = useNavigate();
  const bests = loadBestScores();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-between px-4 py-10">
      {/* タイトルブロック */}
      <div className="text-center mt-6">
        <p className="text-3xl tracking-widest text-emerald-400 mb-2">♠ ♥ ♦ ♣</p>
        <h1 className="text-3xl font-bold tracking-tight">コンボカウントドリル</h1>
        <p className="text-slate-400 text-sm mt-2">ポーカーのコンボ数を瞬時に数える力を鍛えよう</p>
      </div>

      {/* 難易度選択ボタン */}
      <div className="w-full my-8 space-y-3">
        {DIFFICULTIES.map(difficulty => {
          const cfg = DIFFICULTY_CONFIG[difficulty];
          const best = bests[difficulty];
          return (
            <button
              key={difficulty}
              onClick={() => navigate(`/play/${difficulty}`)}
              className="w-full bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 rounded-2xl px-5 py-4 flex items-center justify-between transition-all touch-manipulation text-left"
            >
              <div>
                <p className="text-lg font-bold text-slate-50">{cfg.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{cfg.description}</p>
              </div>
              <div className="text-right shrink-0 pl-3">
                {best ? (
                  <>
                    <p className="text-2xl font-bold text-emerald-400 tabular-nums">{best.score}</p>
                    <p className="text-slate-500 text-[10px]">自己ベスト</p>
                  </>
                ) : (
                  <p className="text-slate-500 text-xs">記録なし</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* リンクと注記 */}
      <div className="w-full space-y-4">
        <div className="text-center">
          <Link
            to="/howto"
            className="text-slate-400 text-sm underline underline-offset-2"
          >
            遊び方・コンボ表を見る
          </Link>
        </div>

        <div className="text-center">
          <a
            href="https://jhonyspicy.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 text-sm underline underline-offset-2"
          >
            アプリ一覧
          </a>
        </div>

        <p className="text-center text-slate-600 text-xs">
          不正解・時間切れでゲームオーバー
        </p>
      </div>
    </div>
  );
}
