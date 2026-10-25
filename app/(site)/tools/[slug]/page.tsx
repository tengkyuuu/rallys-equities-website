import { notFound } from 'next/navigation';
import CalculatorPage from '@/components/calculators/CalculatorPage';
import SitePage from '@/components/layout/SitePage';
import { CALCULATORS, type CalculatorId } from '@/lib/calculators/data';
import { getSiteContent } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { pathFor } from '@/lib/site';

const BY_SLUG = Object.fromEntries((Object.keys(CALCULATORS) as CalculatorId[]).map((id) => [pathFor(id).split('/').pop()!, id])) as Record<
  string,
  CalculatorId
>;

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
  const { calcInfo } = await getSiteContent();
  return (
    <SitePage id={id}>
      <CalculatorPage id={id} info={calcInfo?.[id]} />
    </SitePage>
  );
}
