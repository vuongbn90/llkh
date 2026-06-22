# Portal LLKH V5 - Form + Admin + Xuất PDF

## 1. Upload lên GitHub Pages
Upload toàn bộ các file sau vào repository `llkh`:

- `index.html`
- `admin.html`
- `style.css`
- `app.js`
- `admin.js`
- `CNAME`

Sau đó vào Settings > Pages, chọn `main` và `/(root)`.

## 2. Cấu hình Google Sheet
Tạo Google Sheet hoặc dùng sheet hiện có. Copy ID trong URL:

`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

Dán ID vào dòng đầu trong `Code.gs`:

`const SPREADSHEET_ID = '...';`

## 3. Cấu hình Apps Script
Trong Google Sheet: Extensions > Apps Script.
Dán toàn bộ nội dung `Code.gs`.
Deploy > New deployment > Web app:

- Execute as: Me
- Who has access: Anyone

Copy Web App URL dạng:

`https://script.google.com/macros/s/.../exec`

## 4. Cấu hình Web App URL
Dán Web App URL vào cả hai file:

- `app.js`
- `admin.js`

Tìm dòng:

`const WEB_APP_URL = "...";`

## 5. Sử dụng
- Form giảng viên: `https://llkh.fba.vaa.edu.vn/`
- Trang quản trị: `https://llkh.fba.vaa.edu.vn/admin.html`

Trong trang quản trị, bấm `Xuất PDF` để mở mẫu LLKH rồi chọn `In / Lưu PDF`.

## 6. Lưu ý quan trọng
Sau mỗi lần sửa `Code.gs`, phải Deploy lại:

Deploy > Manage deployments > Edit > Version: New version > Deploy.

Nếu trang quản trị không tải được dữ liệu, kiểm tra:

1. Web App URL trong `admin.js` đúng chưa.
2. Apps Script đã Deploy bản mới chưa.
3. Quyền Deploy là `Anyone` chưa.
4. Test API bằng cách mở:

`WEB_APP_URL?action=list&callback=test`

Kết quả đúng có dạng:

`test({"status":"ok","data":[...]});`
