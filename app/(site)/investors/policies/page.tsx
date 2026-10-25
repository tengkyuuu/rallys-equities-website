import SitePage from '@/components/layout/SitePage';
import PoliciesPage from '@/components/pages/PoliciesPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('policies');

export default function Page() {
  return (
    <SitePage id="policies">
      <PoliciesPage />
    </SitePage>
  );
}
