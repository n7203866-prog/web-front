import { fetchFromAPI, getImageUrl } from '@/lib/api';
import SuccessfulStories from './SuccessfulStories';

async function getTestimonials() {
  try {
    const data = await fetchFromAPI('/testimonials/?limit=3', { next: { revalidate: false } });
    const testimonials = Array.isArray(data) ? data : data?.results || [];
    console.log(testimonials)
    return testimonials.map((testimonial) => ({
      _id: testimonial.id,
      quote: testimonial.quote,
      authorName: testimonial.author_name,
      authorTitle: testimonial.author_title,
      rating: 5,
      authorImage: testimonial.author_image
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export default async function SuccessfulStoriesServer() {
  const testimonials = await getTestimonials();
  console.log('Fetched testimonials:', testimonials);
  return <SuccessfulStories testimonials={testimonials} />;
}
