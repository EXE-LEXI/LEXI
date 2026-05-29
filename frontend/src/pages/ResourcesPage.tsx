import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  Download, 
  FileText, 
  Scale, 
  Filter,
  CheckCircle,
  FileCheck,
  ChevronRight,
  HelpCircle,
  Star
} from "lucide-react";

type LegalArticle = {
  id: string;
  code: "civil" | "criminal" | "commercial";
  number: string;
  title: string;
  content: string;
  interpretation: string;
};

type SyllabusDoc = {
  id: string;
  title: string;
  size: string;
  pages: number;
  rating: number;
  downloads: string;
};

const SYLLABUS_DOCS: SyllabusDoc[] = [
  {
    id: "doc-1",
    title: "Giáo trình Luật Dân sự 101 - Khóa học Lexi Academy",
    size: "2.4 MB",
    pages: 45,
    rating: 4.9,
    downloads: "1,240 lượt tải"
  },
  {
    id: "doc-2",
    title: "Sổ tay thực chiến: Giải quyết tranh chấp Hợp đồng Dân sự",
    size: "1.8 MB",
    pages: 32,
    rating: 4.8,
    downloads: "850 lượt tải"
  },
  {
    id: "doc-3",
    title: "Cẩm nang phòng vệ: Nhận diện tội phạm lừa đảo công nghệ cao & Deepfake",
    size: "3.2 MB",
    pages: 28,
    rating: 5.0,
    downloads: "2,150 lượt tải"
  }
];

const LEGAL_ARTICLES: LegalArticle[] = [
  // Bộ luật Dân sự 2015
  {
    id: "civ-12",
    code: "civil",
    number: "Điều 12",
    title: "Sự tôn trọng, bảo vệ quyền dân sự",
    content: "Quyền dân sự của cá nhân, pháp nhân được tôn trọng, bảo vệ theo quy định của pháp luật. Khi quyền dân sự bị xâm phạm, chủ thể có quyền tự bảo vệ theo quy định của Bộ luật này hoặc yêu cầu cơ quan, tổ chức có thẩm quyền bảo vệ.",
    interpretation: "Đây là nguyên tắc nền tảng tối thượng của luật học Việt Nam, bảo đảm mọi quyền lợi hợp pháp của công dân đều được Nhà nước công nhận, bảo vệ và xử lý công bằng khi xảy ra các tranh chấp."
  },
  {
    id: "civ-122",
    code: "civil",
    number: "Điều 122",
    title: "Giao dịch dân sự vô hiệu",
    content: "Giao dịch dân sự không có một trong các điều kiện quy định tại Điều 117 của Bộ luật này thì vô hiệu, trừ trường hợp Bộ luật này có quy định khác.",
    interpretation: "Giao dịch dân sự vô hiệu nghĩa là cam kết đó hoàn toàn không có hiệu lực ràng buộc pháp lý từ thời điểm thiết lập. Các bên có nghĩa vụ phải hoàn trả cho nhau những gì đã nhận ban đầu."
  },
  {
    id: "civ-156",
    code: "civil",
    number: "Điều 156",
    title: "Sự kiện bất khả kháng",
    content: "Sự kiện bất khả kháng là sự kiện xảy ra một cách khách quan không thể lường trước được và không thể khắc phục được mặc dù đã áp dụng mọi biện pháp cần thiết và khả năng cho phép.",
    interpretation: "Khái niệm cực kỳ cốt lõi được áp dụng để miễn trừ nghĩa vụ bồi thường hợp đồng trong các hoàn cảnh đặc biệt khách quan (như thiên tai, dịch bệnh kéo dài, chiến tranh, sự thay đổi đột ngột của chính sách vĩ mô)."
  },
  {
    id: "civ-351",
    code: "civil",
    number: "Điều 351",
    title: "Trách nhiệm dân sự do vi phạm nghĩa vụ",
    content: "Bên có nghĩa vụ mà vi phạm nghĩa vụ thì phải chịu trách nhiệm dân sự đối với bên có quyền. Trường hợp bên có nghĩa vụ không thực hiện được nghĩa vụ do sự kiện bất khả kháng thì không phải chịu trách nhiệm dân sự, trừ trường hợp có thỏa thuận khác hoặc pháp luật có quy định khác.",
    interpretation: "Điều khoản cốt lõi ràng buộc nghĩa vụ bồi thường thiệt hại khi một bên vi phạm giao ước, đồng thời quy định nguyên lý loại trừ trách nhiệm khi vi phạm phát sinh trực tiếp từ Sự kiện bất khả kháng."
  },
  // Bộ luật Hình sự 2015
  {
    id: "crim-8",
    code: "criminal",
    number: "Điều 8",
    title: "Khái niệm tội phạm",
    content: "Tội phạm là hành vi nguy hiểm cho xã hội được quy định trong Bộ luật Hình sự, do người có năng lực trách nhiệm hình sự hoặc pháp nhân thương mại thực hiện một cách cố ý hoặc vô ý, xâm phạm độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ...",
    interpretation: "Văn bản định nghĩa nguồn gốc cơ sở pháp lý để cấu thành và xác minh một hành vi vi phạm có bị khởi tố hình sự hay chỉ xử phạt vi phạm hành chính thông thường."
  },
  {
    id: "crim-174",
    code: "criminal",
    number: "Điều 174",
    title: "Tội lừa đảo chiếm đoạt tài sản",
    content: "Người nào bằng thủ đoạn gian dối chiếm đoạt tài sản của người khác trị giá từ 2.000.000 đồng đến dưới 50.000.000 đồng hoặc dưới 2.000.000 đồng nhưng thuộc một trong các trường hợp luật định, thì bị phạt cải tạo không giam giữ đến 03 năm hoặc phạt tù từ 06 tháng đến 03 năm...",
    interpretation: "Quy định cơ cấu hình phạt của các thủ đoạn gian dối nhằm chiếm đoạt tài sản của nạn nhân. Rất phổ biến khi xử lý các vụ án lừa đảo công nghệ cao, giả mạo cuộc gọi mượn tiền qua mạng xã hội hiện nay."
  },
  {
    id: "crim-290",
    code: "criminal",
    number: "Điều 290",
    title: "Thu thập, trao đổi thông tin tài khoản ngân hàng trái phép",
    content: "Người nào thu thập, tàng trữ, trao đổi, mua bán, công khai hóa thông tin về tài khoản ngân hàng của người khác trái phép nhằm mục đích trục lợi, thì bị xử lý hình sự tùy theo mức độ vi phạm...",
    interpretation: "Lá chắn pháp lý trực diện để dập tắt và xử phạt các đường dây thu gom, mua bán số tài khoản ngân hàng ảo - công cụ tiếp tay đắc lực cho hoạt động lừa đảo rửa tiền xuyên quốc gia."
  },
  // Luật Thương mại 2005
  {
    id: "com-3",
    code: "commercial",
    number: "Điều 3",
    title: "Giải thích hoạt động thương mại",
    content: "Hoạt động thương mại là hoạt động nhằm mục đích sinh lợi, bao gồm mua bán hàng hóa, cung ứng dịch vụ, đầu tư, xúc tiến thương mại và các hoạt động nhằm mục đích sinh lợi khác...",
    interpretation: "Điều luật vĩ mô khoanh vùng chính xác phạm vi điều chỉnh đặc thù của Luật Thương mại đối với các chủ thể là doanh nghiệp, thương nhân hoạt động kinh doanh có phát sinh lợi nhuận."
  },
  {
    id: "com-294",
    code: "commercial",
    number: "Điều 294",
    title: "Các trường hợp miễn trách nhiệm đối với vi phạm hợp đồng",
    content: "Bên vi phạm hợp đồng được miễn trách nhiệm trong các trường hợp sau đây: Xảy ra trường hợp miễn trách nhiệm mà các bên đã thoả thuận; Xảy ra sự kiện bất khả kháng; Hành vi vi phạm của một bên hoàn toàn do lỗi của bên kia...",
    interpretation: "Cơ sở cốt lõi để các doanh nghiệp tranh tụng và bảo vệ mình trước tòa án kinh tế khi các cam kết hợp tác bị gián đoạn do sự cố khách quan hoặc do lỗi hoàn toàn xuất phát từ đối tác."
  }
];

export const ResourcesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"civil" | "criminal" | "commercial">("civil");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<LegalArticle>(LEGAL_ARTICLES[0]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedDocs, setDownloadedDocs] = useState<Record<string, boolean>>({});

  const filteredArticles = LEGAL_ARTICLES.filter((article) => {
    const matchesTab = article.code === activeTab;
    const matchesSearch = 
      article.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  function handleTriggerDownload(docId: string) {
    if (downloadedDocs[docId] || downloadingId) return;

    setDownloadingId(docId);
    setTimeout(() => {
      setDownloadedDocs((prev) => ({ ...prev, [docId]: true }));
      setDownloadingId(null);
    }, 1200);
  }

  return (
    <main className="page lexi-library-root">
      <p className="eyebrow">Thư Viện Pháp Lý</p>
      <h1>Học liệu & Tra cứu Bộ luật</h1>
      
      {/* 1. PDF Documents & Academy Syllabus Center */}
      <section className="lexi-library-syllabus-section">
        <h2 className="lexi-library-section-title">
          <BookOpen size={20} />
          <span>Tài liệu & Giáo trình số</span>
        </h2>
        
        <div className="lexi-syllabus-cards-grid">
          {SYLLABUS_DOCS.map((doc) => {
            const isDownloading = downloadingId === doc.id;
            const isDownloaded = downloadedDocs[doc.id];
            
            return (
              <article className="panel lexi-syllabus-card" key={doc.id}>
                <div className="lexi-doc-icon-container">
                  <FileText size={26} className="lexi-doc-icon" />
                </div>
                
                <div className="lexi-doc-content-info">
                  <h3 className="lexi-doc-title">{doc.title}</h3>
                  <div className="lexi-doc-meta-row">
                    <span className="lexi-doc-meta-badge">{doc.size}</span>
                    <span className="lexi-doc-meta-badge">{doc.pages} trang</span>
                    <span className="lexi-doc-meta-badge doc-rating">
                      <Star size={12} className="fill-gold" />
                      <span>{doc.rating.toFixed(1)}</span>
                    </span>
                    <span className="lexi-doc-meta-desc">{doc.downloads}</span>
                  </div>
                </div>

                <button 
                  className={`lexi-btn-doc-download ${isDownloaded ? "downloaded" : ""} ${isDownloading ? "loading" : ""}`}
                  type="button"
                  onClick={() => handleTriggerDownload(doc.id)}
                  disabled={isDownloading}
                >
                  {isDownloaded ? (
                    <>
                      <FileCheck size={16} />
                      <span>Đã tải về</span>
                    </>
                  ) : isDownloading ? (
                    <>
                      <div className="lexi-loader-mini"></div>
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Tải xuống</span>
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* 2. Interactive Legal Provisions Explorer */}
      <section className="lexi-library-explorer-section">
        <h2 className="lexi-library-section-title">
          <Scale size={20} />
          <span>Tra cứu nhanh Văn bản Pháp luật</span>
        </h2>

        <div className="lexi-explorer-segmented-bar">
          <button 
            className={`lexi-explorer-tab ${activeTab === "civil" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("civil");
              const firstCiv = LEGAL_ARTICLES.find(a => a.code === "civil");
              if (firstCiv) setSelectedArticle(firstCiv);
            }}
          >
            Bộ luật Dân sự 2015
          </button>
          <button 
            className={`lexi-explorer-tab ${activeTab === "criminal" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("criminal");
              const firstCrim = LEGAL_ARTICLES.find(a => a.code === "criminal");
              if (firstCrim) setSelectedArticle(firstCrim);
            }}
          >
            Bộ luật Hình sự 2015
          </button>
          <button 
            className={`lexi-explorer-tab ${activeTab === "commercial" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("commercial");
              const firstCom = LEGAL_ARTICLES.find(a => a.code === "commercial");
              if (firstCom) setSelectedArticle(firstCom);
            }}
          >
            Luật Thương mại 2005
          </button>
        </div>

        <div className="lexi-explorer-grid-container">
          
          {/* Left panel: Search & Article List */}
          <div className="panel lexi-explorer-left-card">
            <div className="lexi-explorer-search-wrapper">
              <Search size={16} className="lexi-search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo số Điều hoặc nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="lexi-explorer-search-input"
              />
            </div>

            <div className="lexi-explorer-article-list">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  className={`lexi-article-row-btn ${selectedArticle.id === article.id ? "active" : ""}`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="lexi-article-row-meta">
                    <strong>{article.number}</strong>
                    <span>{article.title}</span>
                  </div>
                  <ChevronRight size={14} className="lexi-chevron-indicator" />
                </button>
              ))}

              {filteredArticles.length === 0 && (
                <div className="lexi-no-articles-found">
                  <HelpCircle size={32} />
                  <p>Không tìm thấy Điều luật nào khớp với từ khóa tìm kiếm.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active Article Full Content & Analysis */}
          <div className="panel lexi-explorer-right-card">
            <div className="lexi-right-card-header">
              <span className="lexi-active-article-tag">
                {activeTab === "civil" ? "LUẬT DÂN SỰ" : activeTab === "criminal" ? "LUẬT HÌNH SỰ" : "LUẬT THƯƠNG MẠI"}
              </span>
              <h3>{selectedArticle.number}: {selectedArticle.title}</h3>
            </div>

            <div className="lexi-active-article-body">
              <div className="lexi-provision-content-block">
                <h4>Nội dung văn bản quy phạm:</h4>
                <p className="lexi-raw-law-text">“{selectedArticle.content}”</p>
              </div>

              <div className="lexi-interpretation-content-block">
                <div className="lexi-interpretation-header">
                  <CheckCircle size={15} />
                  <span>Giải nghĩa chi tiết từ Chuyên gia Lexi:</span>
                </div>
                <p className="lexi-interpreted-text">{selectedArticle.interpretation}</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};
export default ResourcesPage;
