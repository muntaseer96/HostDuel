import { Suspense } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ResultsCard } from '@/components/quiz/ResultsCard';
import { getAllTableRows } from '@/lib/data';
import { getRecommendations, paramsToAnswers, QUIZ_QUESTIONS } from '@/lib/quiz-engine';
import type { QuizResultsParams } from '@/types/quiz';
import { RotateCcw, Share2, ArrowRight, Trophy, CheckCircle } from 'lucide-react';

interface PageProps {
  searchParams: Promise<QuizResultsParams>;
}

// Summary of user choices
function AnswersSummary({ params }: { params: QuizResultsParams }) {
  const answers = paramsToAnswers(params);

  const summaryItems = [
    { label: 'Building', value: answers.buildingType },
    { label: 'Level', value: answers.technicalLevel },
    { label: 'Traffic', value: answers.expectedTraffic },
    { label: 'Budget', value: answers.budget ? `$${answers.budget}/mo` : null },
    { label: 'CMS', value: answers.cmsPreference },
    { label: 'Priority', value: answers.priority },
  ].filter(item => item.value);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="px-3 py-1.5 bg-bg-elevated rounded-full text-sm"
        >
          <span className="text-text-muted">{item.label}:</span>{' '}
          <span className="text-foreground font-medium capitalize">{item.value}</span>
        </div>
      ))}
      {answers.mustHaveFeatures.length > 0 && (
        <div className="px-3 py-1.5 bg-bg-elevated rounded-full text-sm">
          <span className="text-text-muted">Features:</span>{' '}
          <span className="text-foreground font-medium">{answers.mustHaveFeatures.length} selected</span>
        </div>
      )}
    </div>
  );
}

// Share button with copy functionality
function ShareButton({ url }: { url: string }) {
  return (
    <Button
      variant="outline"
      size="md"
      className="gap-2"
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(url);
        }
      }}
    >
      <Share2 className="w-4 h-4" />
      Share Results
    </Button>
  );
}

async function ResultsContent({ searchParams }: { searchParams: QuizResultsParams }) {
  const hosts = await getAllTableRows();
  const answers = paramsToAnswers(searchParams);
  const recommendations = getRecommendations(hosts, answers, 3);

  // Check if we have valid answers
  const hasAnswers = Object.values(answers).some(v =>
    v !== null && (Array.isArray(v) ? v.length > 0 : true)
  );

  if (!hasAnswers) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-6">
          <RotateCcw className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No Quiz Data Found</h2>
        <p className="text-text-secondary mb-8">
          It looks like you haven&apos;t completed the quiz yet.
        </p>
        <Link href="/quiz">
          <Button variant="primary" size="lg">
            Take the Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No Matches Found</h2>
        <p className="text-text-secondary mb-8">
          We couldn&apos;t find hosts matching your criteria. Try adjusting your requirements.
        </p>
        <Link href="/quiz">
          <Button variant="primary" size="lg">
            Retake Quiz
            <RotateCcw className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Results header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full mb-4">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-success">Quiz Complete</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Your Top Hosting Matches
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Based on your answers, here are the {recommendations.length} best hosting providers for your needs.
        </p>
      </div>

      {/* Answers summary */}
      <div className="mb-12">
        <AnswersSummary params={searchParams} />
      </div>

      {/* Results grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {recommendations.map((result, index) => (
          <ResultsCard
            key={result.host.id}
            result={result}
            rank={index}
          />
        ))}
      </div>

      {/* Comparison table mini */}
      <div className="bg-bg-secondary rounded-2xl border border-border-subtle p-6 mb-12">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Host</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">Match</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">Price</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">Rating</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((result, index) => (
                <tr key={result.host.id} className="border-b border-border-subtle/50 last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-accent text-background' : 'bg-bg-tertiary text-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">{result.host.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-accent font-bold">{result.score}%</span>
                  </td>
                  <td className="py-3 px-4 text-center text-foreground">
                    {result.host.monthlyPrice ? `$${result.host.monthlyPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {result.host.overallRating ? (
                      <span className="flex items-center justify-center gap-1">
                        <span className="text-yellow-400">&#9733;</span>
                        {result.host.overallRating.toFixed(1)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-foreground">
                    {result.host.uptimeGuarantee ? `${result.host.uptimeGuarantee}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/quiz">
          <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="lg" className="gap-2 w-full sm:w-auto">
            View All Hosts
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </>
  );
}

export default async function QuizResultsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-bg-primary py-8 md:py-16">
      <Container size="lg">
        <Suspense
          fallback={
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Finding your perfect hosts...</p>
            </div>
          }
        >
          <ResultsContent searchParams={params} />
        </Suspense>
      </Container>
    </main>
  );
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const answers = paramsToAnswers(params);

  let title = 'Your Hosting Recommendations';
  if (answers.buildingType) {
    title = `Best Hosting for ${answers.buildingType.charAt(0).toUpperCase() + answers.buildingType.slice(1)}`;
  }

  return {
    title: `${title} | Hosting Comparison Tool`,
    description: 'Personalized hosting recommendations based on your specific needs and preferences.',
  };
}
