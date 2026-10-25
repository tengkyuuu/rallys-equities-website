import SitePage from '@/components/layout/SitePage';
import OpenAccountPage from '@/components/pages/OpenAccountPage';
import { getSiteContent } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('account');

export default async function Page() {
  const { pricing } = await getSiteContent();
  return (
    <SitePage id="account">
      <OpenAccountPage pricing={pricing} />
    </SitePage>
  );
}
