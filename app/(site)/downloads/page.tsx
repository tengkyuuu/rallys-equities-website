import SitePage from '@/components/layout/SitePage';
import DownloadsPage from '@/components/pages/DownloadsPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('downloads');

export default function Page() {
  return (
    <SitePage id="downloads">
      <DownloadsPage />
    </SitePage>
  );
}
