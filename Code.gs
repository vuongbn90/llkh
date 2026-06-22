const SPREADSHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = JSON.parse(e.postData.contents);
  const profileId = Utilities.getUuid();
  data.profileId = profileId;
  appendMain(ss, data);
  appendRows(ss, 'CongTac', data, data.congTac || []);
  appendRows(ss, 'DeTai', data, data.deTai || []);
  appendRows(ss, 'BaiBao', data, data.baiBao || []);
  return ContentService.createTextOutput(JSON.stringify({status:'ok', profileId: profileId})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const action = (e.parameter.action || '').toLowerCase();
  let result;
  if (action === 'list') result = {ok:true, data:listProfiles(ss)};
  else if (action === 'detail') result = getProfileDetail(ss, e.parameter.profileId);
  else result = {ok:false, message:'Unknown action'};
  const callback = e.parameter.callback;
  const output = callback ? callback + '(' + JSON.stringify(result) + ')' : JSON.stringify(result);
  return ContentService.createTextOutput(output).setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function appendMain(ss, d){
  const sh = getSheet(ss, 'HoSoGV', ['ProfileID','ThoiGianGui','HoTen','GioiTinh','NgaySinh','NoiSinh','QueQuan','DanToc','HocVi','NamNuocHocVi','ChucDanh','NamBoNhiem','ChucVu','DonVi','DiaChi','DienThoai','Email','TongBai','TongDiem','MinhChung','GhiChu','DHNoiDaoTao','DHNganh','DHNuoc','DHNam','ThSNganh','ThSThongTin','TSNganh','TSThongTin','TenLuanAn','NgoaiNgu1','MucDo1','NgoaiNgu2','MucDo2']);
  sh.appendRow([d.profileId, new Date(), d.hoTen, d.gioiTinh, d.ngaySinh, d.noiSinh, d.queQuan, d.danToc, d.hocVi, d.namNuocHocVi, d.chucDanh, d.namBoNhiem, d.chucVu, d.donVi, d.diaChi, d.dienThoai, d.email, d.tongBai, d.tongDiem, d.minhChung, d.ghiChu, d.dhNoiDaoTao, d.dhNganh, d.dhNuoc, d.dhNam, d.thsNganh, d.thsThongTin, d.tsNganh, d.tsThongTin, d.tenLuanAn, d.ngoaiNgu1, d.mucDo1, d.ngoaiNgu2, d.mucDo2]);
}

function appendRows(ss, sheetName, d, rows){
  const headers = {
    CongTac:['ProfileID','ThoiGianGui','HoTen','Email','ThoiGian','NoiCongTac','CongViec'],
    DeTai:['ProfileID','ThoiGianGui','HoTen','Email','TenDeTai','Nam','CapDeTai','VaiTro'],
    BaiBao:['ProfileID','ThoiGianGui','HoTen','Email','TenBai','Nam','TapChi','Loai','Q','VaiTro','DOI','Diem']
  }[sheetName];
  const sh = getSheet(ss, sheetName, headers);
  rows.forEach(r => sh.appendRow([d.profileId, new Date(), d.hoTen, d.email, ...r]));
}

function getSheet(ss, name, headers){
  let sh = ss.getSheetByName(name);
  if(!sh){ 
    sh = ss.insertSheet(name); 
    sh.appendRow(headers); 
    sh.setFrozenRows(1); 
    return sh;
  }
  const existing = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0];
  if(existing[0] !== headers[0]){
    sh.insertColumnBefore(1);
    sh.getRange(1,1).setValue(headers[0]);
  }
  return sh;
}

function sheetObjects(sh){
  if(!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    const o = {};
    headers.forEach((h,i) => o[h] = row[i]);
    return o;
  });
}

function fmtDate(v){
  if(Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  }
  return v || '';
}

function listProfiles(ss){
  const sh = ss.getSheetByName('HoSoGV');
  const rows = sheetObjects(sh);
  return rows.reverse().map(r => ({
    profileId: r.ProfileID || '',
    thoiGianGui: fmtDate(r.ThoiGianGui),
    hoTen: r.HoTen || '',
    email: r.Email || '',
    donVi: r.DonVi || '',
    tongBai: r.TongBai || '',
    tongDiem: r.TongDiem || ''
  })).filter(r => r.profileId);
}

function getProfileDetail(ss, profileId){
  const main = sheetObjects(ss.getSheetByName('HoSoGV')).find(r => r.ProfileID === profileId);
  if(!main) return {ok:false, message:'Không tìm thấy hồ sơ'};
  const congTac = sheetObjects(ss.getSheetByName('CongTac')).filter(r => r.ProfileID === profileId).map(r => [r.ThoiGian, r.NoiCongTac, r.CongViec]);
  const deTai = sheetObjects(ss.getSheetByName('DeTai')).filter(r => r.ProfileID === profileId).map(r => [r.TenDeTai, r.Nam, r.CapDeTai, r.VaiTro]);
  const baiBao = sheetObjects(ss.getSheetByName('BaiBao')).filter(r => r.ProfileID === profileId).map(r => [r.TenBai, r.Nam, r.TapChi, r.Loai, r.Q, r.VaiTro, r.DOI, r.Diem]);
  const d = {
    profileId: main.ProfileID,
    hoTen: main.HoTen, gioiTinh: main.GioiTinh, ngaySinh: main.NgaySinh, noiSinh: main.NoiSinh,
    queQuan: main.QueQuan, danToc: main.DanToc, hocVi: main.HocVi, namNuocHocVi: main.NamNuocHocVi,
    chucDanh: main.ChucDanh, namBoNhiem: main.NamBoNhiem, chucVu: main.ChucVu, donVi: main.DonVi,
    diaChi: main.DiaChi, dienThoai: main.DienThoai, email: main.Email, tongBai: main.TongBai, tongDiem: main.TongDiem,
    minhChung: main.MinhChung, ghiChu: main.GhiChu,
    dhNoiDaoTao: main.DHNoiDaoTao, dhNganh: main.DHNganh, dhNuoc: main.DHNuoc, dhNam: main.DHNam,
    thsNganh: main.ThSNganh, thsThongTin: main.ThSThongTin, tsNganh: main.TSNganh, tsThongTin: main.TSThongTin,
    tenLuanAn: main.TenLuanAn, ngoaiNgu1: main.NgoaiNgu1, mucDo1: main.MucDo1, ngoaiNgu2: main.NgoaiNgu2, mucDo2: main.MucDo2,
    congTac: congTac, deTai: deTai, baiBao: baiBao
  };
  return {ok:true, data:d};
}
