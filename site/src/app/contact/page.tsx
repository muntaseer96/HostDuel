'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const contactReasons = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'data-correction', label: 'Data Correction' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className="py-16">
        <Container size="sm">
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-6">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Message Sent!</h1>
            <p className="text-text-secondary mb-6">
              Thanks for reaching out. We&apos;ll get back to you within 1-2 business days.
            </p>
            <Button variant="outline" onClick={() => setStatus('idle')}>
              Send Another Message
            </Button>
          </Card>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16">
      <Container size="sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-text-secondary">
            Have a question, found incorrect data, or want to partner with us? We&apos;d love to hear from you.
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Hidden fields for Netlify */}
            <input type="hidden" name="form-name" value="contact" />
            <p className="hidden">
              <label>
                Don&apos;t fill this out: <input name="bot-field" />
              </label>
            </p>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 rounded-lg bg-bg-elevated border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-bg-elevated border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
                Reason for Contact
              </label>
              <select
                id="reason"
                name="reason"
                required
                className="w-full px-4 py-3 rounded-lg bg-bg-elevated border border-border-subtle text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="">Select a reason...</option>
                {contactReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-bg-elevated border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                placeholder="How can we help you?"
              />
            </div>

            {/* Error message */}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-error text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Something went wrong. Please try again.</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                'Sending...'
              ) : (
                <>
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-text-muted text-sm">
          We typically respond within 1-2 business days.
        </p>
      </Container>
    </section>
  );
}
