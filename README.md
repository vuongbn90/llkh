# Portal LLKH online - GitHub Pages + Google Sheets

## 1. Đưa form lên GitHub Pages
1. Tạo repository mới, ví dụ: `llkh-qtkd`.
2. Upload các file: `index.html`, `style.css`, `app.js`.
3. Vào Settings > Pages.
4. Source: Deploy from branch > `main` > `/root`.
5. Sau vài phút sẽ có link dạng: `https://<username>.github.io/llkh-qtkd/`.

## 2. Tạo Google Sheet nhận dữ liệu
1. Tạo Google Sheet mới, ví dụ: `Du_lieu_LLKH_QTKD`.
2. Copy Spreadsheet ID trên URL.
3. Vào Extensions > Apps Script.
4. Dán nội dung file `Code.gs`.
5. Thay `PASTE_GOOGLE_SHEET_ID_HERE` bằng Spreadsheet ID.
6. Deploy > New deployment > Web app.
7. Execute as: Me. Who has access: Anyone.
8. Copy Web app URL.

## 3. Kết nối form với Google Sheet
1. Mở file `app.js`.
2. Thay `PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` bằng Web app URL.
3. Upload lại `app.js` lên GitHub.

## 4. Sử dụng
Gửi link GitHub Pages cho giảng viên. Dữ liệu gửi sẽ lưu vào Google Sheet gồm các sheet:
- HoSoGV
- CongTac
- DeTai
- BaiBao
