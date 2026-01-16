'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface NewsletterCTAProps {
  variant?: 'inline' | 'card';
}

export function NewsletterCTA({ variant = 'card' }: NewsletterCTAProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call - replace with actual newsletter integration
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For now, just show success
    setStatus('success');
    setEmail('');
  };

  if (status === 'success') {
    return (
      <div
        className={
          variant === 'card'
            ? 'p-6 rounded-xl bg-success/10 border border-success/20'
            : 'p-4 rounded-lg bg-success/10'
        }
      >
        <div className="flex items-center gap-3 text-success">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">You&apos;re subscribed!</p>
            <p className="text-sm text-success/80">
              Check your inbox for a confirmation email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-cyan-500/10 border border-accent/20">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-accent/20">
          <Mail className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Get hosting tips in your inbox</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Weekly insights on web hosting, performance tips, and exclusive deals.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? (
                'Subscribing...'
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          <p className="mt-2 text-xs text-text-muted">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
