import { Metadata } from 'next';
import { Container } from '@/components/layout';
import { SITE_NAME } from '@/lib/constants';
import { Mail, MessageSquare, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Get in touch with ${SITE_NAME}. Questions, feedback, or data corrections - we'd love to hear from you.`,
};

const contactOptions = [
  {
    icon: Mail,
    title: 'General Inquiries',
    email: 'hello@hostduel.com',
    description: 'Questions about our service, partnerships, or general feedback.',
  },
  {
    icon: AlertCircle,
    title: 'Data Corrections',
    email: 'data@hostduel.com',
    description: 'Found outdated or incorrect information? Let us know and we\'ll update it.',
  },
  {
    icon: MessageSquare,
    title: 'Press & Media',
    email: 'press@hostduel.com',
    description: 'Media inquiries, interview requests, or press-related questions.',
  },
];

export default function Contact() {
  return (
    <section className="py-16">
      <Container size="md">
        <h1 className="text-3xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-lg text-text-secondary mb-12">
          Have a question or feedback? We&apos;d love to hear from you.
        </p>

        <div className="space-y-6">
          {contactOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.email}
                className="bg-bg-secondary rounded-lg p-6 border border-border-subtle"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                      {option.title}
                    </h2>
                    <p className="text-text-muted text-sm mb-3">
                      {option.description}
                    </p>
                    <a
                      href={`mailto:${option.email}`}
                      className="text-accent hover:underline font-medium"
                    >
                      {option.email}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-bg-secondary rounded-lg border border-border-subtle">
          <h2 className="text-lg font-semibold text-foreground mb-4">Before You Reach Out</h2>
          <div className="space-y-4 text-text-secondary">
            <p>
              <strong className="text-foreground">Looking for hosting recommendations?</strong><br />
              Try our <a href="/quiz" className="text-accent hover:underline">Hosting Quiz</a> to
              get personalized suggestions based on your needs.
            </p>
            <p>
              <strong className="text-foreground">Want to compare specific hosts?</strong><br />
              Use our <a href="/compare" className="text-accent hover:underline">comparison tool</a> to
              see detailed side-by-side breakdowns.
            </p>
            <p>
              <strong className="text-foreground">Curious about our ratings?</strong><br />
              Read our <a href="/methodology" className="text-accent hover:underline">methodology page</a> to
              understand how we evaluate hosting providers.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-text-muted text-sm">
          <p>We typically respond within 1-2 business days.</p>
        </div>
      </Container>
    </section>
  );
}
