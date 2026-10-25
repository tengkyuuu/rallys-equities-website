import { z } from 'zod';

/* Form submissions — shared by the browser forms and the /api/submissions routes, so
   the server enforces exactly the shape the forms send. Every field is bounded; free
   text is trimmed. Rows land in Supabase `form_submissions` (kind, reference, data, files). */

const text = (max = 200) => z.string().trim().max(max).default('');
const required = (max = 200) => z.string().trim().min(2, 'Required').max(max);
// as lenient as the forms' own check, so nothing the form accepts is rejected here
const email = z
  .string()
  .trim()
  .max(254)
  .refine((v) => /^[^\s@]+@[^\s@]+$/.test(v), 'Invalid email');
const optionalEmail = z.union([z.literal(''), email]).default('');
const message = z.string().trim().min(3, 'Required').max(5000);

export const SUBMISSION_SCHEMAS = {
  contact: z.object({ name: required(), email, phone: text(40), subject: required(), message }),
  complaint: z.object({ name: required(), email, phone: text(40), category: required(), message, source: text(60) }),
  feedback: z.object({
    name: required(),
    email: optionalEmail,
    phone: text(40),
    subject: text(),
    category: required(),
    message,
    source: text(60),
  }),
  career: z.object({
    name: required(),
    email,
    phone: text(40),
    position: required(),
    coverLetter: z.string().trim().max(5000).default(''),
  }),
  application: z.object({
    reference: z.string().regex(/^RE-\d{4}-\d{5}$/),
    firstName: required(80),
    lastName: required(80),
    fatherOrHusband: text(120),
    cnic: z
      .string()
      .trim()
      .regex(/^\d{5}-\d{7}-\d$/, 'CNIC must be 13 digits'),
    dob: text(20),
    gender: text(40),
    mobile: z.string().trim().min(9).max(40),
    email,
    address: text(500),
    city: text(80),
    province: text(80),
    employment: text(80),
    employer: text(120),
    income: text(80),
    sourceOfFunds: text(80),
    bank: text(80),
    iban: text(40),
    experience: text(80),
    objective: text(80),
    accountType: z.enum(['standard', 'halal', 'premium']),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
    language: z.enum(['english', 'urdu']),
    services: text(600),
  }),
} as const;

export type SubmissionKind = keyof typeof SUBMISSION_SCHEMAS;
export const SUBMISSION_KINDS = Object.keys(SUBMISSION_SCHEMAS) as SubmissionKind[];

/** Upload fields each form may send, with the file types its <input accept> allows. */
const DOCS = ['image/jpeg', 'image/png', 'application/pdf'];
export const UPLOAD_FIELDS: Partial<Record<SubmissionKind, Record<string, string[]>>> = {
  application: { cnicFront: DOCS, cnicBack: DOCS, addressProof: DOCS, photo: ['image/jpeg', 'image/png'] },
  career: { cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
};
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const uploadRequestSchema = z.object({
  kind: z.enum(SUBMISSION_KINDS as [SubmissionKind, ...SubmissionKind[]]),
  files: z
    .array(
      z.object({
        field: z.string().max(40),
        name: z.string().max(200),
        type: z.string().max(120),
        size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
      }),
    )
    .min(1)
    .max(4),
});

export const uploadedFileSchema = z.object({
  field: z.string().max(40),
  path: z.string().max(300),
  name: z.string().max(200),
  type: z.string().max(120),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});
export type UploadedFile = z.infer<typeof uploadedFileSchema>;

export const submissionRequestSchema = z.object({
  kind: z.enum(SUBMISSION_KINDS as [SubmissionKind, ...SubmissionKind[]]),
  data: z.record(z.string(), z.unknown()),
  files: z.array(uploadedFileSchema).max(4).default([]),
});

/** Storage path for an upload: `<kind>/<time>-<rand>-<field>-<safe name>`. */
export const UPLOAD_PATH = /^(contact|complaint|feedback|career|application)\/\d{13}-[a-z0-9]{6}-[A-Za-z]+-[A-Za-z0-9._-]{1,60}$/;
