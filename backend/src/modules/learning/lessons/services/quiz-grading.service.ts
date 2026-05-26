import { BadRequestException, Injectable } from "@nestjs/common";
import {
  LessonQuestionForSubmission,
  QuizEvaluation,
  QuizSubmissionAnswer,
} from "../interfaces/quiz-submission.types";

@Injectable()
export class QuizGradingService {
  gradeQuiz(
    questions: LessonQuestionForSubmission[],
    answers: QuizSubmissionAnswer[]
  ): QuizEvaluation {
    const answerMap = new Map(
      answers.map((answer) => [answer.questionId, answer])
    );

    if (answerMap.size !== answers.length) {
      throw new BadRequestException("Duplicate answers are not allowed");
    }

    if (answers.length !== questions.length) {
      throw new BadRequestException("All questions must be answered");
    }

    const questionIds = new Set(questions.map((question) => question.id));
    const invalidQuestionIds = answers
      .map((answer) => answer.questionId)
      .filter((questionId) => !questionIds.has(questionId));

    if (invalidQuestionIds.length > 0) {
      throw new BadRequestException(
        `Unknown question id: ${invalidQuestionIds[0]}`
      );
    }

    const normalizedAnswers = questions.map((question) => {
      const userAnswer = answerMap.get(question.id);
      if (!userAnswer) {
        throw new BadRequestException("All questions must be answered");
      }

      const selectedOption = question.options.find(
        (option) => option.id === userAnswer.optionId
      );

      if (!selectedOption) {
        throw new BadRequestException(
          `Invalid option for question ${question.id}`
        );
      }

      const correctOption =
        question.options.find((option) => option.isCorrect) ?? null;

      return {
        questionId: question.id,
        selectedOptionId: selectedOption.id,
        isCorrect: selectedOption.isCorrect,
        correctOptionId: correctOption?.id ?? null,
        explanation: question.explanation,
      };
    });

    const correctCount = normalizedAnswers.filter(
      (answer) => answer.isCorrect
    ).length;
    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    return {
      normalizedAnswers,
      correctCount,
      totalQuestions,
      score,
    };
  }
}
