import { useNavigate, Link } from 'react-router-dom';
import { loadBestScore } from '../lib/bestScore';

export default function TopPage() {
  const navigate = useNavigate();
  const best = loadBestScore();

  const formattedDate = best
    ? new Date(best.date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-between px-4 py-10">
      {/* Title block */}
      <div className="text-center mt-6">
        <p className="text-3xl tracking-widest text-emerald-400 mb-2">♠ ♥ ♦ ♣</p>
        <h1 className="text-3xl font-bold tracking-tight">コンボカウントドリル</h1>
        <p className="text-slate-400 text-sm mt-2">ポーカーのコンボ数を瞬時に数える力を鍛えよう</p>
      </div>

      {/* Best score card */}
      <div className="w-full my-8">
        {best ? (
          <div className="bg-slate-800 rounded-2xl p-5 text-center border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">自己ベスト</p>
            <p className="text-6xl font-bold text-emerald-400">{best.score}</p>
            <p className="text-slate-300 text-sm mt-1">連続正解</p>
            <div className="flex justify-center gap-4 mt-3 text-slate-400 text-xs">
              <span>Lv.{best.level} 到達</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl p-5 text-center border border-slate-800">
            <p className="text-slate-400 text-sm">まずは1問目に挑戦！</p>
            <p className="text-slate-500 text-xs mt-1">記録は端末に保存されます</p>
          </div>
        )}
      </div>

      {/* Start button + links */}
      <div className="w-full space-y-4">
        <button
          onClick={() => navigate('/play')}
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xl rounded-2xl py-5 transition-all touch-manipulation"
        >
          スタート
        </button>

        <div className="text-center">
          <Link
            to="/howto"
            className="text-slate-400 text-sm underline underline-offset-2"
          >
            遊び方・コンボ表を見る
          </Link>
        </div>

        <p className="text-center text-slate-600 text-xs">
          不正解・時間切れでゲームオーバー
        </p>
      </div>
    </div>
  );
}
