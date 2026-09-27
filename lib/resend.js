import { Resend } from 'resend';

export function resendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}
