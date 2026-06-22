const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxl6cBEoCXorhLarBlMocJvPet3RyLP1McDKXzUSa5oKFq8luYWGHqc6D3sEj5Vv0ZIBw/exec";

function addRow(type){
  const configs={
    congTac:{table:'congTacTable',fields:['thoiGian','noiCongTac','congViec'],types:['text','text','text']},
    deTai:{table:'deTaiTable',fields:['tenDeTai','namDeTai','capDeTai','vaiTroDeTai'],types:['text','text','text','text']},
    baiBao:{table:'baiBaoTable',fields:['tenBai','namBai','tapChi','loai','q','vaiTro','doi','diem'],types:['text','number','text','selectLoai','selectQ','text','text','number']}
  };
  const c=configs[type]; 
  const tbody=document.querySelector(`#${c.table} tbody`);
  if(!tbody) return;
  const tr=document.createElement('tr');
  c.fields.forEach((f,i)=>{
    const td=document.createElement('td'); let el;
    if(c.types[i]==='selectLoai'){
      el=document.createElement('select');
      ['', 'WoS/SSCI/SCIE','Scopus','ESCI','Tạp chí trong nước','Sách/Chương sách','Hội thảo'].forEach(v=>el.add(new Option(v,v)));
    } else if(c.types[i]==='selectQ'){
      el=document.createElement('select');
      ['', 'Q1','Q2','Q3','Q4','Không áp dụng'].forEach(v=>el.add(new Option(v,v)));
    } else {
      el=document.createElement('input');
      el.type=c.types[i];
      if(f==='diem'){el.step='0.25'; el.min='0'; el.addEventListener('input',calcSummary)}
    }
    el.name=`${type}_${f}`; 
    td.appendChild(el); 
    tr.appendChild(td);
  });
  const del=document.createElement('td'); 
  del.innerHTML='<button type="button" class="remove" onclick="this.closest(\'tr\').remove();calcSummary()">Xóa</button>'; 
  tr.appendChild(del); 
  tbody.appendChild(tr);
}

function calcSummary(){
  const diem=[...document.querySelectorAll('input[name="baiBao_diem"]')].map(x=>parseFloat(x.value)||0);
  const tongBai=document.getElementById('tongBai');
  const tongDiem=document.getElementById('tongDiem');
  if(tongBai) tongBai.textContent=diem.filter(x=>x>0 || true).length;
  if(tongDiem) tongDiem.textContent=diem.reduce((a,b)=>a+b,0).toFixed(2).replace('.00','');
}

function tableData(type){
  const rows=[...document.querySelectorAll(`#${type}Table tbody tr`)];
  return rows.map(r=>[...r.querySelectorAll('input,select')].map(x=>x.value));
}

function collectFormData(){
  const form=document.getElementById('llkhForm');
  const fd=new FormData(form);
  const data=Object.fromEntries(fd.entries());
  data.congTac=tableData('congTac'); 
  data.deTai=tableData('deTai'); 
  data.baiBao=tableData('baiBao'); 
  data.tongBai=(document.getElementById('tongBai')||{textContent:'0'}).textContent; 
  data.tongDiem=(document.getElementById('tongDiem')||{textContent:'0'}).textContent; 
  data.submittedAt=new Date().toISOString();
  return data;
}

const form=document.getElementById('llkhForm');
if(form){
  form.addEventListener('submit', async e=>{
    e.preventDefault(); 
    const status=document.getElementById('status'); 
    status.className='';
    const data=collectFormData();
    if(WEB_APP_URL.includes('PASTE_')){
      status.textContent='Bản demo: chưa gắn Google Apps Script URL. Dữ liệu đã được kiểm tra trên trình duyệt.';
      status.className='ok';
      console.log(data);
      return;
    }
    try{
      status.textContent='Đang gửi...'; 
      await fetch(WEB_APP_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); 
      status.textContent='Đã gửi hồ sơ thành công. Thầy/Cô có thể mở trang quản trị để xuất PDF.';
      status.className='ok'; 
      e.target.reset(); 
      document.querySelector('#congTacTable tbody').innerHTML=''; 
      document.querySelector('#deTaiTable tbody').innerHTML=''; 
      document.querySelector('#baiBaoTable tbody').innerHTML=''; 
      initRows();
    }
    catch(err){
      status.textContent='Không gửi được. Vui lòng kiểm tra URL Apps Script.';
      status.className='err';
    }
  });
}

function esc(v){
  return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function rowsHtml(rows, headers){
  if(!rows || !rows.length) return `<tr>${headers.map(()=>'<td>&nbsp;</td>').join('')}</tr>`;
  return rows.map((r,i)=>`<tr><td class="center">${i+1}</td>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('');
}

function buildLLKHDocument(d){
  const congTac = d.congTac || [];
  const deTai = d.deTai || [];
  const baiBao = d.baiBao || [];
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>LLKH - ${esc(d.hoTen || '')}</title>
  <style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: "Times New Roman", serif; font-size: 13pt; color:#000; line-height:1.35; }
  h1 { text-align:center; font-size:18pt; margin:8px 0 16px; }
  h2 { font-size:13pt; margin:14px 0 8px; text-transform:uppercase; }
  h3 { font-size:13pt; margin:10px 0 6px; }
  .top { text-align:center; font-style:italic; font-size:12pt; }
  .line { margin:4px 0; }
  table { width:100%; border-collapse:collapse; margin:8px 0 12px; }
  th, td { border:1px solid #000; padding:5px 6px; vertical-align:top; }
  th { text-align:center; font-weight:bold; }
  .center { text-align:center; }
  .sign { margin-top:28px; display:flex; justify-content:space-between; gap:40px; }
  .sign div { width:48%; text-align:center; }
  .no-border td { border:0; padding:2px 4px; }
  .red { color:#c00000; font-weight:bold; }
  @media print { .noprint { display:none } }
  </style></head><body>
  <div class="noprint" style="text-align:right;margin-bottom:12px"><button onclick="window.print()">In / Save as PDF</button></div>
  <div class="top">Phụ lục IV</div>
  <h1>LÝ LỊCH KHOA HỌC</h1>

  <h2>I. LÝ LỊCH SƠ LƯỢC</h2>
  <table class="no-border">
    <tr><td>Họ và tên: <b>${esc(d.hoTen)}</b></td><td>Giới tính: ${esc(d.gioiTinh)}</td></tr>
    <tr><td>Ngày, tháng, năm sinh: ${esc(d.ngaySinh)}</td><td>Nơi sinh: ${esc(d.noiSinh)}</td></tr>
    <tr><td>Quê quán: ${esc(d.queQuan)}</td><td>Dân tộc: ${esc(d.danToc)}</td></tr>
    <tr><td>Học vị cao nhất: ${esc(d.hocVi)}</td><td>Năm, nước nhận học vị: ${esc(d.namNuocHocVi)}</td></tr>
    <tr><td>Chức danh khoa học cao nhất: ${esc(d.chucDanh)}</td><td>Năm bổ nhiệm: ${esc(d.namBoNhiem)}</td></tr>
    <tr><td colspan="2">Chức vụ hiện tại: ${esc(d.chucVu)}</td></tr>
    <tr><td colspan="2">Đơn vị công tác: ${esc(d.donVi)}</td></tr>
    <tr><td colspan="2">Chỗ ở riêng hoặc địa chỉ liên lạc: ${esc(d.diaChi)}</td></tr>
    <tr><td>Điện thoại liên hệ: ${esc(d.dienThoai)}</td><td>Email: ${esc(d.email)}</td></tr>
  </table>

  <h2>II. QUÁ TRÌNH ĐÀO TẠO</h2>
  <div class="line">1. Đại học: Nơi đào tạo: ${esc(d.dhNoiDaoTao)}; Ngành học: ${esc(d.dhNganh)}; Nước đào tạo: ${esc(d.dhNuoc)}; Năm tốt nghiệp: ${esc(d.dhNam)}.</div>
  <div class="line">2. Sau đại học</div>
  <div class="line">- Thạc sĩ chuyên ngành: ${esc(d.thsNganh)}; Năm cấp bằng/Nơi đào tạo: ${esc(d.thsThongTin)}.</div>
  <div class="line">- Tiến sĩ chuyên ngành: ${esc(d.tsNganh)}; Năm cấp bằng/Nơi đào tạo: ${esc(d.tsThongTin)}.</div>
  <div class="line">Tên luận án: ${esc(d.tenLuanAn)}.</div>
  <div class="line">3. Ngoại ngữ: 1. ${esc(d.ngoaiNgu1)} - Mức độ sử dụng: ${esc(d.mucDo1)}; 2. ${esc(d.ngoaiNgu2)} - Mức độ sử dụng: ${esc(d.mucDo2)}.</div>

  <h2>III. QUÁ TRÌNH CÔNG TÁC CHUYÊN MÔN</h2>
  <table><thead><tr><th style="width:55px">TT</th><th>Thời gian</th><th>Nơi công tác</th><th>Công việc đảm nhiệm</th></tr></thead><tbody>${rowsHtml(congTac, ['TT','Thời gian','Nơi công tác','Công việc'])}</tbody></table>

  <h2>IV. QUÁ TRÌNH NGHIÊN CỨU KHOA HỌC</h2>
  <h3>1. Các đề tài nghiên cứu khoa học đã và đang tham gia</h3>
  <table><thead><tr><th style="width:55px">TT</th><th>Tên đề tài nghiên cứu</th><th>Năm bắt đầu/Năm hoàn thành</th><th>Đề tài cấp</th><th>Trách nhiệm tham gia</th></tr></thead><tbody>${rowsHtml(deTai, ['TT','Tên','Năm','Cấp','Vai trò'])}</tbody></table>

  <h3>2. Các công trình khoa học đã công bố</h3>
  <div class="line red">Chỉ kê khai các bài báo là tác giả đầu hoặc tác giả liên hệ, danh mục HDGS 0,75 điểm trở lên, trong 5 năm tính đến từ T6/2021 - nay.</div>
  <table><thead><tr><th style="width:45px">TT</th><th>Tên công trình</th><th>Năm</th><th>Tên tạp chí/NXB</th><th>Loại</th><th>Q</th><th>Vai trò</th><th>DOI/Link</th><th>Điểm</th></tr></thead><tbody>${rowsHtml(baiBao, ['TT','Tên','Năm','Tạp chí','Loại','Q','Vai trò','DOI','Điểm'])}</tbody></table>
  <div class="line"><b>Tổng số bài:</b> ${esc(d.tongBai)} &nbsp;&nbsp;&nbsp; <b>Tổng điểm:</b> ${esc(d.tongDiem)}</div>
  <div class="line"><b>Minh chứng:</b> ${esc(d.minhChung)}</div>
  <div class="line"><b>Ghi chú:</b> ${esc(d.ghiChu)}</div>

  <div class="sign">
    <div><b>Xác nhận của cơ quan</b><br><br><br><br><br></div>
    <div>............, ngày ...... tháng ...... năm ........<br><b>Người khai ký tên</b><br><i>(Ghi rõ chức danh, học vị)</i><br><br><br><br></div>
  </div>
  </body></html>`;
}

function exportPDF_LLKH(){
  const d=collectFormData();
  const w=window.open('', '_blank');
  w.document.open();
  w.document.write(buildLLKHDocument(d));
  w.document.close();
}

function initRows(){
  addRow('congTac');
  addRow('deTai');
  addRow('baiBao');
  calcSummary();
}
if(document.getElementById('llkhForm')) initRows();

// ===== Trang admin.html =====
function jsonp(action, params={}){
  return new Promise((resolve,reject)=>{
    const cb='cb_'+Date.now()+'_'+Math.floor(Math.random()*10000);
    window[cb]=(data)=>{ resolve(data); delete window[cb]; script.remove(); };
    const q=new URLSearchParams({action, callback:cb, ...params});
    const script=document.createElement('script');
    script.src=WEB_APP_URL+'?'+q.toString();
    script.onerror=()=>{ reject(new Error('Không tải được dữ liệu')); delete window[cb]; script.remove(); };
    document.body.appendChild(script);
  });
}

async function loadAdminList(){
  const box=document.getElementById('adminList');
  if(!box) return;
  box.innerHTML='Đang tải dữ liệu...';
  try{
    const res=await jsonp('list');
    if(!res.ok) throw new Error(res.message || 'Lỗi');
    const rows=res.data || [];
    if(!rows.length){ box.innerHTML='<p>Chưa có hồ sơ nào.</p>'; return; }
    box.innerHTML=`<table><thead><tr><th>TT</th><th>Họ tên</th><th>Email</th><th>Đơn vị</th><th>Tổng bài</th><th>Tổng điểm</th><th>Thời gian gửi</th><th>Xuất PDF</th></tr></thead><tbody>
      ${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.hoTen)}</td><td>${esc(r.email)}</td><td>${esc(r.donVi)}</td><td>${esc(r.tongBai)}</td><td>${esc(r.tongDiem)}</td><td>${esc(r.thoiGianGui)}</td><td><button onclick="exportSavedPDF('${esc(r.profileId)}')">Xuất PDF</button></td></tr>`).join('')}
    </tbody></table>`;
  }catch(e){ box.innerHTML='<p class="err">Không tải được dữ liệu. Kiểm tra Web App URL hoặc quyền truy cập Apps Script.</p>'; }
}

async function exportSavedPDF(profileId){
  const res=await jsonp('detail', {profileId});
  if(!res.ok){ alert(res.message || 'Không tìm thấy hồ sơ'); return; }
  const w=window.open('', '_blank');
  w.document.open();
  w.document.write(buildLLKHDocument(res.data));
  w.document.close();
}

if(document.getElementById('adminList')) loadAdminList();
