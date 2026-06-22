// ===============================
// LLKH PORTAL V5 - GOOGLE APPS SCRIPT
// ===============================
// 1) Thay SPREADSHEET_ID bằng ID Google Sheet, KHÔNG dùng Web App URL.
// 2) Deploy > New deployment > Web app.
// 3) Execute as: Me. Who has access: Anyone.
// 4) Sau mỗi lần sửa Code.gs: Deploy > Manage deployments > Edit > New version > Deploy.

const SPREADSHEET_ID = '1Mbg42-zmS7KcduxqWS7KbyraqX0PQ1gDfRiEkFSgkSM';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');

    const emailKey = String(data.email || '').trim().toLowerCase();
    let profileId = data.profileId || findProfileIdByEmail(ss, emailKey) || Utilities.getUuid();
    data.profileId = profileId;

    // Neu GV gui lai ho so, xoa du lieu cu cua ProfileID truoc khi luu moi
    deleteByProfileId(ss, profileId);

    appendMain(ss, data);
    appendRows(ss, 'CongTac', data, data.congTac || []);
    appendRows(ss, 'DeTai', data, data.deTai || []);
    appendRows(ss, 'BaiBao', data, data.baiBao || []);

    return jsonOutput({ status: 'ok', profileId: profileId }, e);
  } catch (err) {
    return jsonOutput({ status: 'error', message: String(err && err.message ? err.message : err) }, e);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const action = String((e.parameter && e.parameter.action) || '').toLowerCase();
    let result;
    if (action === 'list') {
      result = listProfiles(ss);
    } else if (action === 'profile') {
      result = getProfile(ss, (e.parameter && e.parameter.id) || '');
    } else {
      result = { status: 'ok', message: 'LLKH API V5 is running', actions: ['list', 'profile'] };
    }
    return jsonOutput(result, e);
  } catch (err) {
    return jsonOutput({ status: 'error', message: String(err && err.message ? err.message : err) }, e);
  }
}

function jsonOutput(obj, e) {
  const callback = e && e.parameter && e.parameter.callback;
  const json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function appendMain(ss, d) {
  const sh = getSheet(ss, 'HoSoGV', mainHeaders());
  sh.appendRow([
    d.profileId, new Date(), d.hoTen, d.gioiTinh, d.ngaySinh, d.noiSinh, d.queQuan, d.danToc, d.hocVi, d.namNuocHocVi,
    d.chucDanh, d.namBoNhiem, d.chucVu, d.donVi, d.diaChi, d.dienThoai, d.email,
    d.dhNoiDaoTao, d.dhNganh, d.dhNuoc, d.dhNam, d.thsNganh, d.thsThongTin, d.tsNganh, d.tsThongTin, d.tenLuanAn, d.ngoaiNgu1, d.mucDo1, d.ngoaiNgu2, d.mucDo2,
    d.tongBai, d.tongDiem, d.minhChung, d.ghiChu
  ]);
}

function appendRows(ss, sheetName, d, rows) {
  const headers = {
    CongTac: ['ProfileID','ThoiGianGui','HoTen','Email','ThoiGian','NoiCongTac','CongViec'],
    DeTai: ['ProfileID','ThoiGianGui','HoTen','Email','TenDeTai','Nam','CapDeTai','VaiTro'],
    BaiBao: ['ProfileID','ThoiGianGui','HoTen','Email','TenBai','Nam','TapChi','Loai','Q','VaiTro','DOI','Diem']
  }[sheetName];
  const sh = getSheet(ss, sheetName, headers);
  rows.forEach(r => {
    if (!r || !Array.isArray(r) || r.join('').trim() === '') return;
    sh.appendRow([d.profileId, new Date(), d.hoTen, d.email].concat(r));
  });
}

function mainHeaders() {
  return [
    'ProfileID','ThoiGianGui','HoTen','GioiTinh','NgaySinh','NoiSinh','QueQuan','DanToc','HocVi','NamNuocHocVi',
    'ChucDanh','NamBoNhiem','ChucVu','DonVi','DiaChi','DienThoai','Email',
    'DH_NoiDaoTao','DH_Nganh','DH_Nuoc','DH_Nam','ThS_Nganh','ThS_ThongTin','TS_Nganh','TS_ThongTin','TenLuanAn','NgoaiNgu1','MucDo1','NgoaiNgu2','MucDo2',
    'TongBai','TongDiem','MinhChung','GhiChu'
  ];
}

function getSheet(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

function rowsAsObjects(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] instanceof Date ? Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : row[i];
    });
    return obj;
  });
}

function findProfileIdByEmail(ss, email) {
  if (!email) return '';
  const rows = rowsAsObjects(ss.getSheetByName('HoSoGV'));
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].Email || '').trim().toLowerCase() === email) return rows[i].ProfileID;
  }
  return '';
}

function deleteByProfileId(ss, profileId) {
  ['HoSoGV', 'CongTac', 'DeTai', 'BaiBao'].forEach(name => {
    const sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return;
    const values = sh.getDataRange().getValues();
    for (let r = values.length; r >= 2; r--) {
      if (String(values[r - 1][0]) === String(profileId)) sh.deleteRow(r);
    }
  });
}

function listProfiles(ss) {
  const sh = ss.getSheetByName('HoSoGV');
  const rows = rowsAsObjects(sh);
  const latest = {};
  rows.forEach(r => { if (r.ProfileID) latest[r.ProfileID] = r; });
  const data = Object.keys(latest).map(id => {
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
  return { status: 'ok', data: data };
}

function getProfile(ss, id) {
  const mainRows = rowsAsObjects(ss.getSheetByName('HoSoGV')).filter(r => String(r.ProfileID) === String(id));
  if (!mainRows.length) return { status: 'error', message: 'Khong tim thay ho so' };
  const main = mainRows[mainRows.length - 1];
  const congTac = rowsAsObjects(ss.getSheetByName('CongTac')).filter(r => String(r.ProfileID) === String(id));
  const deTai = rowsAsObjects(ss.getSheetByName('DeTai')).filter(r => String(r.ProfileID) === String(id));
  const baiBao = rowsAsObjects(ss.getSheetByName('BaiBao')).filter(r => String(r.ProfileID) === String(id));
  return { status: 'ok', data: { main: main, congTac: congTac, deTai: deTai, baiBao: baiBao } };
}
