
import { fetchFromAPI } from '@/lib/api';
import FeaturedBlogPreview from './FeaturedBlogPreview.jsx';

async function getFeaturedPost() {
  try {
    const data = await fetchFromAPI('/posts/?is_featured=true&limit=1');
    const post = data?.results?.[0];

    if (!post) {
      console.warn('⚠️ No featured post found');
      return null;
    }

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      year: post.published_at
        ? new Date(post.published_at).getFullYear()
        : undefined,
      category: post.category?.name,
      author: post.author_data,
      date: post.published_at
        ? new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'No date',
      image: post.featured_image
        ? {
            src: post.featured_image,
            alt: post.title || 'Featured post',
          }
        : null,
    };
  } catch (error) {
    console.error(
      '❌ Featured post fetch error:',
      error?.message || error
    );
    return null;
  }
}

export default async function FeaturedBlogPreviewServer() {
  const postData = await getFeaturedPost();

  if (!postData) {
    return null;
  }

  return <FeaturedBlogPreview featuredPost={postData} />;
}
