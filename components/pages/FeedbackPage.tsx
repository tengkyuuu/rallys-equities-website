import FeedbackForm from '@/components/forms/FeedbackForm';
import PageLink from '@/components/nav/PageLink';
import FormWithAside from '@/components/support/FormWithAside';
import OfficeContact from '@/components/support/OfficeContact';
import PageHero from '@/components/ui/PageHero';
import ServiceCard from '@/components/ui/ServiceCard';

export default function FeedbackPage() {
  return (
    <>
      <PageHero
        tag="Support"
        title={
          <>
            Submit Your <em>Feedback</em>
          </>
        }
        lede="Your input helps us improve. Tell us about your experience."
      />
      <FormWithAside
        form={<FeedbackForm />}
        aside={
          <ServiceCard
            style={{ alignSelf: 'start' }}
            title="Have a complaint instead?"
            titleStyle={{ color: 'var(--au)' }}
            footer={
              <>
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <PageLink page="complaints" className="svc-link">
                    Submit a Complaint →
                  </PageLink>{' '}
                  <a className="svc-link" href="mailto:hello@rallysequities.com">
                    Email: hello@rallysequities.com →
                  </a>
                </div>
                <OfficeContact />
              </>
            }
          >
            This form is for general feedback and suggestions. If you have a formal complaint that needs a compliance response, use our
            dedicated complaint form instead.
          </ServiceCard>
        }
      />
    </>
  );
}
