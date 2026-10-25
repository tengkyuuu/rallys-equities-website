import SitePage from '@/components/layout/SitePage';
import ServicesPage from '@/components/pages/ServicesPage';
import { getSiteContent } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('services');

export default async function Page() {
  const { pricing } = await getSiteContent();
  return (
    <SitePage id="services">
      <ServicesPage pricing={pricing} />
    </SitePage>
  );
}
