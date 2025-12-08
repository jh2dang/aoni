import { Trophy, TrendingUp, Target, ArrowUpRight, Zap } from "lucide-react";

export default function MainPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-400/10 to-cyan-400/10 border border-sky-400/20 flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-sky-400/20 blur-xl rounded-full"></div>
        <Zap className="w-10 h-10 text-sky-500 dark:text-sky-400 relative z-10" />
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
        준비되셨나요?
      </h2>
      <p className="text-slate-600 dark:text-slate-400 text-lg max-w-lg mb-12">
        최고의 플레이어들의 데이터를 분석하고
        <br />
        당신의 캐릭터를 한 단계 더 성장시키세요.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {[
          {
            title: "상위 랭커 분석",
            icon: Trophy,
            color: "text-amber-500 dark:text-amber-400",
          },
          {
            title: "실시간 아이템 시세",
            icon: TrendingUp,
            color: "text-emerald-500 dark:text-emerald-400",
          },
          {
            title: "최적의 스티그마",
            icon: Target,
            color: "text-blue-500 dark:text-blue-400",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="group p-6 rounded-2xl bg-white dark:bg-[#151A29] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-1 cursor-pointer shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 ${item.color}`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
