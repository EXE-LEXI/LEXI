import React, { useState, useEffect } from "react";
import { CloudUpload } from "lucide-react";
import type { AdminLesson, AdminMediaAsset } from "../../api/admin";
import { attachMediaAssetToLesson, uploadAdminMediaFile } from "../../api/admin";

type MediaTabProps = {
  token: string;
  initialMedia: AdminMediaAsset[];
  lessons: AdminLesson[];
};

type UploadDestination = "SHORTS" | "LESSON_RESOURCE";

export function MediaTab({
  token,
  initialMedia,
  lessons,
}: MediaTabProps) {
  // Local state for media assets
  const [localMedia, setLocalMedia] = useState<AdminMediaAsset[]>([]);

  // Drag-and-drop media upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaTitle, setMediaTitle] = useState("");
  const [uploadDestination, setUploadDestination] = useState<UploadDestination>("SHORTS");

  // Media attachment states
  const [selectedAssetIdForAttach, setSelectedAssetIdForAttach] = useState<string>("");
  const [attachLessonId, setAttachLessonId] = useState<string>("");
  const [isAttaching, setIsAttaching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync initial media assets
  useEffect(() => {
    setLocalMedia(initialMedia);
  }, [initialMedia]);

  // Drag-and-drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("video/")) {
        setError("Hien tai chi ho tro upload video. PDF se duoc bo sung sau.");
        return;
      }
      setUploadFile(file);
      setMediaTitle(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("video/")) {
        setError("Hien tai chi ho tro upload video. PDF se duoc bo sung sau.");
        e.target.value = "";
        return;
      }
      setUploadFile(file);
      setMediaTitle(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
    }
  };

  const handleStartUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setNotice(null);
    setError(null);
    setUploadProgress(10);

    // Mock progress loading effect
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    try {
      const createdAsset = await uploadAdminMediaFile(
        token,
        uploadFile,
        mediaTitle || uploadFile.name,
        uploadDestination
      );

      // Complete progress and add asset to local listing
      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          setLocalMedia(prev => [createdAsset, ...prev]);
          setNotice(
            uploadDestination === "SHORTS"
              ? "Da tai video len phan Video ngan thanh cong."
              : "Da tai video vao kho Video bai hoc thanh cong. Hay chon video va bai hoc de dinh kem."
          );
          setIsUploading(false);
          setUploadFile(null);
          setUploadProgress(0);
          setMediaTitle("");
        }, 300);
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setError("Loi tai len: " + (err.message || err));
      setIsUploading(false);
    }
  };

  const handleAttachMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetIdForAttach || !attachLessonId) {
      setError("Vui long dien du thong tin truoc khi dinh kem media.");
      return;
    }

    setIsAttaching(true);
    setNotice(null);
    setError(null);
    try {
      await attachMediaAssetToLesson(token, selectedAssetIdForAttach, {
        lessonId: attachLessonId
      });
      setNotice("Da gan tai nguyen media vao bai hoc thanh cong.");
      setSelectedAssetIdForAttach("");
      setAttachLessonId("");
    } catch (err: any) {
      setError("Loi khi dinh kem: " + (err.message || err));
    } finally {
      setIsAttaching(false);
    }
  };

  const shortsMedia = localMedia.filter((item) => item.placement === "SHORTS");
  const lessonMedia = localMedia.filter((item) => item.placement !== "SHORTS");

  function getPlacementLabel(item: AdminMediaAsset) {
    return item.placement === "SHORTS" ? "Video ngắn" : "Video bài học";
  }

  function renderMediaRow(item: AdminMediaAsset) {
    const assetType = item.assetType ?? item.type ?? "VIDEO";

    return (
      <div
        key={item.id}
        className="lexi-cms-lesson-row"
        style={{
          cursor: "pointer",
          background: selectedAssetIdForAttach === item.id ? "#f0f3ff" : "",
          border: selectedAssetIdForAttach === item.id ? "1.5px solid #4f46e5" : "",
        }}
        onClick={() => setSelectedAssetIdForAttach(item.id)}
      >
        <span
          className="lexi-cms-lesson-num"
          style={{
            background: assetType === "VIDEO" ? "#e0f2fe" : "#fee2e2",
            color: assetType === "VIDEO" ? "#0284c7" : "#ef4444",
          }}
        >
          {assetType === "VIDEO" ? "🎥" : "📄"}
        </span>
        <div className="lexi-cms-lesson-details">
          <span className="lexi-cms-lesson-name">{item.title || item.id}</span>
          <span className="lexi-cms-lesson-stats">
            {getPlacementLabel(item)} • {assetType} • Trạng thái: {item.status ?? "READY"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="lexi-cms-panel-card">
      <div className="lexi-cms-panel-header">
        <h2>Quản lý video ngắn & Đính kèm video vào bài học</h2>
      </div>
      
      <div className="lexi-cms-panel-content">
        {notice && <div className="lexi-inline-notice">{notice}</div>}
        {error && <p className="form-error">{error}</p>}

        <div className="lexi-cms-quiz-split">
          
          {/* Left Drag & Drop Uploader */}
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "16px", color: "#334155" }}>
              📤 Chọn nơi upload video
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginBottom: "16px" }}>
              <button
                type="button"
                className="lexi-cms-btn-save"
                style={{
                  background: uploadDestination === "SHORTS" ? "#4f46e5" : "#f8fafc",
                  color: uploadDestination === "SHORTS" ? "#ffffff" : "#334155",
                  border: uploadDestination === "SHORTS" ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                  textAlign: "left",
                  minHeight: "72px",
                }}
                onClick={() => setUploadDestination("SHORTS")}
              >
                <strong>Video ngắn</strong>
                <span style={{ display: "block", fontSize: "11px", marginTop: "4px", opacity: 0.85 }}>
                  Hiển thị trên trang /shorts
                </span>
              </button>
              <button
                type="button"
                className="lexi-cms-btn-save"
                style={{
                  background: uploadDestination === "LESSON_RESOURCE" ? "#4f46e5" : "#f8fafc",
                  color: uploadDestination === "LESSON_RESOURCE" ? "#ffffff" : "#334155",
                  border: uploadDestination === "LESSON_RESOURCE" ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                  textAlign: "left",
                  minHeight: "72px",
                }}
                onClick={() => setUploadDestination("LESSON_RESOURCE")}
              >
                <strong>Video bài học</strong>
                <span style={{ display: "block", fontSize: "11px", marginTop: "4px", opacity: 0.85 }}>
                  Lưu vào kho để đính kèm lesson
                </span>
              </button>
            </div>

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
              <span>Hien tai ho tro upload video mp4, webm, mov, m4v, mkv hoac avi</span>
            </div>

            {uploadFile && (
              <div className="lexi-cms-panel-card" style={{ marginTop: "16px", background: "#f8fafc", padding: "16px", border: "1px solid #cbd5e1" }}>
                <div className="lexi-cms-form-group">
                  <label>Tên tài nguyên lưu trữ</label>
                  <input 
                    type="text" 
                    className="lexi-cms-form-input" 
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                  />
                </div>
                
                <div className="lexi-cms-form-group">
                  <label>Loại tài nguyên</label>
                  <select 
                    className="lexi-cms-form-select"
                    value="video"
                    disabled
                  >
                    <option value="video">🎥 Video ngắn / Bài giảng</option>
                  </select>
                </div>

                <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                  Tệp tin: <strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>

                {isUploading && (
                  <div>
                    <div className="lexi-cms-progress-bar-container">
                      <span className="lexi-cms-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#4f46e5" }}>Đang upload: {uploadProgress}%</span>
                  </div>
                )}

                <button 
                  type="button" 
                  className="lexi-cms-btn-save" 
                  style={{ marginTop: "12px", width: "100%" }}
                  disabled={isUploading}
                  onClick={handleStartUpload}
                >
                  {uploadDestination === "SHORTS" ? "🚀 Upload lên Video ngắn" : "🚀 Upload vào kho Video bài học"}
                </button>
              </div>
            )}

            {/* List of existing assets */}
            <h4 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "14px", color: "#475569" }}>
              Video ngắn đã publish ({shortsMedia.length})
            </h4>
            <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "6px" }}>
              {shortsMedia.length > 0 ? shortsMedia.map(renderMediaRow) : (
                <p style={{ fontSize: "12px", color: "#64748b" }}>Chưa có video ngắn nào.</p>
              )}
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "12px", fontSize: "14px", color: "#475569" }}>
              Video bài học / tài nguyên lesson ({lessonMedia.length})
            </h4>
            <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "6px" }}>
              {lessonMedia.length > 0 ? lessonMedia.map(renderMediaRow) : (
                <p style={{ fontSize: "12px", color: "#64748b" }}>Chưa có video bài học nào.</p>
              )}
            </div>

          </div>

          {/* Right Attachment Form */}
          <form className="lexi-cms-panel-card" style={{ background: "#f8fafc", border: "1px solid #cbd5e1", alignSelf: "start" }} onSubmit={handleAttachMedia}>
            <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "16px", color: "#334155" }}>
              🔗 Đính kèm tài nguyên vào bài học
            </h3>

            <div className="lexi-cms-form-group">
              <label>Bước 1: Chọn tài nguyên Media (Click danh sách bên trái)</label>
              <input 
                readOnly
                required
                type="text" 
                className="lexi-cms-form-input" 
                style={{ background: "#e2e8f0", color: "#475569" }}
                placeholder="Chọn tài nguyên ở danh sách bên trái..."
                value={selectedAssetIdForAttach ? (localMedia.find(m => m.id === selectedAssetIdForAttach)?.title || selectedAssetIdForAttach) : ""}
              />
            </div>

            <div className="lexi-cms-form-group">
              <label>Bước 2: Chọn bài học đích cần đính kèm</label>
              <select 
                required
                className="lexi-cms-form-select"
                value={attachLessonId}
                onChange={(e) => setAttachLessonId(e.target.value)}
              >
                <option value="">-- Chọn bài học đích --</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="lexi-cms-btn-save" 
              style={{ marginTop: "10px" }} 
              disabled={isAttaching || !selectedAssetIdForAttach || !attachLessonId}
            >
              {isAttaching ? "Đang đính kèm..." : "🔗 Xác nhận liên kết tài nguyên"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
