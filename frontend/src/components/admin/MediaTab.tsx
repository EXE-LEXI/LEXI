import React, { useEffect, useMemo, useState } from "react";
import { CloudUpload, Link2, Trash2, Video } from "lucide-react";
import type { AdminLesson, AdminMediaAsset } from "../../api/admin";
import {
  attachMediaAssetToLesson,
  deleteAdminMediaAsset,
  uploadAdminMediaFile,
} from "../../api/admin";

type MediaTabProps = {
  token: string;
  initialMedia: AdminMediaAsset[];
  lessons: AdminLesson[];
};

type UploadDestination = "SHORTS" | "LESSON_RESOURCE";
type ShortsCategory = "fraud" | "civil" | "labor" | "traffic" | "family" | "criminal" | "trivia";

export function MediaTab({ token, initialMedia, lessons }: MediaTabProps) {
  const [localMedia, setLocalMedia] = useState<AdminMediaAsset[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaTitle, setMediaTitle] = useState("");
  const [uploadDestination, setUploadDestination] =
    useState<UploadDestination>("SHORTS");
  const [shortsCategory, setShortsCategory] = useState<ShortsCategory>("trivia");
  const [shortsDescription, setShortsDescription] = useState("");
  const [shortsAuthor, setShortsAuthor] = useState("Lexi");
  const [shortsLessonId, setShortsLessonId] = useState("");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOption1, setQuizOption1] = useState("");
  const [quizOption2, setQuizOption2] = useState("");
  const [quizOption3, setQuizOption3] = useState("");
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [attachLessonId, setAttachLessonId] = useState("");
  const [isAttaching, setIsAttaching] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalMedia(initialMedia);
  }, [initialMedia]);

  const selectedAsset = useMemo(
    () => localMedia.find((item) => item.id === selectedAssetId) ?? null,
    [localMedia, selectedAssetId]
  );

  const shortsMedia = localMedia.filter((item) => item.placement === "SHORTS");
  const lessonMedia = localMedia.filter((item) => item.placement !== "SHORTS");

  function handleDrag(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  }

  function setSelectedFile(file: File) {
    if (!file.type.startsWith("video/")) {
      setError("Hiện tại chỉ hỗ trợ upload video.");
      return;
    }

    setError(null);
    setUploadFile(file);
    setMediaTitle(file.name.substring(0, file.name.lastIndexOf(".")) || file.name);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  async function handleStartUpload() {
    if (!uploadFile) {
      return;
    }

    setIsUploading(true);
    setNotice(null);
    setError(null);
    setUploadProgress(10);

    const interval = window.setInterval(() => {
      setUploadProgress((value) => {
        if (value >= 90) {
          window.clearInterval(interval);
          return 90;
        }
        return value + 15;
      });
    }, 300);

    try {
      const createdAsset = await uploadAdminMediaFile(
        token,
        uploadFile,
        mediaTitle || uploadFile.name,
        uploadDestination,
        uploadDestination === "SHORTS"
          ? {
              lessonId: shortsLessonId || null,
              shortsCategory,
              shortsDescription,
              shortsAuthor,
              quizQuestion,
              quizOptions: [quizOption1, quizOption2, quizOption3],
              quizCorrectIndex,
              quizExplanation,
            }
          : {}
      );

      window.clearInterval(interval);
      setUploadProgress(100);
      setLocalMedia((items) => [createdAsset, ...items]);
      setSelectedAssetId(createdAsset.id);
      setNotice(
        uploadDestination === "SHORTS"
          ? "Đã tải video lên mục Video ngắn."
          : "Đã tải video vào kho Video bài học. Hãy chọn bài học để đính kèm."
      );
      setUploadFile(null);
      setMediaTitle("");
      setQuizQuestion("");
      setQuizOption1("");
      setQuizOption2("");
      setQuizOption3("");
      setQuizCorrectIndex(0);
      setQuizExplanation("");
    } catch (err) {
      window.clearInterval(interval);
      setError(`Lỗi tải lên: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleAttachMedia(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAssetId || !attachLessonId) {
      setError("Vui lòng chọn video và bài học cần đính kèm.");
      return;
    }

    setIsAttaching(true);
    setNotice(null);
    setError(null);

    try {
      const targetLesson = lessons.find((lesson) => lesson.id === attachLessonId);
      await attachMediaAssetToLesson(token, selectedAssetId, {
        lessonId: attachLessonId,
      });

      setLocalMedia((items) =>
        items.map((item) =>
          item.id === selectedAssetId
            ? {
                ...item,
                lesson: targetLesson
                  ? {
                      id: targetLesson.id,
                      slug: targetLesson.slug || "",
                      title: targetLesson.title,
                    }
                  : null,
              }
            : item
        )
      );
      setNotice("Đã gắn video vào bài học thành công.");
      setAttachLessonId("");
    } catch (err) {
      setError(`Lỗi khi đính kèm: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsAttaching(false);
    }
  }

  async function handleDeleteMedia(asset: AdminMediaAsset) {
    const assetName = asset.title || asset.id;
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa video "${assetName}" không? Thao tác này sẽ xóa cả bản ghi và tệp video đã lưu.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingAssetId(asset.id);
    setNotice(null);
    setError(null);

    try {
      await deleteAdminMediaAsset(token, asset.id);
      setLocalMedia((items) => items.filter((item) => item.id !== asset.id));
      if (selectedAssetId === asset.id) {
        setSelectedAssetId("");
        setAttachLessonId("");
      }
      setNotice("Đã xóa video thành công.");
    } catch (err) {
      setError(`Lỗi khi xóa video: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeletingAssetId(null);
    }
  }

  function getPlacementLabel(item: AdminMediaAsset) {
    return item.placement === "SHORTS" ? "Video ngắn" : "Video bài học";
  }

  function getShortCategoryLabel(item: AdminMediaAsset) {
    const category = (item.metadata as any)?.shorts?.category;
    if (category === "fraud") return "Lừa đảo công nghệ";
    if (category === "civil") return "Dân sự & đời sống";
    if (category === "labor") return "Lao động";
    if (category === "traffic") return "Giao thông";
    if (category === "family") return "Hôn nhân gia đình";
    if (category === "criminal") return "Hình sự cơ bản";
    return "Mẹo luật";
  }

  function renderMediaRow(item: AdminMediaAsset) {
    const assetType = item.assetType ?? item.type ?? "VIDEO";
    const isSelected = selectedAssetId === item.id;

    return (
      <button
        key={item.id}
        type="button"
        className="lexi-cms-lesson-row"
        style={{
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          background: isSelected ? "#f0f3ff" : "",
          border: isSelected ? "1.5px solid #4f46e5" : "",
        }}
        onClick={() => setSelectedAssetId(item.id)}
      >
        <span
          className="lexi-cms-lesson-num"
          style={{
            background: assetType === "VIDEO" ? "#e0f2fe" : "#fee2e2",
            color: assetType === "VIDEO" ? "#0284c7" : "#ef4444",
          }}
        >
          <Video size={16} />
        </span>
        <div className="lexi-cms-lesson-details">
          <span className="lexi-cms-lesson-name">{item.title || item.id}</span>
          <span className="lexi-cms-lesson-stats">
            {getPlacementLabel(item)} • {assetType} • Trạng thái:{" "}
            {item.status ?? "READY"}
            {item.placement === "SHORTS" ? (
              <span style={detailLineStyle("#059669")}>
                Chuyên mục: {getShortCategoryLabel(item)}
              </span>
            ) : null}
            <span style={detailLineStyle(item.lesson ? "#4f46e5" : "#64748b")}>
              Bài học: {item.lesson?.title ?? "Chưa gắn bài học"}
            </span>
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="lexi-cms-panel-card">
      <div className="lexi-cms-panel-header">
        <h2>Quản lý video ngắn & video bài học</h2>
      </div>

      <div className="lexi-cms-panel-content">
        {notice ? <div className="lexi-inline-notice">{notice}</div> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <div className="lexi-cms-quiz-split">
          <div>
            <h3 style={sectionTitleStyle}>Chọn nơi upload video</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <DestinationButton
                active={uploadDestination === "SHORTS"}
                title="Video ngắn"
                description="Hiển thị trên trang Shorts"
                onClick={() => setUploadDestination("SHORTS")}
              />
              <DestinationButton
                active={uploadDestination === "LESSON_RESOURCE"}
                title="Video bài học"
                description="Lưu vào kho để gắn với bài học"
                onClick={() => setUploadDestination("LESSON_RESOURCE")}
              />
            </div>

            {uploadDestination === "SHORTS" ? (
              <div
                className="lexi-cms-panel-card"
                style={{
                  marginBottom: "16px",
                  background: "#f8fafc",
                  padding: "16px",
                  border: "1px solid #cbd5e1",
                }}
              >
                <h3 style={sectionTitleStyle}>Thông tin Video ngắn</h3>
                <div className="lexi-cms-form-group">
                  <label>Chuyên mục pháp lý</label>
                  <select
                    className="lexi-cms-form-select"
                    value={shortsCategory}
                    onChange={(event) =>
                      setShortsCategory(event.target.value as ShortsCategory)
                    }
                  >
                    <option value="fraud">Lừa đảo công nghệ</option>
                    <option value="civil">Dân sự & đời sống</option>
                    <option value="labor">Lao động</option>
                    <option value="traffic">Giao thông</option>
                    <option value="family">Hôn nhân gia đình</option>
                    <option value="criminal">Hình sự cơ bản</option>
                    <option value="trivia">Mẹo luật</option>
                  </select>
                </div>

                <div className="lexi-cms-form-group">
                  <label>Bài học liên quan</label>
                  <select
                    className="lexi-cms-form-select"
                    value={shortsLessonId}
                    onChange={(event) => setShortsLessonId(event.target.value)}
                  >
                    <option value="">Không gắn bài học</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lexi-cms-form-group">
                  <label>Tác giả</label>
                  <input
                    className="lexi-cms-form-input"
                    value={shortsAuthor}
                    onChange={(event) => setShortsAuthor(event.target.value)}
                    placeholder="Lexi"
                  />
                </div>

                <div className="lexi-cms-form-group">
                  <label>Mô tả ngắn</label>
                  <textarea
                    className="lexi-cms-form-input"
                    value={shortsDescription}
                    onChange={(event) => setShortsDescription(event.target.value)}
                    placeholder="Tóm tắt nội dung video để hiển thị trong Shorts"
                    rows={3}
                  />
                </div>

                <h3 style={{ ...sectionTitleStyle, marginTop: "14px" }}>
                  Quiz sau video
                </h3>
                <div className="lexi-cms-form-group">
                  <label>Câu hỏi</label>
                  <input
                    className="lexi-cms-form-input"
                    value={quizQuestion}
                    onChange={(event) => setQuizQuestion(event.target.value)}
                    placeholder="Ví dụ: Dấu hiệu chính của hành vi này là gì?"
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "8px",
                  }}
                >
                  {[quizOption1, quizOption2, quizOption3].map((value, index) => (
                    <div className="lexi-cms-form-group" key={index}>
                      <label>Đáp án {index + 1}</label>
                      <input
                        className="lexi-cms-form-input"
                        value={value}
                        onChange={(event) => {
                          const setter = [
                            setQuizOption1,
                            setQuizOption2,
                            setQuizOption3,
                          ][index];
                          setter(event.target.value);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="lexi-cms-form-group">
                  <label>Đáp án đúng</label>
                  <select
                    className="lexi-cms-form-select"
                    value={quizCorrectIndex}
                    onChange={(event) => setQuizCorrectIndex(Number(event.target.value))}
                  >
                    <option value={0}>Đáp án 1</option>
                    <option value={1}>Đáp án 2</option>
                    <option value={2}>Đáp án 3</option>
                  </select>
                </div>
                <div className="lexi-cms-form-group">
                  <label>Giải thích</label>
                  <textarea
                    className="lexi-cms-form-input"
                    value={quizExplanation}
                    onChange={(event) => setQuizExplanation(event.target.value)}
                    placeholder="Giải thích ngắn sau khi người học trả lời"
                    rows={3}
                  />
                </div>
              </div>
            ) : null}

            <div
              className={`lexi-cms-upload-zone ${dragActive ? "active" : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("hidden-file-input")?.click()}
            >
              <input
                id="hidden-file-input"
                type="file"
                style={{ display: "none" }}
                accept="video/*"
                onChange={handleFileChange}
              />
              <CloudUpload size={48} className="lexi-cms-upload-icon" />
              <strong>Kéo thả tệp tin hoặc click để chọn</strong>
              <span>Hỗ trợ video mp4, webm, mov, m4v, mkv hoặc avi.</span>
            </div>

            {uploadFile ? (
              <div
                className="lexi-cms-panel-card"
                style={{
                  marginTop: "16px",
                  background: "#f8fafc",
                  padding: "16px",
                  border: "1px solid #cbd5e1",
                }}
              >
                <div className="lexi-cms-form-group">
                  <label>Tên video</label>
                  <input
                    type="text"
                    className="lexi-cms-form-input"
                    value={mediaTitle}
                    onChange={(event) => setMediaTitle(event.target.value)}
                  />
                </div>

                <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                  Tệp tin: <strong>{uploadFile.name}</strong> (
                  {(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>

                {isUploading ? (
                  <div>
                    <div className="lexi-cms-progress-bar-container">
                      <span
                        className="lexi-cms-progress-bar-fill"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span style={{ fontSize: "11px", color: "#4f46e5" }}>
                      Đang upload: {uploadProgress}%
                    </span>
                  </div>
                ) : null}

                <button
                  type="button"
                  className="lexi-cms-btn-save"
                  style={{ marginTop: "12px", width: "100%" }}
                  disabled={isUploading}
                  onClick={handleStartUpload}
                >
                  {uploadDestination === "SHORTS"
                    ? "Upload lên Video ngắn"
                    : "Upload vào kho Video bài học"}
                </button>
              </div>
            ) : null}

            <MediaListSection
              title={`Video ngắn đã publish (${shortsMedia.length})`}
              emptyText="Chưa có video ngắn nào."
              items={shortsMedia}
              renderItem={renderMediaRow}
            />
            <MediaListSection
              title={`Video bài học / tài nguyên lesson (${lessonMedia.length})`}
              emptyText="Chưa có video bài học nào."
              items={lessonMedia}
              renderItem={renderMediaRow}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SelectedVideoPanel
              asset={selectedAsset}
              isDeleting={Boolean(selectedAsset && deletingAssetId === selectedAsset.id)}
              getPlacementLabel={getPlacementLabel}
              getShortCategoryLabel={getShortCategoryLabel}
              onDelete={handleDeleteMedia}
            />

            <form
              className="lexi-cms-panel-card"
              style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}
              onSubmit={handleAttachMedia}
            >
              <h3 style={sectionTitleStyle}>
                <Link2 size={16} /> Đính kèm video vào bài học
              </h3>

              <div className="lexi-cms-form-group">
                <label>Video đã chọn</label>
                <input
                  readOnly
                  required
                  type="text"
                  className="lexi-cms-form-input"
                  style={{ background: "#e2e8f0", color: "#475569" }}
                  placeholder="Chọn video ở danh sách bên trái..."
                  value={selectedAsset?.title || selectedAsset?.id || ""}
                />
              </div>

              <div className="lexi-cms-form-group">
                <label>Bài học cần đính kèm</label>
                <select
                  required
                  className="lexi-cms-form-select"
                  value={attachLessonId}
                  onChange={(event) => setAttachLessonId(event.target.value)}
                >
                  <option value="">-- Chọn bài học --</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="lexi-cms-btn-save"
                style={{ marginTop: "10px", width: "100%" }}
                disabled={isAttaching || !selectedAssetId || !attachLessonId}
              >
                {isAttaching ? "Đang đính kèm..." : "Xác nhận liên kết video"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function DestinationButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="lexi-cms-btn-save"
      style={{
        background: active ? "#4f46e5" : "#f8fafc",
        color: active ? "#ffffff" : "#334155",
        border: active ? "1px solid #4f46e5" : "1px solid #cbd5e1",
        textAlign: "left",
        minHeight: "72px",
      }}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span style={{ display: "block", fontSize: "11px", marginTop: "4px" }}>
        {description}
      </span>
    </button>
  );
}

function MediaListSection({
  title,
  emptyText,
  items,
  renderItem,
}: {
  title: string;
  emptyText: string;
  items: AdminMediaAsset[];
  renderItem: (item: AdminMediaAsset) => React.ReactNode;
}) {
  return (
    <>
      <h4
        style={{
          marginTop: "24px",
          marginBottom: "12px",
          fontSize: "14px",
          color: "#475569",
        }}
      >
        {title}
      </h4>
      <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "6px" }}>
        {items.length > 0 ? (
          items.map(renderItem)
        ) : (
          <p style={{ fontSize: "12px", color: "#64748b" }}>{emptyText}</p>
        )}
      </div>
    </>
  );
}

function SelectedVideoPanel({
  asset,
  isDeleting,
  getPlacementLabel,
  getShortCategoryLabel,
  onDelete,
}: {
  asset: AdminMediaAsset | null;
  isDeleting: boolean;
  getPlacementLabel: (asset: AdminMediaAsset) => string;
  getShortCategoryLabel: (asset: AdminMediaAsset) => string;
  onDelete: (asset: AdminMediaAsset) => void;
}) {
  if (!asset) {
    return (
      <div
        className="lexi-cms-panel-card"
        style={{
          background: "#f8fafc",
          border: "1px solid #cbd5e1",
          padding: "24px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        <p style={{ fontSize: "13px", margin: 0 }}>
          Chọn một video ở danh sách bên trái để xem trước và xóa khi cần.
        </p>
      </div>
    );
  }

  return (
    <div
      className="lexi-cms-panel-card"
      style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "16px" }}
    >
      <h3 style={sectionTitleStyle}>
        <Video size={16} /> Xem trước & chi tiết video
      </h3>

      {asset.url ? (
        <div
          style={{
            marginBottom: "12px",
            background: "#000",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <video
            key={asset.url}
            src={asset.url}
            controls
            style={{ width: "100%", maxHeight: "240px", display: "block" }}
          />
        </div>
      ) : (
        <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "12px" }}>
          Video này chưa có URL phát.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#475569" }}>
        <div><strong>Tên video:</strong> {asset.title || "Chưa đặt tên"}</div>
        <div><strong>ID:</strong> <code style={{ fontSize: "11px" }}>{asset.id}</code></div>
        <div><strong>Loại:</strong> {getPlacementLabel(asset)} ({asset.assetType || asset.type || "VIDEO"})</div>
        {asset.placement === "SHORTS" ? (
          <div><strong>Chuyên mục Shorts:</strong> {getShortCategoryLabel(asset)}</div>
        ) : null}
        <div><strong>Trạng thái:</strong> {asset.status || "READY"}</div>
        <div>
          <strong>Bài học liên quan:</strong>{" "}
          {asset.lesson?.title ?? "Chưa gắn bài học"}
        </div>
        {asset.url ? (
          <div style={{ wordBreak: "break-all" }}>
            <strong>URL:</strong> {asset.url}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="lexi-cms-btn-cancel"
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          marginTop: "16px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "10px",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
        disabled={isDeleting}
        onClick={() => onDelete(asset)}
      >
        <Trash2 size={16} />
        {isDeleting ? "Đang xóa..." : "Xóa video này"}
      </button>
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "16px",
  color: "#334155",
};

function detailLineStyle(color: string): React.CSSProperties {
  return {
    display: "block",
    color,
    fontWeight: 600,
    marginTop: "2px",
  };
}
