import { formatDate } from "../utils/format";
import type { ReviewMistake, ReviewRecommendation } from "../types/learning";

type ReviewPageProps = {
  recommendations: ReviewRecommendation[];
  mistakes: ReviewMistake[];
  isLoading: boolean;
  error: string | null;
  onOpenLesson: (lessonId: string) => void;
};

export function ReviewPage({
  recommendations,
  mistakes,
  isLoading,
  error,
  onOpenLesson,
}: ReviewPageProps) {
  return (
    <main className="page">
      <p className="eyebrow">Training Room</p>
      <h1>On tap va sua loi</h1>
      {isLoading ? <p className="notice">Loading review data...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="wide-grid">
        <article className="panel">
          <h2>Recommended Quests</h2>
          <ul className="plain-list">
            {recommendations.map((item) => (
              <li key={`${item.lesson.id}-${item.reasonCode}`}>
                <button
                  className="text-card-button"
                  type="button"
                  onClick={() => onOpenLesson(item.lesson.id)}
                >
                  <strong>{item.lesson.title}</strong>
                  <span>
                    {item.module.title} - {item.reasonText}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel panel-span-2">
          <h2>Mistake Deck</h2>
          <ul className="mistake-list">
            {mistakes.map((mistake) => (
              <li key={mistake.questionId}>
                <strong>{mistake.questionText}</strong>
                <span>Picked: {mistake.selectedOption.text}</span>
                <span>Correct: {mistake.correctOption?.text ?? "-"}</span>
                <small>{formatDate(mistake.lastWrongAt)}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
