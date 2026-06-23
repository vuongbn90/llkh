// ===============================
// LLKH PORTAL - GOOGLE APPS SCRIPT
// Bản không dùng ISSN/ISBN; tự tính điểm theo tên tạp chí trong sheet DanhMucTapChi
// ===============================
// Thay bằng ID Google Sheet của Thầy.
const SPREADSHEET_ID = '1Mbg42-zmS7KcduxqWS7KbyraqX0PQ1gDfRiEkFSgkSM';

function doPost(e) {
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    return saveData_(data, e);
  } catch (err) {
    return jsonOutput_({status:'error', message:String(err)}, e);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const action = String((e.parameter && e.parameter.action) || '').toLowerCase();

    if (action === 'submitjsonp') {
      const data = JSON.parse(e.parameter.payload || '{}');
      return saveData_(data, e);
    }
    if (action === 'list') return jsonOutput_(listProfiles_(ss), e);
    if (action === 'profile') return jsonOutput_(getProfile_(ss, e.parameter.id || ''), e);
    if (action === 'catalog') return jsonOutput_({status:'ok', data:getJournalCatalog_(ss)}, e);
    if (action === 'rules') return jsonOutput_({status:'ok', data:scoreRules_()}, e);

    return jsonOutput_({status:'ok', message:'LLKH API is running', actions:['list','profile','submitJsonp','catalog','rules']}, e);
  } catch (err) {
    return jsonOutput_({status:'error', message:String(err)}, e);
  }
}

function saveData_(data, e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAllSheets_(ss);

  const emailKey = String(data.email || '').trim().toLowerCase();
  const profileId = data.profileId || findProfileIdByEmail_(ss, emailKey) || Utilities.getUuid();
  data.profileId = profileId;

  deleteByProfileId_(ss, profileId);
  appendMain_(ss, data);
  appendRows_(ss, 'CongTac', data, data.congTac || []);
  appendRows_(ss, 'DeTai', data, data.deTai || []);
  appendRows_(ss, 'BaiBao', data, data.baiBao || []);

  return jsonOutput_({status:'ok', profileId:profileId}, e);
}

function jsonOutput_(obj, e) {
  const callback = e && e.parameter && e.parameter.callback;
  const json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function headers_() {
  return {
    HoSoGV: [
      'ProfileID','ThoiGianGui','HoTen','GioiTinh','NgaySinh','NoiSinh','QueQuan','DanToc','HocVi','NamNuocHocVi',
      'ChucDanh','NamBoNhiem','ChucVu','DonVi','DiaChi','DienThoai','Email',
      'DH_NoiDaoTao','DH_Nganh','DH_Nuoc','DH_Nam','ThS_Nganh','ThS_ThongTin','TS_Nganh','TS_ThongTin','TenLuanAn',
      'NgoaiNgu1','MucDo1','NgoaiNgu2','MucDo2','TongBai','TongDiem','MinhChung','GhiChu'
    ],
    CongTac: ['ProfileID','ThoiGianGui','HoTen','Email','ThoiGian','NoiCongTac','CongViec'],
    DeTai: ['ProfileID','ThoiGianGui','HoTen','Email','TenDeTai','Nam','CapDeTai','VaiTro'],
    BaiBao: [
      'ProfileID','ThoiGianGui','HoTen','Email','TenBai','Nam','TapChi','LoaiTinhDiem',
      'Q_IF_CiteScore','VaiTro','DOI','DiemToiDa','DiemDeXuat','TrangThai'
    ],
    DanhMucTapChi: ['TenTapChi','Loai','DiemToiDa','GhiChu']
  };
}

function ensureAllSheets_(ss) {
  const h = headers_();
  Object.keys(h).forEach(function(name){ getSheet_(ss, name, h[name]); });
  seedJournalCatalogIfEmpty_(ss.getSheetByName('DanhMucTapChi'));
}

function appendMain_(ss, d) {
  const sh = getSheet_(ss, 'HoSoGV', headers_().HoSoGV);
  sh.appendRow([
    d.profileId, new Date(), d.hoTen, d.gioiTinh, d.ngaySinh, d.noiSinh, d.queQuan, d.danToc, d.hocVi, d.namNuocHocVi,
    d.chucDanh, d.namBoNhiem, d.chucVu, d.donVi, d.diaChi, d.dienThoai, d.email,
    d.dhNoiDaoTao, d.dhNganh, d.dhNuoc, d.dhNam, d.thsNganh, d.thsThongTin, d.tsNganh, d.tsThongTin, d.tenLuanAn,
    d.ngoaiNgu1, d.mucDo1, d.ngoaiNgu2, d.mucDo2, d.tongBai, d.tongDiem, d.minhChung, d.ghiChu
  ]);
}

function appendRows_(ss, sheetName, d, rows) {
  const sh = getSheet_(ss, sheetName, headers_()[sheetName]);
  rows.forEach(function(r) {
    if (!r || r.join('').trim() === '') return;

    if (sheetName === 'CongTac') {
      sh.appendRow([d.profileId, new Date(), d.hoTen, d.email, r[0], r[1], r[2]]);
    } else if (sheetName === 'DeTai') {
      sh.appendRow([d.profileId, new Date(), d.hoTen, d.email, r[0], r[1], r[2], r[3]]);
    } else if (sheetName === 'BaiBao') {
      // r = TenBai, Nam, TapChi, LoaiTinhDiem, Q_IF, VaiTro, DOI, DiemToiDa, DiemDeXuat, TrangThai
      sh.appendRow([d.profileId, new Date(), d.hoTen, d.email, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], stripHtml_(r[9])]);
    }
  });
}

function getSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    return sh;
  }

  const lastCol = Math.max(sh.getLastColumn(), headers.length);
  const current = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  if (current.slice(0, headers.length).join('|') !== headers.join('|')) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function rowsAsObjects_(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return values.map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) {
      obj[h] = row[i] instanceof Date
        ? Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
        : row[i];
    });
    return obj;
  });
}

function findProfileIdByEmail_(ss, emailKey) {
  if (!emailKey) return '';
  const rows = rowsAsObjects_(ss.getSheetByName('HoSoGV'));
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].Email || '').trim().toLowerCase() === emailKey) return rows[i].ProfileID || '';
  }
  return '';
}

function deleteByProfileId_(ss, profileId) {
  ['HoSoGV','CongTac','DeTai','BaiBao'].forEach(function(name) {
    const sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return;
    const values = sh.getDataRange().getValues();
    for (let r = values.length; r >= 2; r--) {
      if (String(values[r-1][0]) === String(profileId)) sh.deleteRow(r);
    }
  });
}

function listProfiles_(ss) {
  ensureAllSheets_(ss);
  const rows = rowsAsObjects_(ss.getSheetByName('HoSoGV'));
  const latest = {};
  rows.forEach(function(r){ latest[r.ProfileID] = r; });

  const data = Object.keys(latest).map(function(id) {
    const r = latest[id];
    return {
      profileId: r.ProfileID,
      thoiGianGui: r.ThoiGianGui,
      hoTen: r.HoTen,
      email: r.Email,
      donVi: r.DonVi,
      tongBai: r.TongBai,
      tongDiem: r.TongDiem
    };
  }).reverse();
  return {status:'ok', data:data};
}

function getProfile_(ss, id) {
  ensureAllSheets_(ss);
  const mainRows = rowsAsObjects_(ss.getSheetByName('HoSoGV')).filter(function(r){ return String(r.ProfileID) === String(id); });
  if (!mainRows.length) return {status:'error', message:'Không tìm thấy hồ sơ'};

  const main = mainRows[mainRows.length - 1];
  const congTac = rowsAsObjects_(ss.getSheetByName('CongTac')).filter(function(r){ return String(r.ProfileID) === String(id); });
  const deTai = rowsAsObjects_(ss.getSheetByName('DeTai')).filter(function(r){ return String(r.ProfileID) === String(id); });
  const baiBao = rowsAsObjects_(ss.getSheetByName('BaiBao')).filter(function(r){ return String(r.ProfileID) === String(id); });
  return {status:'ok', data:{main:main, congTac:congTac, deTai:deTai, baiBao:baiBao}};
}

function getJournalCatalog_(ss) {
  const sh = getSheet_(ss, 'DanhMucTapChi', headers_().DanhMucTapChi);
  seedJournalCatalogIfEmpty_(sh);
  return rowsAsObjects_(sh)
    .filter(function(r){ return r.TenTapChi; })
    .map(function(r){
      return {
        TenTapChi: r.TenTapChi,
        Loai: r.Loai,
        DiemToiDa: Number(r.DiemToiDa || 0),
        GhiChu: r.GhiChu
      };
    });
}

function seedJournalCatalogIfEmpty_(sh) {
  if (!sh || sh.getLastRow() > 1) return;
  const sample = [
    ['Journal of Asian Business and Economic Studies','Tạp chí Scopus',1.50,'Dữ liệu mẫu HĐGS 2025; thay bằng danh mục đầy đủ'],
    ['Journal of Economics and Development','Tạp chí Scopus',1.50,'Dữ liệu mẫu HĐGS 2025; thay bằng danh mục đầy đủ'],
    ['Journal of Finance and Accountancy Research','Tạp chí',1.00,'Dữ liệu mẫu HĐGS 2025'],
    ['Tạp chí Công Thương','Tạp chí trong nước',0.50,'Dữ liệu mẫu HĐGS 2025'],
    ['Kinh tế và Dự báo','Tạp chí trong nước',0.75,'Dữ liệu mẫu HĐGS 2025'],
    ['Nghiên cứu Kinh tế','Tạp chí trong nước',1.00,'Dữ liệu mẫu HĐGS 2025'],
    ['Tạp chí Tài chính','Tạp chí trong nước',0.75,'Dữ liệu mẫu HĐGS 2025'],
    ['Khoa học Thương mại','Tạp chí trong nước',0.75,'Dữ liệu mẫu HĐGS 2025'],
    ['Tài chính Doanh nghiệp','Tạp chí trong nước',0.50,'Dữ liệu mẫu HĐGS 2025']
  ];
  sh.getRange(2, 1, sample.length, sample[0].length).setValues(sample);
}

function scoreRules_() {
  return [
    {code:'SCI_IF3_AHCI', label:'SCI/SCIE/SSCI IF ≥ 3 hoặc A&HCI', max:3.00},
    {code:'SCI_IF_LT3_SCOPUS_Q1', label:'SCI/SCIE/SSCI IF < 3 hoặc Scopus Q1', max:2.00},
    {code:'ESCI_SCOPUS_Q2', label:'ESCI hoặc Scopus Q2', max:1.50},
    {code:'ACI', label:'ACI', max:1.25},
    {code:'QT_KHAC', label:'Tạp chí quốc tế khác có ISSN/phản biện', max:1.00},
    {code:'TRONG_NUOC_KHAC', label:'Tạp chí khoa học trong nước khác', max:0.50},
    {code:'CONF_QT', label:'Báo cáo khoa học hội thảo quốc tế', max:1.00},
    {code:'CONF_QG', label:'Báo cáo khoa học hội thảo quốc gia', max:0.50}
  ];
}

function stripHtml_(v) {
  return String(v == null ? '' : v).replace(/<[^>]*>/g, '').trim();
}
