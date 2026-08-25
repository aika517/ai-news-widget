// components/NewsCard.tsx
// ニュース1件分の見た目（カード）を表示するパーツ

type NewsItem = {
  source: string;
  title: string;
  summary: string;
  link: string;
  originalTitle: string;
};

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-purple-500 transition-colors"
    >
      <p className="text-xs font-semibold text-purple-400 mb-1">
        【{item.source}】
      </p>
      <p className="font-bold text-white mb-1">{item.title}</p>
      <p className="text-sm text-neutral-400 leading-relaxed">
        → {item.summary}
      </p>
    </a>
  );
}