import SitePage from '@/components/layout/SitePage';
import ContactPage from '@/components/pages/ContactPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('locations');

export default function Page() {
  return (
    <SitePage id="locations">
      <ContactPage />
    </SitePage>
  );
}
