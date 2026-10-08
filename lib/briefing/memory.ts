import { emptyMemory, normalizeUrl, type RecentMemory } from './dedupe.ts';
import { matchTopics, topicRules } from './sources.ts';
import type { BriefingPost } from './types';

export type EditionMemory = RecentMemory & { recentTitles: string[]; recentTopics: string[] };

function postText(post: BriefingPost) {
  return [post.title, post.dek, post.takeaway, ...post.items.map((item) => `${item.title} ${item.summary}`), ...post.sources.map((source) => source.title)].join(' ');
}

// posts: newest first. URL/title memory uses all of them; topic counts only the newest `topicEditions`.
export function buildRecentMemory(posts: BriefingPost[], { topicEditions = 5 } = {}): EditionMemory {
  const memory = emptyMemory();
  for (const post of posts) {
    for (const source of post.sources) memory.urls.add(normalizeUrl(source.url));
    for (const item of post.items) {
      memory.urls.add(normalizeUrl(item.source.url));
      memory.titles.push(item.title);
    }
    memory.titles.push(post.title);
  }
  const window = posts.slice(0, topicEditions);
  for (const post of window) {
    for (const topic of new Set(matchTopics(postText(post)).map((rule) => rule.name))) {
      memory.topicCounts.set(topic, (memory.topicCounts.get(topic) ?? 0) + 1);
    }
  }
  const recentTopics = Array.from(memory.topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count >= 2)
    .map(([name, count]) => `${topicRules.find((rule) => rule.name === name)?.label ?? name} (${count} de ${window.length} edições)`);
  const recentTitles = posts.flatMap((post) => post.items.map((item) => item.title)).slice(0, 40);
  return { ...memory, recentTitles, recentTopics };
}
