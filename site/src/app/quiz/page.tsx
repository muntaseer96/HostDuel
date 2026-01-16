'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { QuizProgress } from '@/components/quiz/QuizProgress';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { QUIZ_QUESTIONS, answersToParams } from '@/lib/quiz-engine';
import { defaultQuizAnswers } from '@/types/quiz';
import type {
  QuizAnswers,
  BuildingType,
  TechnicalLevel,
  TrafficLevel,
  BudgetRange,
  CMSPreference,
  Priority,
  MustHaveFeature,
} from '@/types/quiz';
import { ArrowLeft, ArrowRight, SkipForward, Sparkles } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(defaultQuizAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1;
  const isFirstStep = currentStep === 0;

  // Get current answer for the step
  const getCurrentAnswer = useCallback(() => {
    switch (currentStep) {
      case 0: return answers.buildingType;
      case 1: return answers.technicalLevel;
      case 2: return answers.expectedTraffic;
      case 3: return answers.budget;
      case 4: return answers.mustHaveFeatures;
      case 5: return answers.cmsPreference;
      case 6: return answers.priority;
      default: return null;
    }
  }, [currentStep, answers]);

  // Handle option selection
  const handleSelect = useCallback((value: unknown) => {
    const newAnswers = { ...answers };

    switch (currentStep) {
      case 0:
        newAnswers.buildingType = value as BuildingType;
        break;
      case 1:
        newAnswers.technicalLevel = value as TechnicalLevel;
        break;
      case 2:
        newAnswers.expectedTraffic = value as TrafficLevel;
        break;
      case 3:
        newAnswers.budget = value as BudgetRange;
        break;
      case 4:
        // Multi-select for features
        const feature = value as MustHaveFeature;
        const features = [...newAnswers.mustHaveFeatures];
        const index = features.indexOf(feature);
        if (index === -1) {
          features.push(feature);
        } else {
          features.splice(index, 1);
        }
        newAnswers.mustHaveFeatures = features;
        break;
      case 5:
        newAnswers.cmsPreference = value as CMSPreference;
        break;
      case 6:
        newAnswers.priority = value as Priority;
        break;
    }

    setAnswers(newAnswers);

    // Auto-advance for single-select questions (not step 4 which is multi-select)
    if (currentStep !== 4 && !isLastStep) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 300);
    }
  }, [currentStep, answers, isLastStep]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (isLastStep) {
      // Submit and go to results
      setIsSubmitting(true);
      const params = answersToParams(answers);
      router.push(`/quiz/results?${params}`);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep, answers, router]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep]);

  // Check if current step has an answer
  const hasAnswer = () => {
    const answer = getCurrentAnswer();
    if (Array.isArray(answer)) {
      return true; // Multi-select can be empty
    }
    return answer !== null;
  };

  return (
    <main className="min-h-screen bg-bg-primary py-8 md:py-16">
      <Container size="md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Find Your Perfect Host</span>
          </div>
        </div>

        {/* Progress */}
        <QuizProgress
          currentStep={currentStep}
          totalSteps={QUIZ_QUESTIONS.length}
          className="mb-12"
        />

        {/* Question */}
        <div className="min-h-[400px] flex items-start justify-center">
          <QuizQuestion
            question={currentQuestion.question}
            subtitle={currentQuestion.subtitle}
            options={currentQuestion.options as { value: string; label: string; description: string }[]}
            selectedValue={getCurrentAnswer() as string | string[] | null}
            multiSelect={currentQuestion.multiSelect}
            onSelect={handleSelect}
          />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="gap-2 text-text-muted"
              >
                Skip
                <SkipForward className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isLastStep && !hasAnswer()}
              isLoading={isSubmitting}
              className="gap-2 min-w-[140px]"
            >
              {isLastStep ? (
                <>
                  Get Results
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 text-center text-sm text-text-muted">
          <p>Your answers help us find the best hosting match for your needs.</p>
          <p className="mt-1">You can always go back and change your answers.</p>
        </div>
      </Container>
    </main>
  );
}
