export type QuizSubmissionAnswer = {
  questionId: string;
  optionId: string;
};

export type LessonQuestionForSubmission = {
  id: string;
  explanation: string | null;
  options: Array<{
    id: string;
    isCorrect: boolean;
  }>;
};

export type NormalizedAnswer = {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string | null;
  explanation: string | null;
};

export type QuizEvaluation = {
  normalizedAnswers: NormalizedAnswer[];
  correctCount: number;
  totalQuestions: number;
  score: number;
};
