import SitePage from '@/components/layout/SitePage';
import ManagementPage from '@/components/pages/ManagementPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('management');

export default function Page() {
  return (
    <SitePage id="management">
      <ManagementPage />
    </SitePage>
  );
}
