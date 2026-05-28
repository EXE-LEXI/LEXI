import type { FormEvent } from "react";
import type { LessonDetail, QuizSubmission } from "../types/learning";
import { formatDate } from "../utils/format";
import { Button } from "../components/ui/Button";

type LessonPageProps = {
  lesson: LessonDetail | null;
  result: QuizSubmission | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onBack: () => void;
};

export function LessonPage({
  lesson,
  result,
  isLoading,
  isSubmitting,
  error,
  onSubmit,
  onBack,
}: LessonPageProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lesson) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const answers = Object.fromEntries(
      lesson.questions.map((question) => [
        question.id,
        String(formData.get(question.id) ?? ""),
      ])
    );

    await onSubmit(answers);
  }

  return (
    <main className="page">
      <button className="link-button back-button" type="button" onClick={onBack}>
        Back to modules
      </button>
      {isLoading ? <p className="notice">Loading lesson...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {lesson ? (
        <>
          <p className="eyebrow">
            {lesson.category.title} / {lesson.module.title}
          </p>
          <h1>{lesson.title}</h1>
          <article className="lesson-body panel">
            <div className="lesson-scroll">
              {lesson.videoUrl ? (
                <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                  Watch video
                </a>
              ) : null}
              <p>{lesson.content}</p>
            </div>
            <dl className="source-list legal-codex">
              <div>
                <dt>Source</dt>
                <dd>
                  {lesson.sourceUrl ? (
                    <a href={lesson.sourceUrl} target="_blank" rel="noreferrer">
                      {lesson.sourceTitle ?? lesson.sourceUrl}
                    </a>
                  ) : (
                    lesson.sourceTitle ?? "-"
                  )}
                </dd>
              </div>
              <div>
                <dt>Document</dt>
                <dd>{lesson.legalDocumentNo ?? "-"}</dd>
              </div>
              <div>
                <dt>Effective date</dt>
                <dd>{formatDate(lesson.effectiveDate)}</dd>
              </div>
              <div>
                <dt>Reviewed</dt>
                <dd>{formatDate(lesson.reviewedAt)}</dd>
              </div>
            </dl>
          </article>

          <form className="quiz-form" onSubmit={handleSubmit}>
            {lesson.questions.map((question, index) => (
              <fieldset className="panel question-card" key={question.id}>
                <legend>
                  Boss {index + 1}: {question.text}
                </legend>
                {question.options.map((option) => (
                  <label className="option-row" key={option.id}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      required
                    />
                    {option.text}
                  </label>
                ))}
              </fieldset>
            ))}
            <Button type="submit" disabled={isSubmitting || !lesson.questions.length}>
              {isSubmitting ? "Submitting..." : "Submit quiz"}
            </Button>
          </form>

          {result ? (
            <section className="panel result-panel">
              <h2>Battle Result: {result.score}%</h2>
              <p>
                {result.correctCount}/{result.totalQuestions} correct, XP +{result.xpAwarded}
              </p>
              <ul className="plain-list result-list">
                {result.results.map((item) => {
                  const question = lesson.questions.find(
                    (entry) => entry.id === item.questionId
                  );
                  return (
                    <li
                      className={item.isCorrect ? "answer-ok" : "answer-bad"}
                      key={item.questionId}
                    >
                      <strong>{question?.text ?? item.questionId}</strong>
                      <span>
                        {item.isCorrect ? "Correct" : "Wrong"}
                        {item.explanation ? ` - ${item.explanation}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {result.newBadges?.length ? (
                <p>New badges: {result.newBadges.map((badge) => badge.title).join(", ")}</p>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
