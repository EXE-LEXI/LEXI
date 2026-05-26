export class AttemptDetailLessonDto {
  id: string;
  title: string;
}

export class AttemptDetailModuleDto {
  id: string;
  title: string;
}

export class AttemptDetailCategoryDto {
  id: string;
  title: string;
}

export class AttemptOptionDto {
  id: string;
  text: string;
}

export class AttemptAnswerDto {
  questionId: string;
  questionText: string;
  explanation: string | null;
  isCorrect: boolean;
  selectedOption: AttemptOptionDto;
  correctOption: AttemptOptionDto | null;
}

export class AttemptDetailResponseDto {
  id: string;
  lesson: AttemptDetailLessonDto;
  module: AttemptDetailModuleDto;
  category: AttemptDetailCategoryDto;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  startedAt: Date;
  finishedAt: Date | null;
  answers: AttemptAnswerDto[];
}
