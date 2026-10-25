import SitePage from '@/components/layout/SitePage';
import RatingPage from '@/components/pages/RatingPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('rating');

export default function Page() {
  return (
    <SitePage id="rating">
      <RatingPage />
    </SitePage>
  );
}
