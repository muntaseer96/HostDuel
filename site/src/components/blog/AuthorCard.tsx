import Image from 'next/image';
import { Twitter, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { Author } from '@/types/blog';

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="h-8 w-8 text-accent" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{author.name}</h3>
              {author.twitter && (
                <a
                  href={`https://twitter.com/${author.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-accent transition-colors"
                  aria-label={`Follow ${author.name} on Twitter`}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
            {author.bio && (
              <p className="mt-1 text-sm text-text-secondary">{author.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
