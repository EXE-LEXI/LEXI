import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  Download,
  FileText,
  Scale,
  CheckCircle,
  FileCheck,
  ChevronRight,
  HelpCircle,
  Star,
} from "lucide-react";
import {
  getResourceLegalSource,
  getResourceLegalSources,
  getResourceMediaAssets,
  type ResourceLegalSourceDetail,
  type ResourceLegalSourceSummary,
  type ResourceMediaAsset,
} from "../api/resources";

type ResourcesPageProps = {
  token: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa có ngày hiệu lực";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getDocumentLabel(source: ResourceLegalSourceSummary) {
  return source.legalDocumentNo || "Văn bản pháp lý";
}

function getMediaSize(asset: ResourceMediaAsset) {
  const metadata = asset.metadata as { sizeLabel?: string; pages?: number } | null;
  if (metadata?.sizeLabel) {
    return metadata.sizeLabel;
  }
  if (asset.mimeType) {
    return asset.mimeType;
  }
  return asset.assetType;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ token }) => {
  const [sources, setSources] = useState<ResourceLegalSourceSummary[]>([]);
  const [mediaAssets, setMediaAssets] = useState<ResourceMediaAsset[]>([]);
  const [selectedSource, setSelectedSource] =
    useState<ResourceLegalSourceDetail | null>(null);
  const [activeDocument, setActiveDocument] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedDocs, setDownloadedDocs] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      setIsLoading(true);
      setError(null);
      try {
        const [nextSources, nextMedia] = await Promise.all([
          getResourceLegalSources(token, {
            page: 1,
            limit: 30,
            search: searchQuery,
          }),
          getResourceMediaAssets(token, {
            page: 1,
            limit: 12,
            search: searchQuery,
          }),
        ]);

        if (cancelled) {
          return;
        }

        setSources(nextSources.items);
        setMediaAssets(nextMedia.items);

        const firstSource = nextSources.items[0];
        if (firstSource) {
          const detail = await getResourceLegalSource(token, firstSource.id);
          if (!cancelled) {
            setSelectedSource(detail);
            setActiveDocument(getDocumentLabel(firstSource));
          }
        } else {
          setSelectedSource(null);
          setActiveDocument("all");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không tải được thư viện");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadResources, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [token, searchQuery]);

  const documentTabs = useMemo(() => {
    const labels = sources.map(getDocumentLabel);
    return Array.from(new Set(labels)).slice(0, 5);
  }, [sources]);

  const filteredSources = useMemo(() => {
    if (activeDocument === "all") {
      return sources;
    }
    return sources.filter((source) => getDocumentLabel(source) === activeDocument);
  }, [activeDocument, sources]);

  async function handleSelectSource(source: ResourceLegalSourceSummary) {
    setError(null);
    try {
      setSelectedSource(await getResourceLegalSource(token, source.id));
      setActiveDocument(getDocumentLabel(source));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được văn bản");
    }
  }

  function handleTriggerDownload(asset: ResourceMediaAsset) {
    if (downloadedDocs[asset.id] || downloadingId) {
      return;
    }

    setDownloadingId(asset.id);
    window.setTimeout(() => {
      window.open(asset.url, "_blank", "noopener,noreferrer");
      setDownloadedDocs((prev) => ({ ...prev, [asset.id]: true }));
      setDownloadingId(null);
    }, 500);
  }

  return (
    <main className="page lexi-library-root">
      <p className="eyebrow">Thư viện pháp lý</p>
      <h1>Học liệu & tra cứu văn bản</h1>

      {error && <p className="form-error">{error}</p>}

      <section className="lexi-library-syllabus-section">
        <h2 className="lexi-library-section-title">
          <BookOpen size={20} />
          <span>Tài liệu & học liệu số</span>
        </h2>

        <div className="lexi-syllabus-cards-grid">
          {mediaAssets.map((asset) => {
            const isDownloading = downloadingId === asset.id;
            const isDownloaded = downloadedDocs[asset.id];

            return (
              <article className="panel lexi-syllabus-card" key={asset.id}>
                <div className="lexi-doc-icon-container">
                  <FileText size={26} className="lexi-doc-icon" />
                </div>

                <div className="lexi-doc-content-info">
                  <h3 className="lexi-doc-title">
                    {asset.title || asset.lesson?.title || "Học liệu pháp lý"}
                  </h3>
                  <div className="lexi-doc-meta-row">
                    <span className="lexi-doc-meta-badge">
                      {getMediaSize(asset)}
                    </span>
                    <span className="lexi-doc-meta-badge">
                      {asset.provider || asset.sourceType}
                    </span>
                    <span className="lexi-doc-meta-badge doc-rating">
                      <Star size={12} className="fill-gold" />
                      <span>Mới</span>
                    </span>
                    <span className="lexi-doc-meta-desc">
                      Cập nhật {formatDate(asset.updatedAt)}
                    </span>
                  </div>
                </div>

                <button
                  className={`lexi-btn-doc-download ${
                    isDownloaded ? "downloaded" : ""
                  } ${isDownloading ? "loading" : ""}`}
                  type="button"
                  onClick={() => handleTriggerDownload(asset)}
                  disabled={isDownloading}
                >
                  {isDownloaded ? (
                    <>
                      <FileCheck size={16} />
                      <span>Đã mở</span>
                    </>
                  ) : isDownloading ? (
                    <>
                      <div className="lexi-loader-mini"></div>
                      <span>Đang mở...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Mở tài liệu</span>
                    </>
                  )}
                </button>
              </article>
            );
          })}

          {!isLoading && mediaAssets.length === 0 && (
            <article className="panel lexi-syllabus-card">
              <div className="lexi-doc-icon-container">
                <FileText size={26} className="lexi-doc-icon" />
              </div>
              <div className="lexi-doc-content-info">
                <h3 className="lexi-doc-title">Chưa có học liệu sẵn sàng</h3>
                <div className="lexi-doc-meta-row">
                  <span className="lexi-doc-meta-desc">
                    Tài liệu học tập sẽ hiển thị tại đây.
                  </span>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="lexi-library-explorer-section">
        <h2 className="lexi-library-section-title">
          <Scale size={20} />
          <span>Tra cứu nhanh văn bản pháp luật</span>
        </h2>

        <div className="lexi-explorer-segmented-bar">
          <button
            className={`lexi-explorer-tab ${
              activeDocument === "all" ? "active" : ""
            }`}
            onClick={() => setActiveDocument("all")}
            type="button"
          >
            Tất cả
          </button>
          {documentTabs.map((label) => (
            <button
              key={label}
              className={`lexi-explorer-tab ${
                activeDocument === label ? "active" : ""
              }`}
              onClick={() => setActiveDocument(label)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="lexi-explorer-grid-container">
          <div className="panel lexi-explorer-left-card">
            <div className="lexi-explorer-search-wrapper">
              <Search size={16} className="lexi-search-icon" />
              <input
                type="text"
                placeholder="Tìm theo số hiệu, tiêu đề hoặc nội dung..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="lexi-explorer-search-input"
              />
            </div>

            <div className="lexi-explorer-article-list">
              {filteredSources.map((source) => (
                <button
                  key={source.id}
                  className={`lexi-article-row-btn ${
                    selectedSource?.id === source.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectSource(source)}
                  type="button"
                >
                  <div className="lexi-article-row-meta">
                    <strong>{source.legalDocumentNo || "Nguồn"}</strong>
                    <span>{source.title}</span>
                  </div>
                  <ChevronRight size={14} className="lexi-chevron-indicator" />
                </button>
              ))}

              {!isLoading && filteredSources.length === 0 && (
                <div className="lexi-no-articles-found">
                  <HelpCircle size={32} />
                  <p>Không tìm thấy văn bản phù hợp.</p>
                </div>
              )}
            </div>
          </div>

          <div className="panel lexi-explorer-right-card">
            {selectedSource ? (
              <>
                <div className="lexi-right-card-header">
                  <span className="lexi-active-article-tag">
                    {selectedSource.legalDocumentNo || "VĂN BẢN PHÁP LÝ"}
                  </span>
                  <h3>{selectedSource.title}</h3>
                </div>

                <div className="lexi-active-article-body">
                  <div className="lexi-provision-content-block">
                    <h4>Nội dung văn bản:</h4>
                    <p className="lexi-raw-law-text">
                      {selectedSource.content}
                    </p>
                  </div>

                  <div className="lexi-interpretation-content-block">
                    <div className="lexi-interpretation-header">
                      <CheckCircle size={15} />
                      <span>Thông tin nguồn:</span>
                    </div>
                    <p className="lexi-interpreted-text">
                      Hiệu lực: {formatDate(selectedSource.effectiveDate)}.
                      Cập nhật: {formatDate(selectedSource.updatedAt)}.
                    </p>
                    {selectedSource.sourceUrl && (
                      <a
                        className="button button-secondary"
                        href={selectedSource.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Mở nguồn gốc
                      </a>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="lexi-no-articles-found">
                <HelpCircle size={32} />
                <p>
                  {isLoading
                    ? "Đang tải thư viện..."
                    : "Chưa có văn bản pháp lý đã xuất bản."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResourcesPage;
