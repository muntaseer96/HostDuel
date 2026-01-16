import { BookOpen } from 'lucide-react';

interface BlogHeroProps {
  title?: string;
  description?: string;
}

export function BlogHero({
  title = 'HostDuel Blog',
  description = 'Expert guides, comparisons, and tips to help you choose the perfect web hosting for your needs.',
}: BlogHeroProps) {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-6">
        <BookOpen className="h-8 w-8 text-accent" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
      <p className="text-lg text-text-secondary max-w-2xl mx-auto">{description}</p>
    </div>
  );
}
