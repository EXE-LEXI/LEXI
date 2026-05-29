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
      <p className="eyebrow">Phòng Ôn Luyện</p>
      <h1>Ôn tập và sửa lỗi</h1>
      {isLoading ? <p className="notice">Đang tải dữ liệu ôn luyện...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="wide-grid">
        <article className="panel">
          <h2>Bài học được gợi ý ôn tập</h2>
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
          <h2>Danh sách câu trả lời sai</h2>
          <ul className="mistake-list">
            {mistakes.map((mistake) => (
              <li key={mistake.questionId}>
                <strong>{mistake.questionText}</strong>
                <span>Học viên chọn: {mistake.selectedOption.text}</span>
                <span>Đáp án đúng: {mistake.correctOption?.text ?? "-"}</span>
                <small>{formatDate(mistake.lastWrongAt)}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
export default ReviewPage;
