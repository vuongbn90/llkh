// ===============================
// LLKH PORTAL - ADMIN
// Bản không dùng ISSN/ISBN trong xuất PDF
// ===============================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw1lAUPxUSD5nYiArXwmltjuZmf2l-FXjTiUlCa3kgU5hdPbEQMhwDQFb7Dbfu9C4nR2g/exec";
let profiles = [];

function jsonp(params){
  return new Promise((resolve, reject) => {
    const callback = 'llkhCb_' + Date.now() + '_' + Math.floor(Math.random()*100000);
    const url = new URL(WEB_APP_URL);
    Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
    url.searchParams.set('callback', callback);

    const script = document.createElement('script');
    const timer = setTimeout(() => {
      delete window[callback]; script.remove(); reject(new Error('Hết thời gian chờ API'));
    }, 15000);

    window[callback] = data => { clearTimeout(timer); delete window[callback]; script.remove(); resolve(data); };
    script.onerror = () => { clearTimeout(timer); delete window[callback]; script.remove(); reject(new Error('Không tải được dữ liệu từ Google Apps Script')); };
    script.src = url.toString();
    document.body.appendChild(script);
  });
}

async function loadProfiles(){
  const status = document.getElementById('adminStatus');
  status.className = '';
  status.textContent = 'Đang tải dữ liệu...';
  try{
    const res = await jsonp({action:'list'});
    if(res.status !== 'ok') throw new Error(res.message || 'Lỗi tải dữ liệu');
    profiles = res.data || [];
    status.className = profiles.length ? 'ok' : '';
    status.textContent = profiles.length ? `Đã tải ${profiles.length} hồ sơ.` : 'Chưa có hồ sơ nào.';
    renderList();
  }catch(err){
    status.className = 'err';
    status.textContent = err.message + '. Kiểm tra WEB_APP_URL trong admin.js, quyền truy cập và Deploy lại Code.gs.';
  }
}

function renderList(){
  const q = (document.getElementById('searchBox').value || '').toLowerCase();
  const tbody = document.querySelector('#profileTable tbody');
  tbody.innerHTML = '';
  profiles.filter(p => JSON.stringify(p).toLowerCase().includes(q)).forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${esc(p.thoiGianGui || '')}</td>
      <td><b>${esc(p.hoTen || '')}</b></td>
      <td>${esc(p.email || '')}</td>
      <td>${esc(p.donVi || '')}</td>
      <td style="text-align:center">${esc(p.tongBai || '0')}</td>
      <td style="text-align:center">${esc(p.tongDiem || '0')}</td>
      <td style="text-align:center"><button type="button" class="primary" onclick="exportProfilePDF('${esc(p.profileId)}')">Xuất PDF</button></td>`;
    tbody.appendChild(tr);
  });
}

async function exportProfilePDF(id){
  const status = document.getElementById('adminStatus');
  status.className = '';
  status.textContent = 'Đang tạo LLKH...';
  try{
    const res = await jsonp({action:'profile', id});
    if(res.status !== 'ok') throw new Error(res.message || 'Không lấy được hồ sơ');
    const html = buildLLKH(res.data);
    const w = window.open('', '_blank');
    if(!w){
      status.className = 'err';
      status.textContent = 'Trình duyệt đang chặn popup. Hãy cho phép popup rồi bấm Xuất PDF lại.';
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 600);
    status.className = 'ok';
    status.textContent = 'Đã mở cửa sổ xuất PDF.';
  }catch(err){
    status.className = 'err';
    status.textContent = err.message;
  }
}

function buildLLKH(d){
  const m = d.main || {};
  const rows = (arr, cols) => {
    const data = arr && arr.length ? arr : [{}];
    return data.map((r, idx) => '<tr>' + cols.map(c => `<td>${esc(typeof c === 'function' ? c(r, idx) : (r[c] || ''))}</td>`).join('') + '</tr>').join('');
  };

  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>LLKH - ${esc(m.HoTen || '')}</title>${pdfStyle()}</head>
  <body><div class="print-actions"><button onclick="window.print()">In / Lưu PDF</button></div><div class="page">
    <div class="note">Phụ lục IV - Mẫu thu thập thông tin giảng viên tham gia đào tạo nghiên cứu sinh</div>
    <div class="title">LÝ LỊCH KHOA HỌC</div>
    <div class="sub">Giảng viên tham gia giảng dạy, hội đồng và hướng dẫn Tiến sĩ Quản trị kinh doanh</div>

    <h2>I. LÝ LỊCH SƠ LƯỢC</h2>
    <table class="no-border">
      <tr><td><b>Họ và tên:</b> ${esc(m.HoTen)}</td><td><b>Giới tính:</b> ${esc(m.GioiTinh)}</td></tr>
      <tr><td><b>Ngày, tháng, năm sinh:</b> ${esc(m.NgaySinh)}</td><td><b>Nơi sinh:</b> ${esc(m.NoiSinh)}</td></tr>
      <tr><td><b>Quê quán:</b> ${esc(m.QueQuan)}</td><td><b>Dân tộc:</b> ${esc(m.DanToc)}</td></tr>
      <tr><td><b>Học vị cao nhất:</b> ${esc(m.HocVi)}</td><td><b>Năm, nước nhận học vị:</b> ${esc(m.NamNuocHocVi)}</td></tr>
      <tr><td><b>Chức danh khoa học cao nhất:</b> ${esc(m.ChucDanh)}</td><td><b>Năm bổ nhiệm:</b> ${esc(m.NamBoNhiem)}</td></tr>
      <tr><td colspan="2"><b>Chức vụ hiện tại:</b> ${esc(m.ChucVu)}</td></tr>
      <tr><td colspan="2"><b>Đơn vị công tác:</b> ${esc(m.DonVi)}</td></tr>
      <tr><td colspan="2"><b>Địa chỉ liên lạc:</b> ${esc(m.DiaChi)}</td></tr>
      <tr><td><b>Điện thoại:</b> ${esc(m.DienThoai)}</td><td><b>Email:</b> ${esc(m.Email)}</td></tr>
    </table>

    <h2>II. QUÁ TRÌNH ĐÀO TẠO</h2>
    <p><b>1. Đại học:</b> Nơi đào tạo: ${esc(m.DH_NoiDaoTao)}; Ngành học: ${esc(m.DH_Nganh)}; Nước đào tạo: ${esc(m.DH_Nuoc)}; Năm tốt nghiệp: ${esc(m.DH_Nam)}.</p>
    <p><b>2. Sau đại học:</b></p>
    <p>- Thạc sĩ chuyên ngành: ${esc(m.ThS_Nganh)}; Năm cấp bằng/Nơi đào tạo: ${esc(m.ThS_ThongTin)}.</p>
    <p>- Tiến sĩ chuyên ngành: ${esc(m.TS_Nganh)}; Năm cấp bằng/Nơi đào tạo: ${esc(m.TS_ThongTin)}.</p>
    <p><b>Tên luận án:</b> ${esc(m.TenLuanAn)}</p>
    <p><b>3. Ngoại ngữ:</b> ${esc(m.NgoaiNgu1)} - ${esc(m.MucDo1)}; ${esc(m.NgoaiNgu2)} - ${esc(m.MucDo2)}</p>

    <h2>III. QUÁ TRÌNH CÔNG TÁC CHUYÊN MÔN</h2>
    <table><thead><tr><th>TT</th><th>Thời gian</th><th>Nơi công tác</th><th>Công việc đảm nhiệm</th></tr></thead><tbody>${rows(d.congTac, [(r,i)=>i+1,'ThoiGian','NoiCongTac','CongViec'])}</tbody></table>

    <h2>IV. QUÁ TRÌNH NGHIÊN CỨU KHOA HỌC</h2>
    <p><b>1. Các đề tài nghiên cứu khoa học đã và đang tham gia</b></p>
    <table><thead><tr><th>TT</th><th>Tên đề tài nghiên cứu</th><th>Năm bắt đầu/hoàn thành</th><th>Đề tài cấp</th><th>Trách nhiệm tham gia</th></tr></thead><tbody>${rows(d.deTai, [(r,i)=>i+1,'TenDeTai','Nam','CapDeTai','VaiTro'])}</tbody></table>
    <p><b>2. Các công trình khoa học đã công bố</b></p>
    <table class="pub-table"><thead><tr><th>TT</th><th>Tên công trình</th><th>Năm</th><th>Tạp chí/NXB/Hội thảo</th><th>Loại tính điểm</th><th>Q/IF</th><th>Vai trò</th><th>DOI/Link</th><th>Điểm</th><th>Rà soát</th></tr></thead>
    <tbody>${rows(d.baiBao, [(r,i)=>i+1,'TenBai','Nam','TapChi','LoaiTinhDiem','Q_IF_CiteScore','VaiTro','DOI','DiemDeXuat','TrangThai'])}</tbody></table>
    <p><b>Tổng số bài:</b> ${esc(m.TongBai || 0)} &nbsp;&nbsp;&nbsp; <b>Tổng điểm:</b> ${esc(m.TongDiem || 0)}</p>
    <p><b>Minh chứng:</b> ${esc(m.MinhChung)}</p>
    <p><b>Ghi chú:</b> ${esc(m.GhiChu)}</p>
    <div class="sign"><p>..........., ngày ..... tháng ..... năm ......</p><p><b>Người khai</b></p><p><i>(Ký và ghi rõ họ tên)</i></p><br><br><p><b>${esc(m.HoTen)}</b></p></div>
  </div></body></html>`;
}

function pdfStyle(){
  return `<style>
    body{font-family:"Times New Roman",serif;color:#000;background:#fff;font-size:13pt;line-height:1.35}
    .page{max-width:794px;margin:0 auto;padding:24px 34px}
    .note{text-align:center;font-style:italic}
    .title{text-align:center;font-weight:bold;font-size:22pt;margin:12px 0}
    .sub{text-align:center;font-weight:bold;font-size:14pt;margin-bottom:18px}
    h2{font-size:14pt;margin:18px 0 8px;text-transform:uppercase}
    table{width:100%;border-collapse:collapse;margin:8px 0 12px}
    th,td{border:1px solid #000;padding:5px;vertical-align:top}
    th{text-align:center;font-weight:bold}.no-border td{border:0;padding:3px 4px}.pub-table{font-size:10pt}
    .sign{width:45%;margin-left:auto;text-align:center;margin-top:26px}.print-actions{position:fixed;right:18px;top:18px}
    button{padding:10px 14px;font-weight:bold}
    @media print{.print-actions{display:none}.page{padding:0;max-width:none}body{font-size:12pt}@page{size:A4;margin:18mm}}
  </style>`;
}

function esc(v){
  return String(v == null ? '' : v).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[s]));
}

document.addEventListener('DOMContentLoaded', loadProfiles);
