import SitePage from '@/components/layout/SitePage';
import ComplaintsPage from '@/components/pages/ComplaintsPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('complaints');

export default function Page() {
  return (
    <SitePage id="complaints">
      <ComplaintsPage />
    </SitePage>
  );
}
