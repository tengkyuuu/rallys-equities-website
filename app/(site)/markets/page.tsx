import SitePage from '@/components/layout/SitePage';
import MarketsPage from '@/components/pages/MarketsPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('markets');

export default function Page() {
  return (
    <SitePage id="markets">
      <MarketsPage />
    </SitePage>
  );
}
