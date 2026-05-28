import type { LearningCategory, LearningModule } from "../types/learning";

type ModulesPageProps = {
  categories: LearningCategory[];
  selectedCategoryId: string | null;
  modules: LearningModule[];
  isLoading: boolean;
  error: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onOpenLesson: (lessonId: string) => void;
};

export function ModulesPage({
  categories,
  selectedCategoryId,
  modules,
  isLoading,
  error,
  onSelectCategory,
  onOpenLesson,
}: ModulesPageProps) {
  return (
    <main className="page">
      <p className="eyebrow">World Map</p>
      <h1>Ban do nhiem vu phap ly</h1>
      <div className="segmented-control">
        <button
          className={!selectedCategoryId ? "active" : ""}
          type="button"
          onClick={() => onSelectCategory(null)}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            className={selectedCategoryId === category.id ? "active" : ""}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            key={category.id}
          >
            {category.title}
          </button>
        ))}
      </div>
      {isLoading ? <p className="notice">Loading modules...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <section className="module-list">
        {modules.map((module) => (
          <article className="panel module-card" key={module.id}>
            <div className="module-header">
              <span className="module-index">Zone {module.sortOrder + 1}</span>
              <h2>{module.title}</h2>
              <p className="muted">{module.description ?? "No description"}</p>
            </div>
            <ul className="lesson-list">
              {module.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button type="button" onClick={() => onOpenLesson(lesson.id)}>
                    <span>Mission {lesson.sortOrder + 1}</span>
                    {lesson.title}
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
