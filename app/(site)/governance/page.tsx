import SitePage from '@/components/layout/SitePage';
import GovernancePage from '@/components/pages/GovernancePage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('governance');

export default function Page() {
  return (
    <SitePage id="governance">
      <GovernancePage />
    </SitePage>
  );
}
