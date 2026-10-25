import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import FeatureBand from '@/components/home/FeatureBand';
import FeedbackSection from '@/components/home/FeedbackSection';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import Performers from '@/components/home/Performers';
import Regulatory from '@/components/home/Regulatory';
import ServicesPreview from '@/components/home/ServicesPreview';
import Skyline from '@/components/home/Skyline';
import StatsBand from '@/components/home/StatsBand';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CtaBlock from '@/components/ui/CtaBlock';
import LuxDivider from '@/components/ui/LuxDivider';

/**
 * The home page, top to bottom. The ORDER and number of top-level elements matter: the
 * client's saved editor edits are keyed by position (README → Content editing). Add new
 * sections only at the end, and never wrap these in an extra element.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBand />
      <FeatureBand />
      <ServicesPreview />
      <LuxDivider />
      <HowItWorks />
      <WhyChooseUs />
      <Skyline />
      <LuxDivider />
      <Performers />
      <Regulatory />
      {/* Jama Punji used to sit here, under the regulator strip. The client asked for it NOT to appear alongside the regulators (it is an SECP investor-education portal, not a regulator of ours); it is now a band at the very bottom of the footer. */}
      <CtaBlock
        style={{ marginTop: '72px' }}
        title={
          <>
            Start Investing in Pakistan's <em>Growth</em> <span>Today</span>
          </>
        }
        urdu="آج ہی شروع کریں — پاکستان کے مستقبل میں سرمایہ لگائیں"
        text="Invest with confidence through Rallys Equities — your trusted partner in smart investing. Open your PSX account online and trade with competitive brokerage rates."
        actions={
          <>
            <OpenAccount as="button" className="bbig bbig-g">
              Open Your Account — کھاتہ کھولیں
            </OpenAccount>{' '}
            <GoTo as="button" page="locations" className="bbig bbig-o">
              Visit Our Office
            </GoTo>
          </>
        }
        notes={['SECP regulated', 'PSX licensed', 'Competitive rates', 'Shariah-compliant investing']}
      />
      <FeedbackSection />
    </>
  );
}
