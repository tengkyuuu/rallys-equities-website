import SitePage from '@/components/layout/SitePage';
import LinksPage from '@/components/pages/LinksPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('links');

export default function Page() {
  return (
    <SitePage id="links">
      <LinksPage />
    </SitePage>
  );
}
