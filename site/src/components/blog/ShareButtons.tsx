'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { getShareUrls } from '@/lib/blog';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrls = getShareUrls(url, title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-text-secondary mr-2">Share:</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="gap-2"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="gap-2"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="gap-2"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="gap-2"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-success" />
            <span className="hidden sm:inline text-success">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Copy link</span>
          </>
        )}
      </Button>
    </div>
  );
}
