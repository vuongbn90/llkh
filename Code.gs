const SPREADSHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = JSON.parse(e.postData.contents);
  appendMain(ss, data);
  appendRows(ss, 'CongTac', data, data.congTac || []);
  appendRows(ss, 'DeTai', data, data.deTai || []);
  appendRows(ss, 'BaiBao', data, data.baiBao || []);
  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
}
function appendMain(ss, d){
  const sh = getSheet(ss, 'HoSoGV', ['ThoiGianGui','HoTen','GioiTinh','NgaySinh','NoiSinh','QueQuan','DanToc','HocVi','NamNuocHocVi','ChucDanh','NamBoNhiem','ChucVu','DonVi','DiaChi','DienThoai','Email','TongBai','TongDiem','MinhChung','GhiChu']);
  sh.appendRow([new Date(), d.hoTen, d.gioiTinh, d.ngaySinh, d.noiSinh, d.queQuan, d.danToc, d.hocVi, d.namNuocHocVi, d.chucDanh, d.namBoNhiem, d.chucVu, d.donVi, d.diaChi, d.dienThoai, d.email, d.tongBai, d.tongDiem, d.minhChung, d.ghiChu]);
}
function appendRows(ss, sheetName, d, rows){
  const headers = {
    CongTac:['ThoiGianGui','HoTen','Email','ThoiGian','NoiCongTac','CongViec'],
    DeTai:['ThoiGianGui','HoTen','Email','TenDeTai','Nam','CapDeTai','VaiTro'],
    BaiBao:['ThoiGianGui','HoTen','Email','TenBai','Nam','TapChi','Loai','Q','VaiTro','DOI','Diem']
  }[sheetName];
  const sh = getSheet(ss, sheetName, headers);
  rows.forEach(r => sh.appendRow([new Date(), d.hoTen, d.email, ...r]));
}
function getSheet(ss, name, headers){
  let sh = ss.getSheetByName(name);
  if(!sh){ sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); }
  return sh;
}
