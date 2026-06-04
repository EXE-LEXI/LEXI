import React, { useMemo, useState, useEffect } from "react";
import {
  CheckCircle2,
  Compass,
  HelpCircle,
  MessageSquare,
  PlusCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  ThumbsUp,
  User,
  Trash2,
} from "lucide-react";
import type { AuthResponse } from "../types/auth";
import {
  getCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  togglePostSolvedStatus,
  addCommunityComment,
  deleteCommunityPost,
  CommunityPost,
} from "../api/community";

type Category = "civil" | "criminal" | "commercial";

type CommunityPageProps = {
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
};

const CATEGORY_LABELS: Record<Category, string> = {
  civil: "Dân sự",
  criminal: "Hình sự",
  commercial: "Thương mại",
};

export const CommunityPage: React.FC<CommunityPageProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<"all" | Category | "solved">( "all" );
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("civil");
  const [newTagsStr, setNewTagsStr] = useState("");
  const [selectedPostIdForComments, setSelectedPostIdForComments] =
    useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  const displayName =
    session?.user?.profile?.fullName || session?.user?.email || "Học viên";

  const fetchPosts = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      const data = await getCommunityPosts(session.accessToken);
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [session?.accessToken]);

  const filteredPosts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch =
        !keyword ||
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.tags.some((tag) => tag.toLowerCase().includes(keyword));

      if (!matchesSearch) return false;
      if (activeTab === "all") return true;
      if (activeTab === "solved") return post.isSolved;
      return post.category === activeTab;
    });
  }, [activeTab, posts, searchQuery]);

  async function handleCreatePost(event: React.FormEvent) {
    event.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !session?.accessToken) return;

    if (newTitle.trim().length < 10) {
      alert("Tiêu đề tình huống phải có ít nhất 10 ký tự.");
      return;
    }
    if (newContent.trim().length < 30) {
      alert("Nội dung chi tiết phải có ít nhất 30 ký tự.");
      return;
    }

    const tags = newTagsStr
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const newPost = await createCommunityPost(session.accessToken, {
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: tags.length ? tags : ["Tổng hợp"],
      });
      setPosts((prev) => [newPost, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewCategory("civil");
      setNewTagsStr("");
      setIsComposerOpen(false);
    } catch (err) {
      console.error(err);
      alert("Không thể đăng câu hỏi. Vui lòng thử lại.");
    }
  }

  async function handleLikePost(postId: string, event: React.MouseEvent) {
    event.stopPropagation();
    if (!session?.accessToken) return;

    try {
      const updatedPost = await likeCommunityPost(session.accessToken, postId);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddComment(postId: string) {
    if (!newCommentText.trim() || !session?.accessToken) return;

    try {
      const newComment = await addCommunityComment(
        session.accessToken,
        postId,
        newCommentText.trim()
      );
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        })
      );
      setNewCommentText("");
    } catch (err) {
      console.error(err);
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    }
  }

  async function handleToggleSolved(postId: string, event: React.MouseEvent) {
    event.stopPropagation();
    if (!session?.accessToken) return;

    try {
      const updatedPost = await togglePostSolvedStatus(
        session.accessToken,
        postId
      );
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePost(postId: string, event: React.MouseEvent) {
    event.stopPropagation();
    if (!session?.accessToken) return;

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?");
    if (!confirmed) return;

    try {
      await deleteCommunityPost(session.accessToken, postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      if (selectedPostIdForComments === postId) {
        setSelectedPostIdForComments(null);
      }
    } catch (err) {
      console.error(err);
      alert("Không thể xóa bài viết.");
    }
  }

  function formatTime(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Gần đây";
    }
  }

  return (
    <div className="lexi-community-root lexi-animate-fade">
      <div className="lexi-community-container">
        <header className="lexi-community-header">
          <div className="header-badge">
            <Compass size={16} />
            <span>Cộng đồng Lexi</span>
            <span className="lexi-beta-pill">Beta</span>
          </div>
          <div className="header-title-row">
            <div>
              <h1>Cộng đồng hỏi đáp pháp luật</h1>
              <p>
                Thảo luận tình huống thực tế, chia sẻ kinh nghiệm xử lý tranh
                chấp và nhận góp ý từ học viên, cố vấn.
              </p>
            </div>
            <button
              className="lexi-btn-create-post"
              onClick={() => setIsComposerOpen(true)}
            >
              <PlusCircle size={16} />
              <span>Đăng câu hỏi mới</span>
            </button>
          </div>
          <div className="lexi-inline-notice">
            <span>
              Cộng đồng hỏi đáp và chia sẻ kiến thức pháp luật của Lexi. Câu hỏi được lưu trữ trực tuyến và hỗ trợ kiểm duyệt bởi Admin.
            </span>
          </div>
        </header>

        <div className="lexi-community-grid">
          <main className="lexi-community-feed">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm câu hỏi, từ khóa hoặc thẻ pháp lý..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <nav className="feed-navigation-tabs">
              <button
                className={activeTab === "all" ? "active" : ""}
                onClick={() => setActiveTab("all")}
              >
                Tất cả
              </button>
              <button
                className={activeTab === "civil" ? "active" : ""}
                onClick={() => setActiveTab("civil")}
              >
                Dân sự
              </button>
              <button
                className={activeTab === "criminal" ? "active" : ""}
                onClick={() => setActiveTab("criminal")}
              >
                Hình sự
              </button>
              <button
                className={activeTab === "commercial" ? "active" : ""}
                onClick={() => setActiveTab("commercial")}
              >
                Thương mại
              </button>
              <button
                className={activeTab === "solved" ? "active" : ""}
                onClick={() => setActiveTab("solved")}
              >
                Đã giải đáp
              </button>
            </nav>

            {isComposerOpen && (
              <form
                className="composer-card panel-card lexi-animate-fade"
                onSubmit={handleCreatePost}
              >
                <h3>Đăng tình huống pháp lý mới</h3>
                <div className="composer-form-grid">
                  <div className="form-field">
                    <label>Tiêu đề tình huống</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Tranh chấp tiền cọc thuê nhà..."
                      value={newTitle}
                      onChange={(event) => setNewTitle(event.target.value)}
                    />
                  </div>

                  <div className="form-field-row-2">
                    <div className="form-field">
                      <label>Chủ đề chính</label>
                      <select
                        value={newCategory}
                        onChange={(event) =>
                          setNewCategory(event.target.value as Category)
                        }
                      >
                        <option value="civil">Dân sự</option>
                        <option value="criminal">Hình sự</option>
                        <option value="commercial">Thương mại</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Từ khóa, cách nhau bằng dấu phẩy</label>
                      <input
                        type="text"
                        placeholder="Hợp đồng, đất đai, lừa đảo..."
                        value={newTagsStr}
                        onChange={(event) => setNewTagsStr(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Nội dung chi tiết</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Mô tả sự việc, các mốc thời gian, chứng cứ đang có và câu hỏi cần giải đáp..."
                      value={newContent}
                      onChange={(event) => setNewContent(event.target.value)}
                    />
                  </div>
                </div>

                <div className="composer-actions">
                  <button className="lexi-btn-action-primary" type="submit">
                    Đăng bài
                  </button>
                  <button
                    className="lexi-btn-action-secondary"
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="lexi-inline-notice" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <span>{error}</span>
              </div>
            )}

            <div className="posts-grid-stack">
              {loading ? (
                <div className="feed-empty-state">
                  <h3>Đang tải danh sách câu hỏi...</h3>
                </div>
              ) : filteredPosts.map((post) => {
                const isSelected = selectedPostIdForComments === post.id;
                const isAdmin = session?.user?.role === "ADMIN";
                const canDelete = isAdmin || post.authorId === session?.user?.id;

                return (
                  <div key={post.id} className="post-card">
                    <div className="post-header-row">
                      <div className="author-block">
                        <div className="avatar-small">
                          <User size={14} />
                        </div>
                        <span className="author-name">{post.authorName}</span>
                        <span className="time-text">• {formatTime(post.createdAt)}</span>
                      </div>

                      <div className="status-badges" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="subject-badge">
                          {CATEGORY_LABELS[post.category as Category] || post.category}
                        </span>
                        <button
                          className={`solved-badge-btn ${
                            post.isSolved ? "solved" : "unsolved"
                          }`}
                          title="Đổi trạng thái giải đáp"
                          onClick={(event) =>
                            handleToggleSolved(post.id, event)
                          }
                        >
                          <CheckCircle2 size={13} />
                          <span>
                            {post.isSolved ? "Đã giải đáp" : "Đang thảo luận"}
                          </span>
                        </button>
                        {canDelete && (
                          <button
                            className="solved-badge-btn delete-badge"
                            style={{ 
                              backgroundColor: "rgba(239, 68, 68, 0.1)", 
                              color: "#ef4444", 
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer"
                            }}
                            onClick={(event) => handleDeletePost(post.id, event)}
                          >
                            <Trash2 size={13} />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <h2 className="post-title">
                      {post.title}
                      <span className="title-comment-count-badge">
                        {post.comments ? post.comments.length : 0} bình luận
                      </span>
                    </h2>
                    <p className="post-body-content">{post.content}</p>

                    <div className="post-tags-row">
                      {post.tags.map((tag) => (
                        <span key={tag} className="tag-item">
                          <Tag size={10} />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>

                    <div className="post-footer-widgets">
                      <button
                        className="widget-btn"
                        onClick={(event) => handleLikePost(post.id, event)}
                      >
                        <ThumbsUp size={14} />
                        <span>{post.likes} Thích</span>
                      </button>

                      <button
                        className="widget-btn"
                        onClick={() =>
                          setSelectedPostIdForComments(
                            isSelected ? null : post.id
                          )
                        }
                      >
                        <MessageSquare size={14} />
                        <span>{post.comments ? post.comments.length : 0} Bình luận</span>
                      </button>
                    </div>

                    {isSelected && (
                      <div className="post-comments-expander lexi-animate-fade">
                        <div className="comments-header">
                          Bình luận từ cố vấn và học viên
                        </div>
                        <div className="comments-list">
                          {post.comments && post.comments.map((comment) => {
                            const isAdvisor = comment.authorName.includes("Admin") || comment.authorName.includes("Cố vấn");
                            return (
                              <div key={comment.id} className={`comment-bubble ${isAdvisor ? "is-advisor" : ""}`}>
                                <div className="comment-author-row">
                                  <div className="comment-author-info">
                                    <strong>{comment.authorName}</strong>
                                    {isAdvisor && (
                                      <span className="comment-advisor-badge">Cố vấn pháp lý</span>
                                    )}
                                  </div>
                                  <span>{formatTime(comment.createdAt)}</span>
                                </div>
                                <p>{comment.content}</p>
                              </div>
                            );
                          })}
                          {(!post.comments || post.comments.length === 0) && (
                            <p className="no-comments">
                              Chưa có bình luận. Hãy bổ sung góc nhìn đầu tiên.
                            </p>
                          )}
                        </div>

                        <div className="comment-composer">
                          <input
                            type="text"
                            placeholder="Nhập bình luận của bạn..."
                            value={newCommentText}
                            onChange={(event) =>
                              setNewCommentText(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter")
                                handleAddComment(post.id);
                            }}
                          />
                          <button
                            className="btn-send-comment"
                            onClick={() => handleAddComment(post.id)}
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {!loading && filteredPosts.length === 0 && (
                <div className="feed-empty-state">
                  <HelpCircle
                    size={48}
                    style={{ color: "#cbd5e1", marginBottom: 16 }}
                  />
                  <h3>Không tìm thấy câu hỏi nào</h3>
                  <p>Hãy đăng câu hỏi mới cho chủ đề này.</p>
                </div>
              )}
            </div>
          </main>

          <aside className="lexi-community-sidebar">
            <div className="panel-card contributors-panel">
              <h3>Đóng góp nổi bật</h3>
              <p className="subtitle">
                Thành viên có câu trả lời hữu ích trong tuần.
              </p>

              <div className="contributor-list">
                <div className="contributor-item">
                  <div className="rank gold">1</div>
                  <div className="details">
                    <strong>Cố vấn Nguyễn Văn Bình</strong>
                    <span>32 câu trả lời được đánh dấu hữu ích</span>
                  </div>
                </div>
                <div className="contributor-item">
                  <div className="rank silver">2</div>
                  <div className="details">
                    <strong>Cố vấn Trần Đức</strong>
                    <span>18 câu trả lời được phản hồi tốt</span>
                  </div>
                </div>
                <div className="contributor-item">
                  <div className="rank bronze">3</div>
                  <div className="details">
                    <strong>Học viên Lê Hoàng Nam</strong>
                    <span>12 bình luận hữu ích</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-card rule-card">
              <h3>Nội quy cộng đồng</h3>
              <ul>
                <li>Đặt câu hỏi rõ sự kiện, thời gian và chứng cứ đang có.</li>
                <li>Không công khai dữ liệu cá nhân, số tài khoản hoặc hồ sơ nhạy cảm.</li>
                <li>Câu trả lời chỉ mang tính học tập, không thay thế tư vấn pháp lý chính thức.</li>
              </ul>
            </div>

            <div className="panel-card rule-card">
              <h3>Gợi ý đăng bài tốt</h3>
              <ul>
                <li>Viết ngắn gọn, tách bối cảnh và câu hỏi cần giải đáp.</li>
                <li>Chọn đúng chủ đề để người có kinh nghiệm dễ hỗ trợ.</li>
                <li>Cập nhật trạng thái đã giải đáp khi đã có hướng xử lý.</li>
              </ul>
              <div className="header-badge" style={{ marginTop: 14 }}>
                <ShieldCheck size={16} />
                <span>Ưu tiên an toàn thông tin</span>
              </div>
              <div className="header-badge" style={{ marginTop: 8 }}>
                <Sparkles size={16} />
                <span>Lưu trữ bài viết đồng bộ đám mây</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
