import { notFound } from 'next/navigation';
import SitePage from '@/components/layout/SitePage';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import { pageMetadata } from '@/lib/metadata';
import { SERVICE_PAGES, type ServicePageId } from '@/lib/services';
import { pathFor } from '@/lib/site';

const BY_SLUG = Object.fromEntries(
  (Object.keys(SERVICE_PAGES) as ServicePageId[]).map((id) => [pathFor(id).split('/').pop()!, id]),
) as Record<string, ServicePageId>;

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(BY_SLUG).map((slug) => ({ slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const id = BY_SLUG[(await params).slug];
  return id ? pageMetadata(id) : {};
}

export default async function Page({ params }: Props) {
  const id = BY_SLUG[(await params).slug];
  if (!id) notFound();
  return (
    <SitePage id={id}>
      <ServiceDetailPage service={SERVICE_PAGES[id]} />
    </SitePage>
  );
}
