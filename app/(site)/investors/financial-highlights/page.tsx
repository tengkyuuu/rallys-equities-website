import SitePage from '@/components/layout/SitePage';
import FinancialPage from '@/components/pages/FinancialPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('financial');

export default function Page() {
  return (
    <SitePage id="financial">
      <FinancialPage />
    </SitePage>
  );
}
