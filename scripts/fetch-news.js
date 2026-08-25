// scripts/fetch-news.js
// RSSからニュースを取得 → Claudeに要約・選定させる

require('dotenv').config({ path: '.env.local' });
const Parser = require('rss-parser');
const Anthropic = require('@anthropic-ai/sdk');

const parser = new Parser();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ニュース取得元のRSSフィード一覧
const FEEDS = [
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { name: 'Anthropic', url: 'https://tim-hilde.github.io/anthropic-rss/rss.xml' },
  { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/' },
];

// RSSから記事を集める処理
async function fetchAllNews() {
  const allArticles = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const latestItems = parsed.items.slice(0, 3);

      latestItems.forEach((item) => {
        allArticles.push({
          source: feed.name,
          title: item.title,
          link: item.link,
          publishedAt: item.pubDate,
          rawSummary: item.contentSnippet || item.content || '',
        });
      });

      console.log(`${feed.name}: ${latestItems.length}件 取得成功`);
    } catch (error) {
      console.error(`${feed.name} の取得に失敗しました:`, error.message);
    }
  }

  return allArticles;
}

// Claudeに渡して、要約・選定・重複削除・AI用語生成をさせる処理
async function summarizeWithClaude(articles) {
  const articlesText = articles
    .map(
      (a, i) =>
        `${i + 1}. [${a.source}] ${a.title}\nリンク: ${a.link}\n概要: ${a.rawSummary}\n`
    )
    .join('\n');

  const prompt = `以下はAI業界のニュース記事一覧です。この中から、AI業界にとって重要なニュースを最大5件選び、日本語で要約してください。

【ルール】
- 同じ内容を報じている記事は1つにまとめてください（重複削除）
- 各ニュースの要約は30〜60文字程度の日本語にしてください
- できるだけ OpenAI / Anthropic / Google の主要企業のニュースを優先してください
- 記事一覧の中に重要なニュースが無い場合、無理に5件選ばず、少ない件数でも構いません
- 最後に「今日覚えておきたいAI用語」を1つ、記事の内容に関連するものか一般的なAI用語から選び、40文字程度で解説してください

【記事一覧】
${articlesText}

【出力形式】
以下のJSON形式のみを出力してください。前置きや説明文は一切不要です。コードブロック記号（バッククォート3つ）も付けないでください。

{
  "news": [
    {
      "source": "OpenAI",
      "title": "日本語の短いタイトル(20文字程度)",
      "summary": "30〜60文字程度の日本語要約",
      "link": "元記事のURL",
      "originalTitle": "元の記事タイトル"
    }
  ],
  "aiTermOfTheDay": {
    "term": "用語名",
    "explanation": "40文字程度の説明"
  }
}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;

  const cleanedText = responseText
    .replace(/```json\s*/g, '')
    .replace(/```\s*$/g, '')
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('JSONの解析に失敗しました。Claudeの返答:');
    console.error(responseText);
    throw error;
  }
}

// ファイル保存のために使う、Node.js標準の機能を読み込む
const fs = require('fs');
const path = require('path');

// 実行部分
async function main() {
  console.log('=== STEP1: ニュース取得中 ===');
  const articles = await fetchAllNews();
  console.log(`\n合計 ${articles.length} 件の記事を取得しました\n`);

  if (articles.length === 0) {
    console.log('記事が1件も取得できなかったため、Claudeへの依頼を中止します。');
    return;
  }

  console.log('=== STEP2: Claudeに要約・選定を依頼中... ===');
  const result = await summarizeWithClaude(articles);

  // 日付と最終更新時刻を追加する
  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const finalData = {
    date: dateStr, // 例: "8月26日"
    updatedAt: timeStr, // 例: "07:00"
    news: result.news,
    aiTermOfTheDay: result.aiTermOfTheDay,
  };

  // data/news.json というファイルに保存する
  const outputPath = path.join(__dirname, '..', 'data', 'news.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');

  console.log('\n=== data/news.json に保存しました ===');
  console.log(JSON.stringify(finalData, null, 2));
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
});