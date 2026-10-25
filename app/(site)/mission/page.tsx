import SitePage from '@/components/layout/SitePage';
import MissionPage from '@/components/pages/MissionPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('mission');

export default function Page() {
  return (
    <SitePage id="mission">
      <MissionPage />
    </SitePage>
  );
}
