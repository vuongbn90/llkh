# Portal LLKH - Bản tự tính điểm HĐGS, bỏ ISSN/ISBN

## Điểm mới
- Đã bỏ cột ISSN/ISBN khỏi form bài báo.
- Hệ thống tự dò tạp chí theo **Tên tạp chí/NXB/Hội thảo** trong sheet `DanhMucTapChi`.
- Nếu tìm thấy tạp chí trong danh mục: tự điền `Loại tính điểm`, `Điểm tối đa`, `Điểm đề xuất`.
- Nếu không tìm thấy: người dùng chọn `Loại tính điểm`, hệ thống tự gợi ý điểm tối đa theo nhóm tạp chí/công bố.
- Trang admin xuất PDF cũng đã bỏ cột ISSN/ISBN.

## Files cần upload lên GitHub Pages
Upload các file sau vào repository `llkh`:
- `index.html`
- `admin.html`
- `style.css`
- `app.js`
- `admin.js`
- `CNAME`

## Cấu hình Google Sheet
Tạo hoặc dùng Google Sheet hiện có.
Copy ID trong URL:

`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

Dán ID vào dòng đầu file `Code.gs`:

`const SPREADSHEET_ID = '...';`

## Cấu hình Apps Script
Trong Google Sheet:
1. Extensions > Apps Script.
2. Dán toàn bộ `Code.gs`.
3. Deploy > New deployment > Web app.
4. Execute as: Me.
5. Who has access: Anyone.
6. Copy Web App URL dạng `https://script.google.com/macros/s/.../exec`.
7. Dán URL này vào cả `app.js` và `admin.js` tại dòng `WEB_APP_URL`.
8. Upload lại hai file JS lên GitHub.

## Sheet DanhMucTapChi
Apps Script tự tạo sheet `DanhMucTapChi` với các cột:

| TenTapChi | Loai | DiemToiDa | GhiChu |

Để tự tính đúng toàn bộ danh mục HĐGS, Thầy paste danh mục đầy đủ vào sheet này. Không cần ISSN/ISBN.

Ví dụ:

| TenTapChi | Loai | DiemToiDa | GhiChu |
|---|---|---:|---|
| Journal of Economics and Development | Tạp chí Scopus | 1.5 | Theo danh mục HĐGS 2025 |
| Tạp chí Công Thương | Tạp chí trong nước | 0.5 | Theo danh mục HĐGS 2025 |

## Sử dụng
- Form giảng viên: `https://llkh.fba.vaa.edu.vn/`
- Trang quản trị: `https://llkh.fba.vaa.edu.vn/admin.html`

Nếu không thấy thay đổi sau khi upload, mở:
`https://llkh.fba.vaa.edu.vn/?ver=30`
hoặc
`https://llkh.fba.vaa.edu.vn/admin.html?ver=30`
để tránh cache trình duyệt.
