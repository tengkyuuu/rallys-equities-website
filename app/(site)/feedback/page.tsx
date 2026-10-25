import SitePage from '@/components/layout/SitePage';
import FeedbackPage from '@/components/pages/FeedbackPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('feedback');

export default function Page() {
  return (
    <SitePage id="feedback">
      <FeedbackPage />
    </SitePage>
  );
}
