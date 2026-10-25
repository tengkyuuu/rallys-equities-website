import SitePage from '@/components/layout/SitePage';
import CareersPage from '@/components/pages/CareersPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('careers');

export default function Page() {
  return (
    <SitePage id="careers">
      <CareersPage />
    </SitePage>
  );
}
