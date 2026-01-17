import Image from 'next/image';
import { Twitter, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { Author } from '@/types/blog';

// Default author data for HostDuel Team
const DEFAULT_AUTHOR: Author = {
  name: "HostDuel Team",
  avatar: "/images/authors/hostduel-team.jpg",
  bio: "The HostDuel team researches and compares web hosting providers to help you make informed decisions."
};

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  // Use default values for HostDuel Team if bio/avatar not provided
  const displayAuthor = author.name === "HostDuel Team"
    ? { ...DEFAULT_AUTHOR, ...author, avatar: author.avatar || DEFAULT_AUTHOR.avatar, bio: author.bio || DEFAULT_AUTHOR.bio }
    : author;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {displayAuthor.avatar ? (
              <Image
                src={displayAuthor.avatar}
                alt={displayAuthor.name}
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
              <h3 className="font-semibold text-foreground">{displayAuthor.name}</h3>
              {displayAuthor.twitter && (
                <a
                  href={`https://twitter.com/${displayAuthor.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-accent transition-colors"
                  aria-label={`Follow ${displayAuthor.name} on Twitter`}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
            {displayAuthor.bio && (
              <p className="mt-1 text-sm text-text-secondary">{displayAuthor.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
