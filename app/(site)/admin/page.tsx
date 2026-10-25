import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AdminBridge from '@/components/admin/AdminBridge';
import CalculatorPage from '@/components/calculators/CalculatorPage';
import AboutPage from '@/components/pages/AboutPage';
import AwarenessPage from '@/components/pages/AwarenessPage';
import BlogPage from '@/components/pages/BlogPage';
import CareersPage from '@/components/pages/CareersPage';
import ComplaintsPage from '@/components/pages/ComplaintsPage';
import ContactPage from '@/components/pages/ContactPage';
import DownloadsPage from '@/components/pages/DownloadsPage';
import EducationPage from '@/components/pages/EducationPage';
import FaqPage from '@/components/pages/FaqPage';
import FeedbackPage from '@/components/pages/FeedbackPage';
import FinancialPage from '@/components/pages/FinancialPage';
import GovernancePage from '@/components/pages/GovernancePage';
import HomePage from '@/components/pages/HomePage';
import LinksPage from '@/components/pages/LinksPage';
import ManagementPage from '@/components/pages/ManagementPage';
import MarketsPage from '@/components/pages/MarketsPage';
import MissionPage from '@/components/pages/MissionPage';
import OpenAccountPage from '@/components/pages/OpenAccountPage';
import PoliciesPage from '@/components/pages/PoliciesPage';
import PortalPage from '@/components/pages/PortalPage';
import PostPage from '@/components/pages/PostPage';
import RatingPage from '@/components/pages/RatingPage';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import ServicesPage from '@/components/pages/ServicesPage';
import type { CalculatorId } from '@/lib/calculators/data';
import { SERVICE_PAGES, type ServicePageId } from '@/lib/services';
import { PAGE_IDS, type PageId } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Website Admin — Rallys Equities',
  robots: { index: false, follow: false },
};

const service = (id: ServicePageId) => <ServiceDetailPage service={SERVICE_PAGES[id]} />;
const calc = (id: CalculatorId) => <CalculatorPage id={id} admin />;

/* Every page with its shipped defaults: the editor applies the draft itself, and fetches
   this very page as its reference copy of the untouched markup ("put back the original
   wording"). Rendered in PAGE_IDS order, the original single-page site's document order. */
const RENDER: Record<PageId, () => ReactNode> = {
  home: () => <HomePage />,
  services: () => <ServicesPage />,
  markets: () => <MarketsPage />,
  locations: () => <ContactPage />,
  about: () => <AboutPage />,
  account: () => <OpenAccountPage />,
  mission: () => <MissionPage />,
  management: () => <ManagementPage />,
  rating: () => <RatingPage />,
  governance: () => <GovernancePage />,
  trading: () => service('trading'),
  corporate: () => service('corporate'),
  portfolio: () => service('portfolio'),
  research: () => service('research'),
  shariah: () => service('shariah'),
  platforms: () => service('platforms'),
  support: () => service('support'),
  portal: () => <PortalPage />,
  education: () => <EducationPage />,
  financial: () => <FinancialPage />,
  awareness: () => <AwarenessPage />,
  policies: () => <PoliciesPage />,
  cagr: () => calc('cagr'),
  sip: () => calc('sip'),
  invest: () => calc('invest'),
  depr: () => calc('depr'),
  xrate: () => calc('xrate'),
  dcf: () => calc('dcf'),
  fcf: () => calc('fcf'),
  drawdown: () => calc('drawdown'),
  faq: () => <FaqPage />,
  downloads: () => <DownloadsPage />,
  links: () => <LinksPage />,
  complaints: () => <ComplaintsPage />,
  careers: () => <CareersPage />,
  feedback: () => <FeedbackPage />,
  insights: () => <BlogPage />,
  post: () => <PostPage />,
};

export default function AdminPage() {
  return (
    <>
      {PAGE_IDS.map((id) => (
        <div key={id} className={id === 'home' ? 'page active' : 'page'} id={`page-${id}`}>
          {RENDER[id]()}
        </div>
      ))}
      <AdminBridge />
    </>
  );
}
