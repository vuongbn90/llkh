# Portal LLKH - Xuất PDF từ dữ liệu đã gửi

Bộ này bổ sung `admin.html` để Thầy xem danh sách hồ sơ đã gửi và xuất PDF theo mẫu LLKH.

## Cách cập nhật GitHub Pages
Upload/replace các file:
- index.html
- admin.html
- style.css
- app.js
- CNAME

## Cập nhật Google Apps Script
1. Mở Google Sheet nhận dữ liệu.
2. Extensions > Apps Script.
3. Thay toàn bộ Code.gs bằng file Code.gs trong bộ này.
4. Thay `PASTE_GOOGLE_SHEET_ID_HERE` bằng ID Google Sheet của Thầy.
5. Deploy > Manage deployments > Edit > New version > Deploy.
6. Copy Web app URL.
7. Nếu Web app URL thay đổi, mở app.js và thay hằng số `WEB_APP_URL`.

## Sử dụng
- GV nhập dữ liệu tại `index.html` và bấm Gửi hồ sơ.
- Thầy mở `admin.html`.
- Bấm `Xuất PDF` ở từng giảng viên.
- Cửa sổ LLKH mở ra, bấm `In / Save as PDF`.

Lưu ý: hồ sơ đã gửi trước khi cập nhật Code.gs có thể chưa có ProfileID, nên nên yêu cầu GV gửi lại sau khi cập nhật.
