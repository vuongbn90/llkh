// ===============================
// LLKH PORTAL - FRONTEND
// Bản không dùng ISSN/ISBN; tự tính điểm theo tên tạp chí trong sheet DanhMucTapChi
// ===============================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw1lAUPxUSD5nYiArXwmltjuZmf2l-FXjTiUlCa3kgU5hdPbEQMhwDQFb7Dbfu9C4nR2g/exec";

let HDGS_CATALOG = [];
const LOCAL_HDGS_CATALOG = [
  {ten:'Journal of Asian Business and Economic Studies', loai:'Tạp chí Scopus', diem:1.50, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Journal of Economics and Development', loai:'Tạp chí Scopus', diem:1.50, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Journal of Finance and Accountancy Research', loai:'Tạp chí', diem:1.00, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Tạp chí Công Thương', loai:'Tạp chí trong nước', diem:0.50, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Nghiên cứu Kinh tế', loai:'Tạp chí trong nước', diem:1.00, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Kinh tế và Dự báo', loai:'Tạp chí trong nước', diem:0.75, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Tạp chí Tài chính', loai:'Tạp chí trong nước', diem:0.75, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Tạp chí Khoa học và Công nghệ', loai:'Tạp chí trong nước', diem:0.75, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Khoa học Thương mại', loai:'Tạp chí trong nước', diem:0.75, ghiChu:'Dữ liệu mẫu HĐGS 2025'},
  {ten:'Tài chính Doanh nghiệp', loai:'Tạp chí trong nước', diem:0.50, ghiChu:'Dữ liệu mẫu HĐGS 2025'}
];

const PUB_TYPES = [
  {code:'DM_HDGS', label:'Tạp chí trong danh mục HĐGS 2025', max:1.00, catalog:true},
  {code:'SCI_IF3_AHCI', label:'SCI/SCIE/SSCI IF ≥ 3 hoặc A&HCI', max:3.00},
  {code:'SCI_IF_LT3_SCOPUS_Q1', label:'SCI/SCIE/SSCI IF < 3 hoặc Scopus Q1', max:2.00},
  {code:'ESCI_SCOPUS_Q2,3,4', label:'ESCI hoặc Scopus Q2,3,4', max:1.50},
  {code:'ACI', label:'ACI', max:1.25},
  {code:'QT_KHAC', label:'Tạp chí quốc tế khác có ISSN/phản biện', max:1.00},
  {code:'TRONG_NUOC_KHAC', label:'Tạp chí khoa học trong nước khác', max:0.50},
  {code:'CONF_QT', label:'Báo cáo khoa học hội thảo quốc tế', max:1.00},
  {code:'CONF_QG', label:'Báo cáo khoa học hội thảo quốc gia', max:0.50},
  {code:'SACH_CHUONG_SACH', label:'Sách/Chương sách khoa học', max:1.00},
  {code:'KHAC_CAN_RASOAT', label:'Khác - cần Hội đồng rà soát', max:0.00}
];

const ROLE_OPTIONS = ['', 'Tác giả đầu', 'Tác giả liên hệ', 'Tác giả đầu & liên hệ', 'Đồng tác giả', 'Khác'];
const Q_OPTIONS = ['', 'Q1', 'Q2', 'Q3', 'Q4', 'IF ≥ 3', 'IF < 3', 'Không áp dụng'];

function normalizeText(v){
  return String(v || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

function escAttr(v){
  return String(v == null ? '' : v).replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

function ensureJournalDatalist(){
  let dl = document.getElementById('journalCatalogList');
  if(!dl){
    dl = document.createElement('datalist');
    dl.id = 'journalCatalogList';
    document.body.appendChild(dl);
  }
  dl.innerHTML = HDGS_CATALOG
    .map(j => `<option value="${escAttr(j.ten)}">${escAttr((j.loai || '') + (j.diem ? ' - ' + j.diem + ' điểm' : ''))}</option>`)
    .join('');
}

function findJournalInCatalog(name){
  const n = normalizeText(name);
  if(!n) return null;

  const exact = HDGS_CATALOG.find(j => normalizeText(j.ten) === n);
  if(exact) return exact;

  if(n.length >= 8){
    const partial = HDGS_CATALOG.find(j => {
      const jn = normalizeText(j.ten);
      return jn && (jn.includes(n) || n.includes(jn));
    });
    if(partial) return partial;
  }
  return null;
}

function jsonpGet(params){
  return new Promise((resolve, reject) => {
    const callback = 'llkhGet_' + Date.now() + '_' + Math.floor(Math.random()*100000);
    const url = new URL(WEB_APP_URL);
    Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
    url.searchParams.set('callback', callback);

    const script = document.createElement('script');
    const timer = setTimeout(() => {
      delete window[callback]; script.remove(); reject(new Error('Hết thời gian chờ API'));
    }, 15000);

    window[callback] = res => { clearTimeout(timer); delete window[callback]; script.remove(); resolve(res); };
    script.onerror = () => { clearTimeout(timer); delete window[callback]; script.remove(); reject(new Error('Không tải được API')) };
    script.src = url.toString();
    document.body.appendChild(script);
  });
}

async function loadJournalCatalog(){
  HDGS_CATALOG = LOCAL_HDGS_CATALOG.slice();
  try{
    if(!WEB_APP_URL.includes('PASTE_')){
      const data = await jsonpGet({action:'catalog'});
      if(data && data.status === 'ok' && Array.isArray(data.data) && data.data.length){
        HDGS_CATALOG = data.data.map(x => ({
          ten: x.TenTapChi || x.ten || x.Ten || '',
          loai: x.Loai || x.loai || '',
          diem: Number(x.DiemToiDa || x.Diem || x.diem || 0),
          ghiChu: x.GhiChu || x.ghiChu || ''
        })).filter(x => x.ten);
      }
    }
  }catch(err){
    console.warn('Không nạp được DanhMucTapChi từ Apps Script, dùng danh mục mẫu cục bộ.', err);
  }
  ensureJournalDatalist();
}

function typeOptions(){
  return PUB_TYPES.map(t => `<option value="${t.code}" data-max="${t.max}">${t.label}</option>`).join('');
}

function getTypeConfig(code){
  return PUB_TYPES.find(t => t.code === code) || {max:0, label:'', catalog:false};
}

function isEligibleRole(role){
  return role === 'Tác giả đầu' || role === 'Tác giả liên hệ' || role === 'Tác giả đầu & liên hệ';
}

function addRow(type){
  const tbody = document.querySelector(`#${type}Table tbody`);
  if(!tbody) return;
  const tr = document.createElement('tr');

  if(type === 'congTac'){
    tr.innerHTML = `
      <td><input name="congTac_thoiGian" /></td>
      <td><input name="congTac_noiCongTac" /></td>
      <td><input name="congTac_congViec" /></td>
      <td><button type="button" class="remove" onclick="this.closest('tr').remove()">Xóa</button></td>`;
  } else if(type === 'deTai'){
    tr.innerHTML = `
      <td><input name="deTai_tenDeTai" /></td>
      <td><input name="deTai_namDeTai" /></td>
      <td><input name="deTai_capDeTai" /></td>
      <td><input name="deTai_vaiTroDeTai" /></td>
      <td><button type="button" class="remove" onclick="this.closest('tr').remove()">Xóa</button></td>`;
  } else if(type === 'baiBao'){
    tr.innerHTML = `
      <td><input name="baiBao_tenBai" /></td>
      <td><input class="year-input" name="baiBao_namBai" type="number" min="1900" max="2100" placeholder="2025" oninput="updateArticleRow(this.closest('tr'))" /></td>
      <td><input name="baiBao_tapChi" list="journalCatalogList" placeholder="Gõ/chọn tên tạp chí" oninput="updateArticleRow(this.closest('tr'))" /></td>
      <td><select class="pub-type" name="baiBao_loaiTinhDiem" onchange="updateArticleRow(this.closest('tr'))"><option value=""></option>${typeOptions()}</select></td>
      <td><select name="baiBao_qif" onchange="updateArticleRow(this.closest('tr'))">${Q_OPTIONS.map(v=>`<option>${v}</option>`).join('')}</select></td>
      <td><select name="baiBao_vaiTro" onchange="updateArticleRow(this.closest('tr'))">${ROLE_OPTIONS.map(v=>`<option>${v}</option>`).join('')}</select></td>
      <td><input name="baiBao_doi" /></td>
      <td><input class="score-readonly score-input" name="baiBao_diemToiDa" type="number" step="0.25" readonly /></td>
      <td><input class="score-input" name="baiBao_diemDeXuat" type="number" step="0.25" min="0" oninput="updateArticleRow(this.closest('tr'), true)" /></td>
      <td class="status-cell"><span class="score-warn">Chưa kiểm tra</span></td>
      <td><button type="button" class="remove" onclick="this.closest('tr').remove();calcSummary()">Xóa</button></td>`;
  }
  tbody.appendChild(tr);
  if(type === 'baiBao') updateArticleRow(tr);
}

function updateArticleRow(tr, userEdited=false){
  if(!tr) return;
  const typeSel = tr.querySelector('[name="baiBao_loaiTinhDiem"]');
  const yearEl = tr.querySelector('[name="baiBao_namBai"]');
  const roleEl = tr.querySelector('[name="baiBao_vaiTro"]');
  const maxEl = tr.querySelector('[name="baiBao_diemToiDa"]');
  const scoreEl = tr.querySelector('[name="baiBao_diemDeXuat"]');
  const statusEl = tr.querySelector('.status-cell');
  const journalEl = tr.querySelector('[name="baiBao_tapChi"]');

  const matchedJournal = findJournalInCatalog(journalEl ? journalEl.value : '');
  if(matchedJournal && typeSel) typeSel.value = 'DM_HDGS';

  const cfg = getTypeConfig(typeSel ? typeSel.value : '');
  const max = matchedJournal ? Number(matchedJournal.diem || 0) : Number(cfg.max || 0);
  if(maxEl) maxEl.value = max ? max.toFixed(2) : '';

  if(scoreEl && !userEdited){
    if(matchedJournal){
      scoreEl.value = max ? max.toFixed(2) : '';
      scoreEl.placeholder = 'Tự tính theo danh mục HĐGS';
    } else if(cfg.catalog){
      scoreEl.value = '';
      scoreEl.placeholder = 'Chọn đúng tên tạp chí trong danh mục';
    } else {
      scoreEl.value = max ? max.toFixed(2) : '';
    }
  }

  const score = Number(scoreEl && scoreEl.value ? scoreEl.value : 0);
  const year = Number(yearEl && yearEl.value ? yearEl.value : 0);
  const currentYear = new Date().getFullYear();
  const inFiveYears = year >= currentYear - 5 && year <= currentYear;
  const roleOk = isEligibleRole(roleEl ? roleEl.value : '');

  let cls = 'score-warn';
  let msg = 'Cần nhập đủ thông tin';

  if(typeSel && typeSel.value){
    if(score > max && max > 0){
      cls = 'score-bad'; msg = 'Điểm vượt mức tối đa';
    } else if(score >= 0.75 && roleOk && inFiveYears){
      cls = 'score-ok';
      msg = matchedJournal ? ('Đạt - tự tính theo danh mục: ' + matchedJournal.ten) : 'Đạt điều kiện kê khai';
    } else {
      const reasons = [];
      if(score < 0.75) reasons.push('điểm < 0,75');
      if(!roleOk) reasons.push('vai trò chưa phù hợp');
      if(!inFiveYears) reasons.push('ngoài 5 năm');
      msg = (matchedJournal ? ('Đã nhận diện danh mục: ' + matchedJournal.ten + '. ') : '') + 'Cần rà soát: ' + reasons.join(', ');
    }
  }

  if(statusEl) statusEl.innerHTML = `<span class="${cls}">${msg}</span>`;
  calcSummary();
}

function calcSummary(){
  const scores = [...document.querySelectorAll('input[name="baiBao_diemDeXuat"]')].map(x => parseFloat(x.value) || 0);
  const count = [...document.querySelectorAll('#baiBaoTable tbody tr')]
    .filter(tr => [...tr.querySelectorAll('input,select')].some(x => String(x.value || '').trim() !== '')).length;
  const tongBai = document.getElementById('tongBai');
  const tongDiem = document.getElementById('tongDiem');
  if(tongBai) tongBai.textContent = count;
  if(tongDiem) tongDiem.textContent = scores.reduce((a,b)=>a+b,0).toFixed(2).replace('.00','');
}

function tableData(type){
  const rows = [...document.querySelectorAll(`#${type}Table tbody tr`)];
  if(type !== 'baiBao') return rows.map(r => [...r.querySelectorAll('input,select')].map(x => x.value));

  return rows.map(r => {
    const vals = [...r.querySelectorAll('input,select')].map(x => x.value);
    const status = r.querySelector('.status-cell') ? r.querySelector('.status-cell').innerText.trim() : '';
    vals.push(status);
    return vals;
  });
}

async function submitViaJsonp(data){
  return new Promise((resolve, reject) => {
    const callback = 'llkhSubmit_' + Date.now() + '_' + Math.floor(Math.random()*100000);
    const url = new URL(WEB_APP_URL);
    url.searchParams.set('action', 'submitJsonp');
    url.searchParams.set('payload', JSON.stringify(data));
    url.searchParams.set('callback', callback);

    const script = document.createElement('script');
    const timer = setTimeout(() => { delete window[callback]; script.remove(); reject(new Error('Hết thời gian chờ API')); }, 20000);
    window[callback] = res => { clearTimeout(timer); delete window[callback]; script.remove(); resolve(res); };
    script.onerror = () => { clearTimeout(timer); delete window[callback]; script.remove(); reject(new Error('Không gửi được dữ liệu')); };
    script.src = url.toString();
    document.body.appendChild(script);
  });
}

document.getElementById('llkhForm').addEventListener('submit', async e => {
  e.preventDefault();
  const status = document.getElementById('status');
  status.className = '';
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  data.congTac = tableData('congTac');
  data.deTai = tableData('deTai');
  data.baiBao = tableData('baiBao');
  data.tongBai = document.getElementById('tongBai').textContent;
  data.tongDiem = document.getElementById('tongDiem').textContent;
  data.submittedAt = new Date().toISOString();

  if(WEB_APP_URL.includes('PASTE_')){
    status.textContent = 'Bản demo: chưa gắn Google Apps Script URL.';
    status.className = 'err';
    console.log(data);
    return;
  }

  try{
    status.textContent = 'Đang gửi...';
    const res = await submitViaJsonp(data);
    async function loadMyProfile(){

    const email = document.querySelector('[name="email"]').value.trim();

    if(email === ''){
        alert("Vui lòng nhập Email trước.");
        return;
    }

    const status = document.getElementById("status");
    status.className = "";
    status.textContent = "Đang tải hồ sơ...";

    try{

        const res = await jsonpGet({
            action:"myprofile",
            email:email
        });

        if(res.status !== "ok"){
            throw new Error(res.message);
        }

        fillForm(res.data);

        status.className="ok";
        status.textContent="Đã tải hồ sơ.";

    }catch(err){

        status.className="err";
        status.textContent=err.message;

    }

}
  if(res.status !== 'ok') throw new Error(res.message || 'Không lưu được hồ sơ');
    status.textContent = 'Đã gửi hồ sơ thành công.';
    status.className = 'ok';
    e.target.reset();
    document.querySelector('#congTacTable tbody').innerHTML = '';
    document.querySelector('#deTaiTable tbody').innerHTML = '';
    document.querySelector('#baiBaoTable tbody').innerHTML = '';
    initRows();
  }catch(err){
    status.textContent = err.message || 'Không gửi được. Vui lòng kiểm tra URL Apps Script.';
    status.className = 'err';
  }
});

function initRows(){
  addRow('congTac');
  addRow('deTai');
  addRow('baiBao');
  calcSummary();
}

document.addEventListener('DOMContentLoaded', async () => {
      await loadJournalCatalog();
  initRows();
});
function fillForm(data){

    const main = data.main;

    // Đổ dữ liệu vào các input
    Object.keys(main).forEach(key=>{

        const el=document.querySelector(`[name="${key}"]`);

        if(el){
            el.value=main[key] || "";
        }

    });

    //------------------------------------------------
    // Công tác
    //------------------------------------------------

    document.querySelector("#congTacTable tbody").innerHTML="";

    (data.congTac||[]).forEach(r=>{

        addRow("congTac",[
            r.ThoiGian,
            r.NoiCongTac,
            r.CongViec
        ]);

    });

    //------------------------------------------------
    // Đề tài
    //------------------------------------------------

    document.querySelector("#deTaiTable tbody").innerHTML="";

    (data.deTai||[]).forEach(r=>{

        addRow("deTai",[
            r.TenDeTai,
            r.Nam,
            r.CapDeTai,
            r.VaiTro
        ]);

    });

    //------------------------------------------------
    // Bài báo
    //------------------------------------------------

    document.querySelector("#baiBaoTable tbody").innerHTML="";

    (data.baiBao||[]).forEach(r=>{

        addRow("baiBao",[
            r.TenBai,
            r.Nam,
            r.TapChi,
            r.Loai,
            r.Q,
            r.VaiTro,
            r.DOI,
            r.Diem
        ]);

    });

    calcSummary();

}
