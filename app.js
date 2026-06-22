// === CONFIG ===
// Thay URL này bằng Web App URL mới nhất sau khi Deploy Apps Script.
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzV0GgeOxo0FTUHt7rGq2d8Xn3K8a-z5nqxlaaTGObxPUsS4yCwXSyrnUnjW-kixnC70Q/exec";

const rowTemplates = {
  congTac: ['Thời gian', 'Nơi công tác', 'Công việc đảm nhiệm'],
  deTai: ['Tên đề tài', 'Năm bắt đầu/hoàn thành', 'Cấp đề tài', 'Trách nhiệm tham gia'],
  baiBao: ['Tên công trình', 'Năm', 'Tạp chí/NXB', 'Loại', 'Q', 'Vai trò', 'DOI/Link', 'Điểm']
};

function addRow(type, values = []) {
  const tbody = document.querySelector(`#${type}Table tbody`);
  if (!tbody) return;
  const tr = document.createElement('tr');
  const cols = rowTemplates[type];
  tr.innerHTML = cols.map((placeholder, i) => {
    const val = values[i] || '';
    if (type === 'baiBao' && placeholder === 'Loại') {
      return `<td><select><option></option><option>WoS</option><option>Scopus</option><option>HDGS</option><option>Trong nước</option><option>Khác</option></select></td>`;
    }
    if (type === 'baiBao' && placeholder === 'Q') {
      return `<td><select><option></option><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option><option>Không xếp Q</option></select></td>`;
    }
    if (type === 'baiBao' && placeholder === 'Vai trò') {
      return `<td><select><option></option><option>Tác giả đầu</option><option>Tác giả liên hệ</option><option>Đồng tác giả</option></select></td>`;
    }
    if (type === 'baiBao' && placeholder === 'Điểm') {
      return `<td><input type="number" min="0" step="0.01" placeholder="0.00" value="${escapeAttr(val)}" oninput="updateSummary()" /></td>`;
    }
    return `<td><input placeholder="${placeholder}" value="${escapeAttr(val)}" /></td>`;
  }).join('') + `<td><button type="button" class="remove" onclick="this.closest('tr').remove();updateSummary();">Xóa</button></td>`;
  tbody.appendChild(tr);
  updateSummary();
}

function collectTable(type) {
  return Array.from(document.querySelectorAll(`#${type}Table tbody tr`)).map(tr => {
    return Array.from(tr.querySelectorAll('input,select')).map(el => el.value.trim());
  }).filter(row => row.join('').trim() !== '');
}

function formToData() {
  const form = document.getElementById('llkhForm');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.congTac = collectTable('congTac');
  data.deTai = collectTable('deTai');
  data.baiBao = collectTable('baiBao');
  data.tongBai = String(data.baiBao.length);
  data.tongDiem = String(sumDiem(data.baiBao));
  return data;
}

function sumDiem(rows) {
  return rows.reduce((sum, r) => sum + (parseFloat(String(r[7] || '0').replace(',', '.')) || 0), 0).toFixed(2);
}

function updateSummary() {
  const baiBao = collectTable('baiBao');
  document.getElementById('tongBai').textContent = baiBao.length;
  document.getElementById('tongDiem').textContent = sumDiem(baiBao);
}

async function submitForm(e) {
  e.preventDefault();
  const status = document.getElementById('status');
  status.className = '';
  status.textContent = 'Đang gửi hồ sơ...';
  const data = formToData();
  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { status: 'ok' }; }
    if (json.status && json.status !== 'ok') throw new Error(json.message || 'Không gửi được hồ sơ');
    if (json.profileId) {
      document.getElementById('profileId').value = json.profileId;
      localStorage.setItem('llkh_profileId', json.profileId);
    }
    status.className = 'ok';
    status.textContent = 'Đã gửi hồ sơ thành công. Khoa có thể xuất PDF trong trang quản trị.';
  } catch (err) {
    status.className = 'err';
    status.textContent = 'Không gửi được hồ sơ. Kiểm tra Web App URL, quyền Apps Script và Deploy mới. Chi tiết: ' + err.message;
  }
}

function previewPDF_LLKH() {
  const d = normalizedData(formToData());
  const html = buildLLKHHtml(d);
  const w = window.open('', '_blank');
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.focus(); }, 300);
}

function normalizedData(raw) {
  const main = {
    HoTen: raw.hoTen, GioiTinh: raw.gioiTinh, NgaySinh: raw.ngaySinh, NoiSinh: raw.noiSinh,
    QueQuan: raw.queQuan, DanToc: raw.danToc, HocVi: raw.hocVi, NamNuocHocVi: raw.namNuocHocVi,
    ChucDanh: raw.chucDanh, NamBoNhiem: raw.namBoNhiem, ChucVu: raw.chucVu, DonVi: raw.donVi,
    DiaChi: raw.diaChi, DienThoai: raw.dienThoai, Email: raw.email,
    DH_NoiDaoTao: raw.dhNoiDaoTao, DH_Nganh: raw.dhNganh, DH_Nuoc: raw.dhNuoc, DH_Nam: raw.dhNam,
    ThS_Nganh: raw.thsNganh, ThS_ThongTin: raw.thsThongTin, TS_Nganh: raw.tsNganh, TS_ThongTin: raw.tsThongTin,
    TenLuanAn: raw.tenLuanAn, NgoaiNgu1: raw.ngoaiNgu1, MucDo1: raw.mucDo1, NgoaiNgu2: raw.ngoaiNgu2, MucDo2: raw.mucDo2,
    TongBai: raw.tongBai, TongDiem: raw.tongDiem, MinhChung: raw.minhChung, GhiChu: raw.ghiChu
  };
  return {
    main,
    congTac: raw.congTac.map(r => ({ ThoiGian: r[0], NoiCongTac: r[1], CongViec: r[2] })),
    deTai: raw.deTai.map(r => ({ TenDeTai: r[0], Nam: r[1], CapDeTai: r[2], VaiTro: r[3] })),
    baiBao: raw.baiBao.map(r => ({ TenBai: r[0], Nam: r[1], TapChi: r[2], Loai: r[3], Q: r[4], VaiTro: r[5], DOI: r[6], Diem: r[7] }))
  };
}

function buildLLKHHtml(d) {
  const m = d.main || {};
  const rows = (arr, cols) => {
    const data = arr && arr.length ? arr : [{}];
    return data.map((r, idx) => '<tr>' + cols.map(c => `<td>${esc(typeof c === 'function' ? c(r, idx) : (r[c] || ''))}</td>`).join('') + '</tr>').join('');
  };
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>LLKH - ${esc(m.HoTen || '')}</title>${pdfStyle()}</head><body><div class="print-actions"><button onclick="window.print()">In / Lưu PDF</button></div><div class="page">
    <div class="note">Phụ lục IV - Mẫu thu thập thông tin giảng viên tham gia đào tạo nghiên cứu sinh</div>
    <div class="title">LÝ LỊCH KHOA HỌC</div>
    <div class="sub">Giảng viên tham gia giảng dạy, hội đồng và hướng dẫn Tiến sĩ Quản trị kinh doanh</div>
    <h2>I. LÝ LỊCH SƠ LƯỢC</h2>
    <table class="no-border"><tr><td><b>Họ và tên:</b> ${esc(m.HoTen)}</td><td><b>Giới tính:</b> ${esc(m.GioiTinh)}</td></tr><tr><td><b>Ngày, tháng, năm sinh:</b> ${esc(m.NgaySinh)}</td><td><b>Nơi sinh:</b> ${esc(m.NoiSinh)}</td></tr><tr><td><b>Quê quán:</b> ${esc(m.QueQuan)}</td><td><b>Dân tộc:</b> ${esc(m.DanToc)}</td></tr><tr><td><b>Học vị cao nhất:</b> ${esc(m.HocVi)}</td><td><b>Năm, nước nhận học vị:</b> ${esc(m.NamNuocHocVi)}</td></tr><tr><td><b>Chức danh khoa học cao nhất:</b> ${esc(m.ChucDanh)}</td><td><b>Năm bổ nhiệm:</b> ${esc(m.NamBoNhiem)}</td></tr><tr><td colspan="2"><b>Chức vụ hiện tại:</b> ${esc(m.ChucVu)}</td></tr><tr><td colspan="2"><b>Đơn vị công tác:</b> ${esc(m.DonVi)}</td></tr><tr><td colspan="2"><b>Địa chỉ liên lạc:</b> ${esc(m.DiaChi)}</td></tr><tr><td><b>Điện thoại:</b> ${esc(m.DienThoai)}</td><td><b>Email:</b> ${esc(m.Email)}</td></tr></table>
    <h2>II. QUÁ TRÌNH ĐÀO TẠO</h2><p><b>1. Đại học:</b> Nơi đào tạo: ${esc(m.DH_NoiDaoTao)}; Ngành học: ${esc(m.DH_Nganh)}; Nước đào tạo: ${esc(m.DH_Nuoc)}; Năm tốt nghiệp: ${esc(m.DH_Nam)}.</p><p><b>2. Sau đại học:</b></p><p>- Thạc sĩ chuyên ngành: ${esc(m.ThS_Nganh)}; Năm cấp bằng/Nơi đào tạo: ${esc(m.ThS_ThongTin)}.</p><p>- Tiến sĩ chuyên ngành: ${esc(m.TS_Nganh)}; Năm cấp bằng/Nơi đào tạo: ${esc(m.TS_ThongTin)}.</p><p><b>Tên luận án:</b> ${esc(m.TenLuanAn)}</p><p><b>3. Ngoại ngữ:</b> ${esc(m.NgoaiNgu1)} - ${esc(m.MucDo1)}; ${esc(m.NgoaiNgu2)} - ${esc(m.MucDo2)}</p>
    <h2>III. QUÁ TRÌNH CÔNG TÁC CHUYÊN MÔN</h2><table><thead><tr><th>TT</th><th>Thời gian</th><th>Nơi công tác</th><th>Công việc đảm nhiệm</th></tr></thead><tbody>${rows(d.congTac, [(r,i)=>i+1,'ThoiGian','NoiCongTac','CongViec'])}</tbody></table>
    <h2>IV. QUÁ TRÌNH NGHIÊN CỨU KHOA HỌC</h2><p><b>1. Các đề tài nghiên cứu khoa học đã và đang tham gia</b></p><table><thead><tr><th>TT</th><th>Tên đề tài nghiên cứu</th><th>Năm bắt đầu/hoàn thành</th><th>Đề tài cấp</th><th>Trách nhiệm tham gia</th></tr></thead><tbody>${rows(d.deTai, [(r,i)=>i+1,'TenDeTai','Nam','CapDeTai','VaiTro'])}</tbody></table><p><b>2. Các công trình khoa học đã công bố</b></p><table><thead><tr><th>TT</th><th>Tên công trình</th><th>Năm công bố</th><th>Tạp chí/NXB</th><th>Loại</th><th>Q</th><th>Vai trò</th><th>DOI/Link</th><th>Điểm</th></tr></thead><tbody>${rows(d.baiBao, [(r,i)=>i+1,'TenBai','Nam','TapChi','Loai','Q','VaiTro','DOI','Diem'])}</tbody></table><p><b>Tổng số bài:</b> ${esc(m.TongBai || 0)} &nbsp;&nbsp;&nbsp; <b>Tổng điểm:</b> ${esc(m.TongDiem || 0)}</p><p><b>Minh chứng:</b> ${esc(m.MinhChung)}</p><p><b>Ghi chú:</b> ${esc(m.GhiChu)}</p><div class="sign"><p>..........., ngày ..... tháng ..... năm ......</p><p><b>Người khai</b></p><p><i>(Ký và ghi rõ họ tên)</i></p><br><br><p><b>${esc(m.HoTen)}</b></p></div>
  </div></body></html>`;
}

function pdfStyle(){return `<style>body{font-family:"Times New Roman",serif;color:#000;background:#fff;font-size:13pt;line-height:1.35}.page{max-width:794px;margin:0 auto;padding:24px 34px}.note{text-align:center;font-style:italic}.title{text-align:center;font-weight:bold;font-size:22pt;margin:12px 0}.sub{text-align:center;font-weight:bold;font-size:14pt;margin-bottom:18px}h2{font-size:14pt;margin:18px 0 8px;text-transform:uppercase}table{width:100%;border-collapse:collapse;margin:8px 0 12px}th,td{border:1px solid #000;padding:5px;vertical-align:top}th{text-align:center;font-weight:bold}.no-border td{border:0;padding:3px 4px}.sign{width:45%;margin-left:auto;text-align:center;margin-top:26px}.print-actions{position:fixed;right:18px;top:18px}button{padding:10px 14px;font-weight:bold}@media print{.print-actions{display:none}.page{padding:0;max-width:none}body{font-size:12pt}@page{size:A4;margin:18mm}}</style>`}
function esc(v){return String(v == null ? '' : v).replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));}
function escapeAttr(v){return esc(v).replace(/'/g,'&#39;');}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('llkhForm')?.addEventListener('submit', submitForm);
  document.getElementById('profileId').value = localStorage.getItem('llkh_profileId') || '';
  addRow('congTac'); addRow('deTai'); addRow('baiBao');
});
