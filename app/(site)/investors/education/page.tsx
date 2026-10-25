import SitePage from '@/components/layout/SitePage';
import EducationPage from '@/components/pages/EducationPage';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('education');

export default function Page() {
  return (
    <SitePage id="education">
      <EducationPage />
    </SitePage>
  );
}
