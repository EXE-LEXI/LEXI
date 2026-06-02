import React, { useState, useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";

type LegalDisclaimerProps = {
  onReportContent?: () => void;
};

export function LegalDisclaimer({ onReportContent }: LegalDisclaimerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has already dismissed the disclaimer
    const isDismissed = localStorage.getItem("lexi_disclaimer_dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("lexi_disclaimer_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside className="legal-disclaimer" aria-label="Lưu ý pháp lý">
      <div className="legal-disclaimer-header">
        <div className="legal-disclaimer-title">
          <ShieldAlert size={16} aria-hidden="true" />
          <span>Lưu ý pháp lý quan trọng</span>
        </div>
        <button
          className="legal-disclaimer-close-btn"
          type="button"
          onClick={handleDismiss}
          title="Ẩn thông báo"
          aria-label="Đóng thông báo lưu ý pháp lý"
        >
          <X size={14} />
        </button>
      </div>

      <p>
        LEXI cung cấp nội dung học tập pháp luật phổ thông và thông tin mang tính chất tham khảo. 
        Nội dung trên nền tảng không thay thế cho tư vấn pháp lý chính thức. Vui lòng đối chiếu với 
        văn bản pháp luật gốc hoặc liên hệ chuyên gia khi cần quyết định cho vụ việc cụ thể.
      </p>

      {onReportContent ? (
        <div className="legal-disclaimer-footer">
          <button
            className="legal-disclaimer-action"
            type="button"
            onClick={onReportContent}
          >
            Báo cáo nội dung
          </button>
        </div>
      ) : null}
    </aside>
  );
}

export default LegalDisclaimer;

