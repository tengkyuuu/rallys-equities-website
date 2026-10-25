import PageLink from '@/components/nav/PageLink';
import { HomeComplaintForm, HomeFeedbackForm } from '@/components/forms/HomeFeedbackForms';
import SectionTitle from '@/components/ui/SectionTitle';

/** Feedback and complaint forms. Deliberately the LAST section of the home page: the client's saved editor overrides use positional keys, so anything inserted before it would re-point them. Form ids are prefixed h* so they never collide with the /feedback and /complaints forms. */
export default function FeedbackSection() {
  return (
    <section className="sec sec-alt" id="home-feedback">
      <div style={{ textAlign: 'center' }}>
        <SectionTitle tag="We're Listening">
          Feedback &amp; <em>Complaints</em>
        </SectionTitle>
        <p className="sub" style={{ margin: '14px auto 0' }}>
          Tell us how we're doing, or raise a formal complaint — both reach us directly.
        </p>
      </div>
      <div className="fbc-grid">
        {/* FEEDBACK */}
        <div>
          <div className="fbc-head">
            <span className="fbc-ic fbc-ic-fb">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
            </span>
            Share your feedback
          </div>
          <HomeFeedbackForm />
        </div>
        {/* COMPLAINT */}
        <div>
          <div className="fbc-head cx">
            <span className="fbc-ic fbc-ic-cx">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            Lodge a complaint
          </div>
          <HomeComplaintForm />
          <p className="sub" style={{ fontSize: '11.5px', marginTop: '14px' }}>
            Not satisfied with our resolution? You can escalate to the regulators — see{' '}
            <PageLink page="portal" style={{ color: 'var(--g3)', cursor: 'pointer', textDecoration: 'underline' }}>
              Investor Portal
            </PageLink>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
