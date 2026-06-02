import React, { useState } from "react";
import { MessageSquare, ThumbsUp, Tag, PlusCircle, Compass, HelpCircle, CheckCircle2, User, Sparkles, Send } from "lucide-react";
import type { AuthResponse } from "../types/auth";

type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  isSolved: boolean;
  time: string;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    time: string;
  }>;
};

type CommunityPageProps = {
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
};

export const CommunityPage: React.FC<CommunityPageProps> = ({ session, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<"all" | "civil" | "criminal" | "commercial" | "solved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // High fidelity initial scenarios
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      title: "Tranh chấp hợp đồng thuê nhà xưởng khi có sự kiện bất khả kháng do thiên tai",
      content: "Do bão kéo dài làm sập một phần mái nhà xưởng thuê, hoạt động sản xuất bị đình trệ 2 tuần. Bên thuê yêu cầu miễn giảm tiền thuê nhưng bên cho thuê từ chối vì cho rằng thiên tai là bất khả kháng, rủi ro tự chịu. Theo quy định Bộ luật Dân sự 2015, bên thuê có quyền đơn phương chấm dứt hợp đồng hoặc yêu cầu bồi thường không?",
      author: "Trần Minh Quân",
      category: "civil",
      tags: ["Hợp đồng", "Dân sự", "Bất khả kháng"],
      likes: 24,
      commentsCount: 3,
      isSolved: true,
      time: "2 giờ trước",
      comments: [
        {
          id: "1-1",
          author: "Luật sư Nguyễn Văn Bình",
          content: "Theo Điều 351 và Điều 420 BLDS 2015, đây có thể coi là trường hợp hoàn cảnh thay đổi cơ bản. Bên thuê hoàn toàn có quyền đàm phán lại. Nếu thương lượng thất bại, có thể khởi kiện yêu cầu Tòa án chấm dứt hợp đồng thuê tại thời điểm xưởng bị hỏng.",
          time: "1 giờ trước",
        },
        {
          id: "1-2",
          author: "Lê Hoàng Nam",
          content: "Rất chi tiết, công ty tôi cũng đang vướng đúng vụ này do đợt mưa lũ vừa rồi.",
          time: "45 phút trước",
        }
      ]
    },
    {
      id: "2",
      title: "Nhận biết hành vi lừa đảo chiếm đoạt tài sản qua cuộc gọi Deepfake giả danh",
      content: "Mẹ tôi vừa nhận được một cuộc gọi video chất lượng thấp giả danh tôi để mượn 50 triệu đồng vì sự cố giao thông. Mẹ tôi đã chuyển tiền. Sau khi phát hiện ra là giả mạo Deepfake, chúng tôi cần chuẩn bị những tài liệu chứng cứ gì để nộp cho cơ quan công an thụ lý?",
      author: "Nguyễn Bích Liên",
      category: "criminal",
      tags: ["Hình sự", "Lừa đảo", "Công nghệ cao"],
      likes: 42,
      commentsCount: 1,
      isSolved: false,
      time: "5 giờ trước",
      comments: [
        {
          id: "2-1",
          author: "Kiểm sát viên Trần Đức",
          content: "Bạn cần lập tức sao kê giao dịch ngân hàng, chụp lại lịch sử cuộc gọi, tin nhắn số tài khoản kẻ lừa đảo và quay phim lại đoạn video gọi nếu có. Đơn trình báo gửi lên Cơ quan CSĐT Công an quận/huyện nơi bạn cư trú.",
          time: "3 giờ trước",
        }
      ]
    },
    {
      id: "3",
      title: "Thủ tục đăng ký bảo hộ nhãn hiệu độc quyền cho startup công nghệ",
      content: "Chúng tôi chuẩn bị ra mắt ứng dụng kết nối pháp lý Lexi. Nhãn hiệu đã thiết kế xong logo và slogan. Có bắt buộc phải tra cứu nhãn hiệu trước khi nộp đơn lên Cục Sở hữu trí tuệ không, và thời gian duyệt đơn trung bình hiện nay là bao lâu?",
      author: "Phạm Anh Khoa",
      category: "commercial",
      tags: ["Sở hữu trí tuệ", "Thương mại", "Startup"],
      likes: 18,
      commentsCount: 0,
      isSolved: false,
      time: "1 ngày trước",
      comments: []
    }
  ]);

  // Composer Form state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("civil");
  const [newTagsStr, setNewTagsStr] = useState("");

  // Detailed Comments Modal / Expander state
  const [selectedPostIdForComments, setSelectedPostIdForComments] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tags = newTagsStr
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newPost: Post = {
      id: String(posts.length + 1),
      title: newTitle,
      content: newContent,
      author: session?.user?.profile?.fullName || session?.user?.email || "Cộng tác viên",
      category: newCategory,
      tags: tags.length > 0 ? tags : ["Tổng hợp"],
      likes: 0,
      commentsCount: 0,
      isSolved: false,
      time: "Vừa xong",
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    
    // Reset form
    setNewTitle("");
    setNewContent("");
    setNewCategory("civil");
    setNewTagsStr("");
    setIsComposerOpen(false);
  };

  const handleLikePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `${postId}-${p.comments.length + 1}`,
            author: session?.user?.profile?.fullName || session?.user?.email || "Học viên",
            content: newCommentText,
            time: "Vừa xong",
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
    setNewCommentText("");
  };

  const handleToggleSolved = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSolved: !p.isSolved } : p))
    );
  };

  // Filter posts
  const filteredPosts = React.useMemo(() => {
    return posts.filter((p) => {
      // Search filter
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Category tab filter
      if (activeTab === "all") return true;
      if (activeTab === "solved") return p.isSolved;
      return p.category === activeTab;
    });
  }, [posts, activeTab, searchQuery]);

  const categoryNameMap: Record<string, string> = {
    civil: "Dân sự",
    criminal: "Hình sự",
    commercial: "Thương mại",
  };

  return (
    <div className="lexi-community-root lexi-animate-fade">
      <div className="lexi-community-container">
        
        {/* Header */}
        <header className="lexi-community-header">
          <div className="header-badge">
            <Compass size={16} />
            <span>Cộng đồng Lexi</span>
            <span className="lexi-beta-pill">Beta</span>
          </div>
          <div className="header-title-row">
            <div>
              <h1>Cộng Đồng Hỏi Đáp Pháp Luật</h1>
              <p>Thảo luận tình huống thực tế, giải đáp thắc mắc và chia sẻ kinh nghiệm xử lý tranh chấp pháp lý.</p>
            </div>
            <button className="lexi-btn-create-post" onClick={() => setIsComposerOpen(true)}>
              <PlusCircle size={16} />
              <span>Đăng câu hỏi mới</span>
            </button>
          </div>
          <div className="lexi-inline-notice">
            <span>
              Cộng đồng đang chạy thử nghiệm (Beta). Các bài viết và bình luận trên 
              trang này chỉ được lưu trữ trong phiên trình duyệt hiện tại và không 
              phải là lời khuyên pháp lý chính thức.
            </span>
          </div>
        </header>

        {/* Workspace Columns */}
        <div className="lexi-community-grid">
          
          {/* Left Column: Feed & Composer */}
          <main className="lexi-community-feed">
            
            {/* Search Box */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm câu hỏi, từ khóa hoặc thẻ pháp luật..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Navigation */}
            <nav className="feed-navigation-tabs">
              <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>Tất cả</button>
              <button className={activeTab === "civil" ? "active" : ""} onClick={() => setActiveTab("civil")}>Dân sự</button>
              <button className={activeTab === "criminal" ? "active" : ""} onClick={() => setActiveTab("criminal")}>Hình sự</button>
              <button className={activeTab === "commercial" ? "active" : ""} onClick={() => setActiveTab("commercial")}>Thương mại & Startup</button>
              <button className={activeTab === "solved" ? "active" : ""} onClick={() => setActiveTab("solved")}>Đã giải quyết</button>
            </nav>

            {/* Composer Drawer (If open) */}
            {isComposerOpen && (
              <form className="composer-card panel-card lexi-animate-fade" onSubmit={handleCreatePost}>
                <h3>Đăng tình huống pháp lý mới</h3>
                <div className="composer-form-grid">
                  <div className="form-field">
                    <label>Tiêu đề tình huống</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Tranh chấp ranh giới đất đai khi hàng xóm xây tường bao..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-field-row-2">
                    <div className="form-field">
                      <label>Chủ đề chính</label>
                      <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                        <option value="civil">Dân sự (Hợp đồng, Đất đai, Hôn nhân...)</option>
                        <option value="criminal">Hình sự (Lừa đảo, Vi phạm hình sự...)</option>
                        <option value="commercial">Thương mại & Sở hữu trí tuệ</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Từ khóa / Thẻ (Phân cách bằng dấu phẩy)</label>
                      <input
                        type="text"
                        placeholder="Hợp đồng, Đất đai, Lừa đảo..."
                        value={newTagsStr}
                        onChange={(e) => setNewTagsStr(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Nội dung chi tiết tình huống</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Mô tả cụ thể sự việc xảy ra, các mâu thuẫn chính và câu hỏi cần giải đáp của bạn..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="composer-actions">
                  <button className="lexi-btn-action-primary" type="submit">Đăng bài ngay</button>
                  <button className="lexi-btn-action-secondary" type="button" onClick={() => setIsComposerOpen(false)}>Hủy bỏ</button>
                </div>
              </form>
            )}

            {/* Posts Grid */}
            <div className="posts-grid-stack">
              {filteredPosts.map((p) => {
                const isSelected = selectedPostIdForComments === p.id;
                return (
                  <div key={p.id} className="post-card">
                    {/* Top row */}
                    <div className="post-header-row">
                      <div className="author-block">
                        <div className="avatar-small">
                          <User size={14} />
                        </div>
                        <span className="author-name">{p.author}</span>
                        <span className="time-text">• {p.time}</span>
                      </div>

                      <div className="status-badges">
                        <span className="subject-badge">{categoryNameMap[p.category]}</span>
                        <button
                          className={`solved-badge-btn ${p.isSolved ? "solved" : "unsolved"}`}
                          title="Đổi trạng thái giải quyết"
                          onClick={(e) => handleToggleSolved(p.id, e)}
                        >
                          <CheckCircle2 size={13} />
                          <span>{p.isSolved ? "Đã giải đáp" : "Chưa có lời giải"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="post-title">{p.title}</h2>

                    {/* Content */}
                    <p className="post-body-content">{p.content}</p>

                    {/* Tags Row */}
                    <div className="post-tags-row">
                      {p.tags.map((t) => (
                        <span key={t} className="tag-item">
                          <Tag size={10} />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>

                    {/* Footer Widgets */}
                    <div className="post-footer-widgets">
                      <button className="widget-btn" onClick={(e) => handleLikePost(p.id, e)}>
                        <ThumbsUp size={14} />
                        <span>{p.likes} Thích</span>
                      </button>
                      
                      <button className="widget-btn" onClick={() => setSelectedPostIdForComments(isSelected ? null : p.id)}>
                        <MessageSquare size={14} />
                        <span>{p.commentsCount} Bình luận</span>
                      </button>
                    </div>

                    {/* Comments Thread (Expander) */}
                    {isSelected && (
                      <div className="post-comments-expander lexi-animate-fade">
                        <div className="comments-header">Bình luận từ cố vấn & học viên</div>
                        <div className="comments-list">
                          {p.comments.map((c) => (
                            <div key={c.id} className="comment-bubble">
                              <div className="comment-author-row">
                                <strong>{c.author}</strong>
                                <span>{c.time}</span>
                              </div>
                              <p>{c.content}</p>
                            </div>
                          ))}
                          {p.comments.length === 0 && (
                            <p className="no-comments">Chưa có bình luận nào cho tình huống này. Hãy là người đầu tiên giải đáp!</p>
                          )}
                        </div>

                        {/* Add comment textfield */}
                        <div className="comment-composer">
                          <input
                            type="text"
                            placeholder="Nhập nội dung tư vấn/bình luận của bạn..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddComment(p.id);
                            }}
                          />
                          <button className="btn-send-comment" onClick={() => handleAddComment(p.id)}>
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

              {filteredPosts.length === 0 && (
                <div className="feed-empty-state">
                  <HelpCircle size={48} style={{ color: "#cbd5e1", marginBottom: "16px" }} />
                  <h3>Không tìm thấy câu hỏi nào</h3>
                  <p>Hãy là người đầu tiên đăng câu hỏi thảo luận về chủ đề này nhé!</p>
                </div>
              )}
            </div>

          </main>

          {/* Right Column: Contributor stats sidebar */}
          <aside className="lexi-community-sidebar">
            <div className="panel-card contributors-panel">
              <h3>Top Chuyên Gia Tư Vấn</h3>
              <p className="subtitle">Thành viên đóng góp lời khuyên hữu ích nhất trong tuần.</p>
              
              <div className="contributor-list">
                <div className="contributor-item">
                  <div className="rank gold">1</div>
                  <div className="details">
                    <strong>Luật sư Nguyễn Văn Bình</strong>
                    <span>32 câu trả lời được duyệt</span>
                  </div>
                </div>
                
                <div className="contributor-item">
                  <div className="rank silver">2</div>
                  <div className="details">
                    <strong>Kiểm sát viên Trần Đức</strong>
                    <span>18 câu trả lời được duyệt</span>
                  </div>
                </div>

                <div className="contributor-item">
                  <div className="rank bronze">3</div>
                  <div className="details">
                    <strong>Học viên Lê Hoàng Nam</strong>
                    <span>12 câu trả lời hữu ích</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-card rule-card">
              <h3>Nội Quy Cộng Đồng</h3>
              <ul>
                <li>Đặt câu hỏi khách quan, rõ ràng, tôn trọng sự thật khách quan.</li>
                <li>Không chia sẻ thông tin bảo mật của cá nhân/tổ chức cụ thể.</li>
                <li>Mọi lời tư vấn mang tính chất tham khảo học thuật, không thay thế cho dịch vụ pháp lý chính thức.</li>
              </ul>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
};
export default CommunityPage;
