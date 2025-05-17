export interface SendEmailJobData {
  to: string;
  subject: string;

  content: string;
  contentType?: 'html' | 'plain';
}
