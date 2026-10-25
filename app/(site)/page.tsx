import SitePage from '@/components/layout/SitePage';
import HomePage from '@/components/pages/HomePage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('home');

export default function Page() {
  return (
    <SitePage id="home">
      <HomePage />
    </SitePage>
  );
}
