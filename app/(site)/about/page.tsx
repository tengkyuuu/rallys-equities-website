import SitePage from '@/components/layout/SitePage';
import AboutPage from '@/components/pages/AboutPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('about');

export default function Page() {
  return (
    <SitePage id="about">
      <AboutPage />
    </SitePage>
  );
}
