import SitePage from '@/components/layout/SitePage';
import AwarenessPage from '@/components/pages/AwarenessPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('awareness');

export default function Page() {
  return (
    <SitePage id="awareness">
      <AwarenessPage />
    </SitePage>
  );
}
