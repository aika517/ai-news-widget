import newsData from "../data/news.json";
import NewsCard from "../components/NewsCard";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto">
        {/* ヘッダー部分 */}
        <p className="text-xs tracking-[0.3em] text-purple-400 font-semibold mb-1">
          AI NEWS
        </p>
        <h1 className="text-3xl font-bold mb-8">{newsData.date}</h1>

        {/* ニュース一覧 */}
        <div className="space-y-3">
          {newsData.news.map((item, index) => (
            <NewsCard key={index} item={item} />
          ))}
        </div>

        {/* 今日のAI用語 */}
        <div className="mt-6 p-4 rounded-2xl bg-neutral-900 border border-purple-500/40">
          <p className="text-xs font-semibold text-purple-400 mb-1">
            【AI用語】
          </p>
          <p className="font-bold text-white mb-1">
            {newsData.aiTermOfTheDay.term}
          </p>
          <p className="text-sm text-neutral-400 leading-relaxed">
            → {newsData.aiTermOfTheDay.explanation}
          </p>
        </div>

        {/* 最終更新時刻 */}
        <p className="text-xs text-neutral-500 text-center mt-8">
          最終更新 {newsData.updatedAt}
        </p>
      </div>
    </main>
  );
}