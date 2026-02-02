/**
 * Resend email helpers for GoKart Part Picker
 * Uses templates in /emails/resend/
 */

import { Resend } from 'resend';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://gokartpartpicker.com';
const fromAddress =
  process.env.RESEND_FROM_EMAIL || 'GoKart Part Picker <noreply@gokartpartpicker.com>';

function getTemplatePath(name: string): string {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, '..', 'emails', 'resend', name),
    join(cwd, 'emails', 'resend', name),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error(`Resend template not found: ${name}. Check emails/resend/`);
}

export interface SendVerifyAccountParams {
  to: string;
  confirmationUrl: string;
  siteUrl?: string;
}

/**
 * Send the account verification email using the Resend template.
 * Requires RESEND_API_KEY. Optional RESEND_FROM_EMAIL (defaults to noreply@gokartpartpicker.com).
 */
export async function sendVerifyAccountEmail({
  to,
  confirmationUrl,
  siteUrl: customSiteUrl,
}: SendVerifyAccountParams): Promise<{ id?: string; error?: Error }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { error: new Error('RESEND_API_KEY is not set') };
  }

  const templatePath = getTemplatePath('verify-account.html');
  let html = readFileSync(templatePath, 'utf-8');
  const baseUrl = customSiteUrl || siteUrl;

  html = html
    .replace(/\{\{CONFIRMATION_URL\}\}/g, confirmationUrl)
    .replace(/\{\{SITE_URL\}\}/g, baseUrl)
    .replace(/\{\{EMAIL\}\}/g, to);

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: [to],
    subject: 'Verify your email – GoKart Part Picker',
    html,
  });

  if (error) return { error };
  return { id: data?.id };
}
