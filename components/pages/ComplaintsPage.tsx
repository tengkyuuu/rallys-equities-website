import ComplaintForm from '@/components/forms/ComplaintForm';
import PageLink from '@/components/nav/PageLink';
import FormWithAside from '@/components/support/FormWithAside';
import OfficeContact from '@/components/support/OfficeContact';
import PageHero from '@/components/ui/PageHero';
import ServiceCard from '@/components/ui/ServiceCard';

export default function ComplaintsPage() {
  return (
    <>
      <PageHero
        tag="Support"
        title={
          <>
            Submit Your <em>Complaint</em>
          </>
        }
        lede="We resolve concerns quickly and transparently. Tell us what happened."
      />
      <FormWithAside
        form={<ComplaintForm />}
        aside={
          <ServiceCard
            style={{ alignSelf: 'start' }}
            title="Other ways to escalate"
            titleStyle={{ color: 'var(--au)' }}
            footer={
              <>
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    className="svc-link"
                    href="https://www.psx.com.pk/psx/resources-and-tools/investors/investors-complaints"
                    target="_blank"
                    rel="noopener"
                  >
                    PSX Online Complaint Portal →
                  </a>{' '}
                  <a className="svc-link" href="https://sdms.secp.gov.pk/" target="_blank" rel="noopener">
                    SECP Online Complaint Portal →
                  </a>{' '}
                  <a className="svc-link" href="mailto:hello@rallysequities.com">
                    Email: hello@rallysequities.com →
                  </a>
                </div>
                <OfficeContact />
                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--gb)',
                    fontSize: '11.5px',
                    color: 'var(--mt)',
                  }}
                >
                  Just have general feedback?{' '}
                  <PageLink page="feedback" style={{ color: 'var(--g3)', cursor: 'pointer', textDecoration: 'underline' }}>
                    Use the feedback form →
                  </PageLink>
                </div>
              </>
            }
          >
            If your concern remains unresolved, you may escalate directly to the regulators:
          </ServiceCard>
        }
      />
    </>
  );
}
