import React, { useState } from "react";

export function SettingsTab() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="lexi-cms-panel-card">
      <div className="lexi-cms-panel-header">
        <h2>Cau hinh he thong quan tri Lexi CMS</h2>
      </div>
      <div className="lexi-cms-panel-content" style={{ maxWidth: "480px" }}>
        {notice && <div className="lexi-inline-notice">{notice}</div>}

        <div className="lexi-cms-form-group">
          <label>Ten he thong CMS</label>
          <input type="text" className="lexi-cms-form-input" defaultValue="Lexi Law Academy CMS" />
        </div>
        <div className="lexi-cms-form-group">
          <label>Domain dich vu luu tru (CDN)</label>
          <input type="text" className="lexi-cms-form-input" defaultValue="https://storage.lexi.law" />
        </div>
        <div className="lexi-cms-form-group">
          <label>Che do dong bo AI Mentor</label>
          <select className="lexi-cms-form-select" defaultValue="auto">
            <option value="auto">Tu dong de xuat trac nghiem</option>
            <option value="manual">Yeu cau duyet khuyen nghi</option>
            <option value="disabled">Tam tat AI Advisor</option>
          </select>
        </div>
        <button
          className="lexi-cms-btn-save"
          style={{ marginTop: "12px" }}
          type="button"
          onClick={() => setNotice("Da luu cau hinh cai dat quan tri thanh cong.")}
        >
          Luu cau hinh
        </button>
      </div>
    </div>
  );
}
