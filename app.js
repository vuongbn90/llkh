const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxl6cBEoCXorhLarBlMocJvPet3RyLP1McDKXzUSa5oKFq8luYWGHqc6D3sEj5Vv0ZIBw/exec";

function addRow(type){
  const configs={
    congTac:{table:'congTacTable',fields:['thoiGian','noiCongTac','congViec'],types:['text','text','text']},
    deTai:{table:'deTaiTable',fields:['tenDeTai','namDeTai','capDeTai','vaiTroDeTai'],types:['text','text','text','text']},
    baiBao:{table:'baiBaoTable',fields:['tenBai','namBai','tapChi','loai','q','vaiTro','doi','diem'],types:['text','number','text','selectLoai','selectQ','text','text','number']}
  };
  const c=configs[type]; const tbody=document.querySelector(`#${c.table} tbody`); const tr=document.createElement('tr');
  c.fields.forEach((f,i)=>{const td=document.createElement('td'); let el;
    if(c.types[i]==='selectLoai'){el=document.createElement('select'); ['', 'WoS/SSCI/SCIE','Scopus','ESCI','Tạp chí trong nước','Sách/Chương sách','Hội thảo'].forEach(v=>el.add(new Option(v,v)));}
    else if(c.types[i]==='selectQ'){el=document.createElement('select'); ['', 'Q1','Q2','Q3','Q4','Không áp dụng'].forEach(v=>el.add(new Option(v,v)));}
    else{el=document.createElement('input'); el.type=c.types[i]; if(f==='diem'){el.step='0.25'; el.min='0'; el.addEventListener('input',calcSummary)}}
    el.name=`${type}_${f}`; td.appendChild(el); tr.appendChild(td);
  });
  const del=document.createElement('td'); del.innerHTML='<button type="button" class="remove" onclick="this.closest(\'tr\').remove();calcSummary()">Xóa</button>'; tr.appendChild(del); tbody.appendChild(tr);
}
function calcSummary(){
  const diem=[...document.querySelectorAll('input[name="baiBao_diem"]')].map(x=>parseFloat(x.value)||0);
  document.getElementById('tongBai').textContent=diem.length;
  document.getElementById('tongDiem').textContent=diem.reduce((a,b)=>a+b,0).toFixed(2).replace('.00','');
}
function tableData(type){
  const rows=[...document.querySelectorAll(`#${type}Table tbody tr`)];
  return rows.map(r=>[...r.querySelectorAll('input,select')].map(x=>x.value));
}
document.getElementById('llkhForm').addEventListener('submit', async e=>{
  e.preventDefault(); const status=document.getElementById('status'); status.className='';
  const fd=new FormData(e.target); const data=Object.fromEntries(fd.entries());
  data.congTac=tableData('congTac'); data.deTai=tableData('deTai'); data.baiBao=tableData('baiBao'); data.tongBai=document.getElementById('tongBai').textContent; data.tongDiem=document.getElementById('tongDiem').textContent; data.submittedAt=new Date().toISOString();
  if(WEB_APP_URL.includes('PASTE_')){status.textContent='Bản demo: chưa gắn Google Apps Script URL. Dữ liệu đã được kiểm tra trên trình duyệt.';status.className='ok';console.log(data);return;}
  try{status.textContent='Đang gửi...'; const res=await fetch(WEB_APP_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); status.textContent='Đã gửi hồ sơ thành công.';status.className='ok'; e.target.reset(); document.querySelector('#congTacTable tbody').innerHTML=''; document.querySelector('#deTaiTable tbody').innerHTML=''; document.querySelector('#baiBaoTable tbody').innerHTML=''; initRows();}
  catch(err){status.textContent='Không gửi được. Vui lòng kiểm tra URL Apps Script.';status.className='err';}
});
function initRows(){addRow('congTac');addRow('deTai');addRow('baiBao');calcSummary()}
initRows();
