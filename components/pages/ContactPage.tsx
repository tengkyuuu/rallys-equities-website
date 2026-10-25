import ContactDetails from '@/components/contact/ContactDetails';
import OfficeMap from '@/components/contact/OfficeMap';
import ContactForm from '@/components/forms/ContactForm';
import SectionTitle from '@/components/ui/SectionTitle';

export default function ContactPage() {
  return (
    <>
      <section className="sec">
        <div style={{ textAlign: 'center' }}>
          <SectionTitle tag="Contact Us">
            Connect with Your <em>Trusted Brokerage</em> in PSX
          </SectionTitle>{' '}
          <span className="urdu">پی ایس ایکس میں آپ کے قابلِ اعتماد بروکر سے رابطہ</span>{' '}
          <p className="sub" style={{ margin: '12px auto 0' }}>
            Opening an account, need trading support, or exploring a corporate partnership? Our Lahore team is here to help — in Urdu and
            English. Walk in to our head office, or open your account online in minutes.
          </p>
        </div>
        <div className="ct-wrap">
          <ContactDetails />
          {/* Message form */}
          <div className="ct-formcard" id="contact-form">
            <div className="ct-eyebrow">Send a message</div>
            <h3>We'd love to hear from you</h3>
            <p className="ct-lede">
              Fill in the form and our team will reply at the email you provide. For urgent matters, call 042-36366667.
            </p>
            <ContactForm />
          </div>
        </div>
        <OfficeMap />
      </section>
    </>
  );
}
