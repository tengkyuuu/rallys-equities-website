import SitePage from '@/components/layout/SitePage';
import PortalPage from '@/components/pages/PortalPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('portal');

export default function Page() {
  return (
    <SitePage id="portal">
      <PortalPage />
    </SitePage>
  );
}
