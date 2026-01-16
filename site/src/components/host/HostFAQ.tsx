'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/layout';
import { cn } from '@/lib/utils';

interface HostFAQProps {
  items: Array<{ question: string; answer: string }>;
  hostName: string;
}

export function HostFAQ({ items, hostName }: HostFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <Container>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-text-secondary mb-8">
          Common questions about {hostName}
        </p>

        <div className="max-w-3xl mx-auto space-y-3">
          {items.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-foreground pr-4">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-text-secondary transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-4 text-sm text-text-secondary leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}
