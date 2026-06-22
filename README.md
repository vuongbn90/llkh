# Portal LLKH online - GitHub Pages + Google Sheets + Xuất PDF

## 1. File trong gói
- `index.html`: Form giảng viên nhập LLKH.
- `admin.html`: Trang quản trị danh sách hồ sơ và nút xuất PDF.
- `style.css`: Giao diện.
- `app.js`: Xử lý form và gửi dữ liệu.
- `admin.js`: Lấy dữ liệu từ Google Sheet và tạo bản LLKH để in/lưu PDF.
- `Code.gs`: Google Apps Script API.
- `CNAME`: Domain `llkh.fba.vaa.edu.vn`.

## 2. Upload lên GitHub
Upload toàn bộ các file trên vào thư mục gốc repository `llkh`:

```text
index.html
admin.html
style.css
app.js
admin.js
Code.gs
README.md
CNAME
```

Sau khi upload xong, link form là:

```text
https://llkh.fba.vaa.edu.vn/
```

Trang quản trị/xuất PDF là:

```text
https://llkh.fba.vaa.edu.vn/admin.html
```

## 3. Cập nhật Google Apps Script
1. Mở Google Sheet đang nhận dữ liệu.
2. Vào `Extensions > Apps Script`.
3. Xóa code cũ.
4. Dán toàn bộ nội dung file `Code.gs` trong gói này.
5. Thay `PASTE_GOOGLE_SHEET_ID_HERE` bằng Spreadsheet ID thật.
6. Bấm Save.
7. Deploy > Manage deployments > Edit > New version > Deploy.
8. Copy Web app URL.

## 4. Cập nhật Web App URL
Mở `app.js` và `admin.js`, bảo đảm dòng:

```js
const WEB_APP_URL = ".../exec";
```

là đúng Web app URL mới nhất của Google Apps Script.

## 5. Cách xuất PDF từ dữ liệu GV đã nhập
1. GV điền form và bấm `Gửi hồ sơ`.
2. Thầy mở `https://llkh.fba.vaa.edu.vn/admin.html`.
3. Bấm `Tải danh sách`.
4. Chọn giảng viên và bấm `Xuất PDF`.
5. Cửa sổ LLKH mở ra, chọn `Save as PDF` hoặc in trực tiếp.

## 6. Lưu ý bảo mật
Trang `admin.html` hiện chưa có đăng nhập. Không nên công khai link admin cho giảng viên nếu dữ liệu có thông tin cá nhân.
