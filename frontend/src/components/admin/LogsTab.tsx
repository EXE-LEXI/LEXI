import React from "react";
import type { AdminDeliveryLog } from "../../api/admin";
import { formatDate } from "../../utils/format";

type LogsTabProps = {
  deliveryLogs: AdminDeliveryLog[];
};

export function LogsTab({ deliveryLogs }: LogsTabProps) {
  return (
    <div className="lexi-cms-panel-card">
      <div className="lexi-cms-panel-header">
        <h2>Lịch sử gửi thông báo (Nhật ký)</h2>
      </div>
      <div className="lexi-cms-panel-content">
        <div className="lexi-cms-table-wrapper">
          <table className="lexi-cms-table">
            <thead>
              <tr>
                <th>Loại thông báo</th>
                <th>Trạng thái</th>
                <th>Provider Message ID</th>
                <th>Ngày khởi tạo</th>
              </tr>
            </thead>
            <tbody>
              {deliveryLogs.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.type || "SYSTEM"}</strong>
                  </td>
                  <td>
                    <span className={`lexi-cms-badge-status ${item.status === "DELIVERED" || item.status === "SUCCESS" ? "active" : "inactive"}`}>
                      {item.status ?? "PENDING"}
                    </span>
                  </td>
                  <td>{item.providerMessageId || "-"}</td>
                  <td>{item.createdAt ? formatDate(item.createdAt) : ""}</td>
                </tr>
              ))}
              {deliveryLogs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#94a3b8", padding: "30px" }}>
                    Không có lịch sử nhật ký thông báo nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
