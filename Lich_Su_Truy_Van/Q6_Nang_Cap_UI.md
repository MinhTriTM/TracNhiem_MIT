# Câu hỏi
GIU hiện đại cao cấp, chất lượng, tin cậy gấp 50 lần đẹp hơn nhiều lần, có chế độ sáng, tối, dùng theme hệ thống..., thông tin liên quan, bản quyền, liên hệ...

# Suy nghĩ
Yêu cầu nâng cấp toàn diện giao diện (UI) của ứng dụng Frontend.
Các tính năng cần bổ sung:
1. Giao diện (CSS) hiện đại, cao cấp, bóng bẩy (dùng bóng đổ mềm, bo góc lớn, typography thoáng).
2. Chế độ Light/Dark Mode tự động điều chỉnh theo theme hệ thống (`prefers-color-scheme: dark`).
3. Cấu trúc trang (Layout) bao gồm Header, Main và Footer (chứa thông tin bản quyền, liên hệ).

Cách triển khai:
- Viết lại file `frontend/src/index.css`. Sử dụng biến CSS (`--bg-color`, `--text-color`, `--surface-color`...) và thiết lập chúng trong `:root` (cho sáng) và `@media (prefers-color-scheme: dark) { :root { ... } }` (cho tối).
- Thêm hiệu ứng transition cho mọi element để chuyển đổi theme mượt mà.
- Sửa lại `frontend/src/App.tsx` để bọc nội dung trong cấu trúc `<div className="app-wrapper">` với Header và Footer.
- Footer sẽ chứa thông tin về hệ thống, tác giả, năm bản quyền và email liên hệ.

# Câu trả lời
Tôi đã hiểu yêu cầu nâng cấp UI. Tôi sẽ tiến hành đại tu file CSS và App component để mang lại một giao diện chuẩn mực, cao cấp và hỗ trợ tự động nhận diện chế độ Dark Mode.