import { useNavigate } from 'react-router-dom';

export default function HowToPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50 flex flex-col px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-slate-400 text-sm mb-6 text-left"
      >
        ← 戻る
      </button>

      <h1 className="text-2xl font-bold mb-6">遊び方</h1>

      <section className="space-y-3 text-slate-300 text-sm leading-relaxed">
        <p>ポーカーのコンボ数を素早く数える力を鍛えるクイズアプリです。</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>トップページで難易度（初級・中級・上級）を選ぶとスタートします</li>
          <li>制限時間内に4択から正解を選んでください</li>
          <li>正解すると即座に次の問題へ進みます（連続正解 +1）</li>
          <li>正解を重ねるほど制限時間が短くなっていきます</li>
          <li>不正解・時間切れでゲームオーバー。難易度ごとの記録に挑戦しよう！</li>
        </ol>
      </section>

      <h2 className="text-xl font-bold mt-10 mb-4">難易度</h2>

      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-sm text-slate-300 space-y-3 leading-relaxed">
        <p>
          <strong className="text-slate-100">初級編</strong> — レンジ表を見ながら、AKs・AA・オフスート全体
          などのコンボ数を答える基礎トレーニング。
        </p>
        <p>
          <strong className="text-slate-100">中級編</strong> — ボードと自分のハンドを見て、デッドカードを
          除いたコンボ数をカウントする実戦練習。
        </p>
        <p>
          <strong className="text-slate-100">上級編</strong> — 相手のレンジ表とボードを見て、自分が
          何コンボに負けているかをカウントする総合演習。
        </p>
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">コンボ表</h2>

      {/* Basic combos table */}
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-2 text-sm">
        <Row label="総コンボ数" value="1326" />
        <Divider />
        <Row label="ポケットペア（全体）" value="78" />
        <Row label="　各ペア（例: AA）" value="6" />
        <Divider />
        <Row label="スーテッド（全体）" value="312" />
        <Row label="　各スーテッド（例: AKs）" value="4" />
        <Divider />
        <Row label="オフスート（全体）" value="936" />
        <Row label="　各オフスート（例: AKo）" value="12" />
        <Divider />
        <Row label="非ペア2ランク合計（例: AK）" value="16" />
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">デッドカードの数え方</h2>

      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-sm text-slate-300 space-y-3 leading-relaxed">
        <p>ボードに見えているカード（デッドカード）を除いたコンボ数を計算します。</p>
        <p className="font-semibold text-slate-200">例: ボード A♠ K♥ 2♦ のとき</p>
        <ul className="space-y-1 list-none">
          <li>AA → 残りA(3枚) → C(3,2) = <strong className="text-emerald-400">3</strong></li>
          <li>AK全体 → 残りA(3) × 残りK(3) = 9</li>
          <li>AKs → A♦K♦, A♣K♣ の <strong>2</strong> コンボ</li>
          <li>AKo → 9 − 2 = <strong className="text-emerald-400">7</strong></li>
        </ul>
        <p className="text-slate-400 text-xs">
          ※ AK全体 → AKs → AKo（引き算）の順で考えるのがコツ
        </p>
      </div>

      <div className="mt-10 pb-4">
        <button
          onClick={() => navigate('/')}
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-lg rounded-2xl py-4 transition-all touch-manipulation"
        >
          難易度を選んでスタート
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-slate-200">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}

function Divider() {
  return <hr className="border-slate-700" />;
}
