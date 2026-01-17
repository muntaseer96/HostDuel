import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { Container } from '@/components/layout';
import {
  BlogMeta,
  TableOfContents,
  ShareButtons,
  AuthorCard,
  RelatedPosts,
} from '@/components/blog';
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '@/lib/blog-data';
import { extractHeadings, slugify } from '@/lib/blog';
import { SITE_NAME, SITE_DOMAIN } from '@/lib/constants';
import { ChevronRight, Home } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const url = `${SITE_DOMAIN}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url,
      publishedTime: post.date,
      modifiedTime: post.updatedDate || post.date,
      authors: [post.author.name],
      images: post.image ? [post.image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : undefined,
    },
  };
}

// Custom MDX components with heading IDs for TOC
const mdxComponents = {
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof children === 'string' ? children : '';
    const id = slugify(text);
    return (
      <h2 id={id} className="scroll-mt-24" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof children === 'string' ? children : '';
    const id = slugify(text);
    return (
      <h3 id={id} className="scroll-mt-24" {...props}>
        {children}
      </h3>
    );
  },
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith('http');
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href || '#'} className="text-accent hover:underline" {...props}>
        {children}
      </Link>
    );
  },
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headings = extractHeadings(post.content);
  const relatedPosts = await getRelatedPosts(post.slug, post.category, post.tags);
  const postUrl = `${SITE_DOMAIN}/blog/${post.slug}`;

  // JSON-LD Structured Data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_DOMAIN}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_DOMAIN,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_DOMAIN}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="py-12">
        <Container>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-secondary truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="max-w-3xl mb-10">
            <BlogMeta
              date={post.date}
              updatedDate={post.updatedDate}
              readingTime={post.readingTime}
              category={post.category}
            />
            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-text-secondary">{post.description}</p>
          </header>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-[1fr_280px] gap-10">
            {/* Article Content */}
            <div className="min-w-0">
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-text-secondary prose-a:text-accent prose-strong:text-foreground prose-code:text-accent prose-code:bg-bg-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border-subtle prose-blockquote:border-accent prose-blockquote:text-text-secondary prose-li:text-text-secondary prose-img:rounded-xl">
                <MDXRemote
                  source={post.content}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                    },
                  }}
                />
              </div>

              {/* Share Buttons */}
              <div className="mt-10 pt-6 border-t border-border-subtle">
                <ShareButtons url={postUrl} title={post.title} />
              </div>

              {/* Author Card */}
              <div className="mt-8">
                <AuthorCard author={post.author} />
              </div>
            </div>

            {/* Sidebar with TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents items={headings} />
              </div>
            </aside>
          </div>

          {/* Mobile TOC (shown at top on mobile, below header) */}
          <div className="lg:hidden mt-8 mb-10">
            <TableOfContents items={headings} />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-border-subtle">
              <RelatedPosts posts={relatedPosts} />
            </div>
          )}
        </Container>
      </article>
    </>
  );
}
