/* Policies that open in the view-only document viewer. Titles and file paths come from
   this whitelist only, so markup can never point the viewer at an arbitrary URL. */
export const POLICY_DOCS = {
  'aml-cft-policy': 'Anti-Money Laundering (AML) & Countering Financing of Terrorism (CFT)',
  'internal-controls-policy': 'Internal Controls Policy',
  'conflict-of-interest-policy': 'Conflict of Interest — Resolution Policy',
  'unethical-conduct-market-abuse': 'Policy on Unethical Conduct & Market Abuse',
  'complaint-policy': 'Complaint Policy',
  'customer-grievance-redressal': 'Customer Grievance Redressal Policy',
  'orders-recording-policy': 'Orders Recording Policy',
  'authorization-order-placement': 'Authorization for Order Placement',
  'client-access-online-trading': 'Allowing Client Access to Online Trading Services',
  'record-retention-policy': 'Record Retention Policy',
  'disaster-recovery-contingency-plan': 'Disaster Recovery & Contingency Plan',
} as const;

export type PolicySlug = keyof typeof POLICY_DOCS;

/** Shorter labels for the compact list on /downloads; other policies use their full title. */
export const POLICY_SHORT_TITLES: Partial<Record<PolicySlug, string>> = {
  'aml-cft-policy': 'Anti-Money Laundering (AML) & CFT',
  'unethical-conduct-market-abuse': 'Unethical Conduct & Market Abuse',
  'client-access-online-trading': 'Client Access to Online Trading Services',
};

export const isPolicySlug = (s: string): s is PolicySlug => Object.hasOwn(POLICY_DOCS, s);

/* #toolbar=0 hides Chrome/Edge's PDF download + print buttons (Firefox ignores it). */
export const policyViewerSrc = (slug: PolicySlug) => `/assets/policies/${slug}.pdf#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=FitH`;
