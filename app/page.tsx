import { categoryLabel } from '@/lib/briefing/edition';
import { getPublishedBriefings } from '@/lib/briefing/posts';
import HomePage, { type HomePost } from './components/home/HomePage';

// The "Novidades" cards come from the published briefings. Without Supabase the
// data layer falls back to its bundled sample posts, so builds never block on it.
export const revalidate = 3600;

export default async function Home() {
  const { posts } = await getPublishedBriefings({ limit: 4 });
  const homePosts: HomePost[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    dek: post.dek,
    category: categoryLabel(post.category),
    readingMinutes: post.readingMinutes,
    publishedAt: post.publishedAt,
  }));

  return <HomePage posts={homePosts} />;
}
