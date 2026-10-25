import SitePage from '@/components/layout/SitePage';
import FaqPage from '@/components/pages/FaqPage';
import JsonLd from '@/components/seo/JsonLd';
import { FAQ } from '@/lib/faq';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('faq');

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })),
};

export default function Page() {
  return (
    <>
      <JsonLd data={FAQ_LD} />
      <SitePage id="faq">
        <FaqPage />
      </SitePage>
    </>
  );
}
