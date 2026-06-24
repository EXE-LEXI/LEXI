import React, { useEffect, useMemo, useState } from "react";
import { CloudUpload, Link2, Trash2, Video, ChevronDown, ChevronUp, Search, FileVideo, VideoOff } from "lucide-react";
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

  // Redesign state declarations
  const [isBasicConfigOpen, setIsBasicConfigOpen] = useState(true);
  const [isQuizConfigOpen, setIsQuizConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "SHORTS" | "LESSON">("ALL");

  useEffect(() => {
    setLocalMedia(initialMedia);
  }, [initialMedia]);

  const selectedAsset = useMemo(
    () => localMedia.find((item) => item.id === selectedAssetId) ?? null,
    [localMedia, selectedAssetId]
  );

  const shortsMedia = localMedia.filter((item) => item.placement === "SHORTS");
  const lessonMedia = localMedia.filter((item) => item.placement !== "SHORTS");

  const filteredMedia = useMemo(() => {
    return localMedia.filter((item) => {
      const titleMatch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const idMatch = item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const searchMatch = titleMatch || idMatch;

      if (filterTab === "SHORTS") {
        return searchMatch && item.placement === "SHORTS";
      }
      if (filterTab === "LESSON") {
        return searchMatch && item.placement !== "SHORTS";
      }
      return searchMatch;
    });
  }, [localMedia, searchQuery, filterTab]);

  function handleDrag(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  }

  function setSelectedFile(file: File) {
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const allowedExtensions = [".mp4", ".webm", ".mov", ".m4v", ".mkv", ".avi"];
    if (!file.type.startsWith("video/") && !allowedExtensions.includes(extension)) {
      setError("Hiện tại chỉ hỗ trợ upload video (mp4, webm, mov, m4v, mkv, avi).");
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


  return (
    <div className="lexi-cms-panel-card">
      <div className="lexi-cms-panel-header">
        <h2>Quản lý video ngắn & video bài học</h2>
      </div>

      <div className="lexi-cms-panel-content">
        {notice ? <div className="lexi-inline-notice">{notice}</div> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {/* Upload Container at the top */}
        <div className="lexi-media-upload-container">
          <h3 style={sectionTitleStyle}>
            <CloudUpload size={18} style={{ marginRight: 6 }} /> Tải lên video mới
          </h3>
          
          <div className="lexi-media-destination-selector">
            <button
              type="button"
              className={`lexi-media-destination-btn ${uploadDestination === "SHORTS" ? "active" : ""}`}
              onClick={() => setUploadDestination("SHORTS")}
            >
              <strong>Video ngắn (Shorts)</strong>
              <span>Hiển thị trên trang Shorts với bộ câu hỏi tương tác</span>
            </button>
            <button
              type="button"
              className={`lexi-media-destination-btn ${uploadDestination === "LESSON_RESOURCE" ? "active" : ""}`}
              onClick={() => setUploadDestination("LESSON_RESOURCE")}
            >
              <strong>Video bài học</strong>
              <span>Lưu trữ trong kho tài nguyên để liên kết với các bài học chính</span>
            </button>
          </div>

          <div
            className={`lexi-media-upload-zone ${dragActive ? "active" : ""}`}
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
            <CloudUpload size={48} className="lexi-media-upload-icon" />
            <strong>Kéo thả tệp tin hoặc click để chọn</strong>
            <span>Hỗ trợ các định dạng video mp4, webm, mov, m4v, mkv, avi</span>
          </div>

          {/* Form details when file is selected */}
          {uploadFile ? (
            <div
              className="lexi-cms-panel-card"
              style={{
                marginTop: "20px",
                background: "#f8fafc",
                padding: "20px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px"
              }}
            >
              <div className="lexi-cms-form-group" style={{ marginBottom: "16px" }}>
                <label style={{ fontWeight: 600, color: "#475569" }}>Tên hiển thị của video</label>
                <input
                  type="text"
                  className="lexi-cms-form-input"
                  value={mediaTitle}
                  onChange={(event) => setMediaTitle(event.target.value)}
                  placeholder="Nhập tiêu đề video..."
                />
              </div>

              <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "16px" }}>
                Tệp tin đã chọn: <strong style={{ color: "#334155" }}>{uploadFile.name}</strong> (
                {(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>

              {/* Shorts metadata form grouped in accordions */}
              {uploadDestination === "SHORTS" && (
                <div style={{ marginBottom: "20px" }}>
                  {/* Accordion 1: Basic Config */}
                  <div className="lexi-media-accordion">
                    <button
                      type="button"
                      className={`lexi-media-accordion-header ${isBasicConfigOpen ? "active" : ""}`}
                      onClick={() => setIsBasicConfigOpen(!isBasicConfigOpen)}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        📝 Cấu hình thông tin cơ bản
                      </span>
                      {isBasicConfigOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isBasicConfigOpen && (
                      <div className="lexi-media-accordion-content">
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
                          <label>Bài học liên quan (Không bắt buộc)</label>
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
                            placeholder="Tóm tắt nội dung video..."
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Quiz Config */}
                  <div className="lexi-media-accordion">
                    <button
                      type="button"
                      className={`lexi-media-accordion-header ${isQuizConfigOpen ? "active" : ""}`}
                      onClick={() => setIsQuizConfigOpen(!isQuizConfigOpen)}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        ❓ Cấu hình bộ câu hỏi trắc nghiệm (Quiz)
                      </span>
                      {isQuizConfigOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isQuizConfigOpen && (
                      <div className="lexi-media-accordion-content">
                        <div className="lexi-cms-form-group">
                          <label>Câu hỏi</label>
                          <input
                            className="lexi-cms-form-input"
                            value={quizQuestion}
                            onChange={(event) => setQuizQuestion(event.target.value)}
                            placeholder="Ví dụ: Dấu hiệu chính của hành vi này là gì?"
                          />
                        </div>

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
                              placeholder={`Nhập lựa chọn thứ ${index + 1}...`}
                            />
                          </div>
                        ))}

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
                          <label>Giải thích chi tiết</label>
                          <textarea
                            className="lexi-cms-form-input"
                            value={quizExplanation}
                            onChange={(event) => setQuizExplanation(event.target.value)}
                            placeholder="Giải thích ngắn gọn tại sao đáp án này đúng..."
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress bar if uploading */}
              {isUploading ? (
                <div style={{ marginBottom: "16px" }}>
                  <div className="lexi-cms-progress-bar-container">
                    <span
                      className="lexi-cms-progress-bar-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "#4f46e5", fontWeight: 600 }}>
                    Đang tải lên hệ thống: {uploadProgress}%
                  </span>
                </div>
              ) : null}

              {/* Submit upload button */}
              <button
                type="button"
                className="lexi-cms-btn-save"
                style={{ width: "100%" }}
                disabled={isUploading}
                onClick={handleStartUpload}
              >
                {isUploading ? "Đang tải video..." : uploadDestination === "SHORTS" ? "Tải lên Video ngắn" : "Tải lên Video bài học"}
              </button>
            </div>
          ) : null}
        </div>

        {/* Media Workspace Split Grid (2 Columns) */}
        <div className="lexi-media-split-grid">
          
          {/* Left Column: Video Library & Filter Tabs */}
          <div>
            <div className="lexi-media-library-header">
              <div className="lexi-media-library-search" style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Tìm kiếm video..."
                  className="lexi-cms-form-input"
                  style={{ paddingLeft: "36px", marginBottom: 0 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              </div>

              <div className="lexi-media-library-tabs">
                <button
                  type="button"
                  className={`lexi-media-library-tab-btn ${filterTab === "ALL" ? "active" : ""}`}
                  onClick={() => setFilterTab("ALL")}
                >
                  Tất cả ({localMedia.length})
                </button>
                <button
                  type="button"
                  className={`lexi-media-library-tab-btn ${filterTab === "SHORTS" ? "active" : ""}`}
                  onClick={() => setFilterTab("SHORTS")}
                >
                  Shorts ({shortsMedia.length})
                </button>
                <button
                  type="button"
                  className={`lexi-media-library-tab-btn ${filterTab === "LESSON" ? "active" : ""}`}
                  onClick={() => setFilterTab("LESSON")}
                >
                  Bài học ({lessonMedia.length})
                </button>
              </div>
            </div>

            <div className="lexi-media-library-list">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((item) => {
                  const isSelected = selectedAssetId === item.id;
                  const isShorts = item.placement === "SHORTS";
                  
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`lexi-media-library-item ${isSelected ? "active" : ""}`}
                      onClick={() => setSelectedAssetId(item.id)}
                    >
                      <div
                        className="lexi-media-item-icon"
                        style={{
                          backgroundColor: isShorts ? "#ecfdf5" : "#eff6ff",
                          color: isShorts ? "#059669" : "#2563eb",
                        }}
                      >
                        {isShorts ? <FileVideo size={20} /> : <Video size={20} />}
                      </div>
                      
                      <div className="lexi-media-item-info">
                        <span className="lexi-media-item-title">{item.title || item.id}</span>
                        <div className="lexi-media-item-meta">
                          <span className={`lexi-media-badge ${isShorts ? "shorts" : "lesson"}`}>
                            {isShorts ? "Shorts" : "Bài học"}
                          </span>
                          {isShorts && (
                            <span className="lexi-media-badge attached" style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>
                              {getShortCategoryLabel(item)}
                            </span>
                          )}
                          {item.lesson ? (
                            <span className="lexi-media-badge attached">
                              Gắn liền: {item.lesson.title}
                            </span>
                          ) : (
                            <span className="lexi-media-badge unattached">
                              Chưa gắn bài học
                            </span>
                          )}
                          <span style={{ marginLeft: "auto", fontSize: "10px", color: "#94a3b8" }}>
                            ID: {item.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #e2e8f0" }}>
                  <VideoOff size={36} style={{ marginBottom: "8px", color: "#cbd5e1" }} />
                  <p style={{ fontSize: "13px", margin: 0 }}>Không tìm thấy video nào phù hợp.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Video & Attaching Form */}
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
              style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              onSubmit={handleAttachMedia}
            >
              <h3 style={{ ...sectionTitleStyle, borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
                <Link2 size={16} style={{ marginRight: 6 }} /> Đính kèm video vào bài học
              </h3>

              <div className="lexi-cms-form-group" style={{ marginBottom: "14px" }}>
                <label>Video đã chọn</label>
                <input
                  readOnly
                  required
                  type="text"
                  className="lexi-cms-form-input"
                  style={{ background: "#f8fafc", color: "#475569", borderColor: "#cbd5e1" }}
                  placeholder="Chọn video ở danh sách bên trái..."
                  value={selectedAsset?.title || selectedAsset?.id || ""}
                />
              </div>

              <div className="lexi-cms-form-group" style={{ marginBottom: "14px" }}>
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
                style={{ width: "100%", padding: "10px 16px" }}
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
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "32px 24px",
          textAlign: "center",
          color: "#64748b",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}
      >
        <Video size={40} style={{ margin: "0 auto 12px", color: "#cbd5e1", display: "block" }} />
        <p style={{ fontSize: "13.5px", margin: 0, fontWeight: 500 }}>
          Chọn một video từ danh sách thư viện bên trái để xem trước và quản lý chi tiết.
        </p>
      </div>
    );
  }

  const isShorts = asset.placement === "SHORTS";

  return (
    <div
      className="lexi-cms-panel-card"
      style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <h3 style={{ ...sectionTitleStyle, borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
        <Video size={16} style={{ marginRight: 6 }} /> Xem trước & chi tiết video
      </h3>

      {asset.url ? (
        <div
          style={{
            marginBottom: "16px",
            background: "#0f172a",
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #1e293b",
          }}
        >
          <video
            key={asset.url}
            src={asset.url}
            controls
            style={{ width: "100%", maxHeight: "280px", display: "block" }}
          />
        </div>
      ) : (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: "12px",
            color: "#b91c1c",
            fontSize: "13px",
            marginBottom: "16px"
          }}
        >
          <VideoOff size={24} style={{ margin: "0 auto 6px", display: "block" }} />
          Video này chưa có URL phát sóng trực tuyến.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "#334155" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "8px" }}>
          <strong style={{ color: "#64748b" }}>Tên video:</strong>
          <span style={{ fontWeight: 600, color: "#0f172a", textAlign: "right" }}>{asset.title || "Chưa đặt tên"}</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "8px" }}>
          <strong style={{ color: "#64748b" }}>Mã video ID:</strong>
          <code style={{ fontSize: "11px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#475569" }}>{asset.id}</code>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "8px" }}>
          <strong style={{ color: "#64748b" }}>Loại vị trí:</strong>
          <span className={`lexi-media-badge ${isShorts ? "shorts" : "lesson"}`}>
            {getPlacementLabel(asset)}
          </span>
        </div>

        {isShorts && (
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "8px" }}>
            <strong style={{ color: "#64748b" }}>Chuyên mục:</strong>
            <span style={{ fontWeight: 650, color: "#059669" }}>{getShortCategoryLabel(asset)}</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "8px" }}>
          <strong style={{ color: "#64748b" }}>Trạng thái:</strong>
          <span style={{ fontWeight: 600, color: asset.status === "READY" || !asset.status ? "#059669" : "#d97706" }}>
            {asset.status || "READY"}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "8px" }}>
          <strong style={{ color: "#64748b" }}>Bài học liên kết:</strong>
          <span style={{ fontWeight: 600, color: asset.lesson ? "#4f46e5" : "#64748b" }}>
            {asset.lesson?.title ?? "Chưa liên kết bài học nào"}
          </span>
        </div>

        {asset.url && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "4px" }}>
            <strong style={{ color: "#64748b" }}>Đường dẫn tệp (URL Cloud):</strong>
            <a
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "11px",
                color: "#2563eb",
                wordBreak: "break-all",
                backgroundColor: "#eff6ff",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #bfdbfe",
                display: "block",
                marginTop: "2px"
              }}
            >
              {asset.url}
            </a>
          </div>
        )}
      </div>

      <button
        type="button"
        className="lexi-cms-btn-cancel"
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          marginTop: "20px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "10px",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        disabled={isDeleting}
        onClick={() => onDelete(asset)}
      >
        <Trash2 size={15} />
        {isDeleting ? "Đang xóa video..." : "Xóa video vĩnh viễn"}
      </button>
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: "15px",
  fontWeight: "bold",
  color: "#1e293b",
};

