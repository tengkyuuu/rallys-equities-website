/* Company contact facts used in more than one place (Contact page, footer, structured data).
   Change a number or link here, not in the markup. */

export const PHONES = {
  office: { display: '042-36366667', tel: '+924236366667' },
  mobile: { display: '0316-9991907', tel: '+923169991907' },
} as const;

export const WHATSAPP_URL = 'https://wa.me/923169991907';

export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/company/rallys-equities',
  instagram: 'https://www.instagram.com/rallyssequities/',
  facebook: 'https://www.facebook.com/profile.php?id=61584496977916',
} as const;

const OFFICE_QUERY = 'Lahore%20Stock%20Exchange%20Building%2C%20Khayaban-e-Aiwan-e-Iqbal%2C%20Lahore';

/** Google Maps directions to the head office, and the embeddable map. */
export const OFFICE_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${OFFICE_QUERY}`;
export const OFFICE_MAP_EMBED_URL = `https://maps.google.com/maps?q=${OFFICE_QUERY}&z=15&output=embed`;
