# Q14: Lỗi thiếu thư viện Framer Motion khi khởi chạy Vite

**1. Câu hỏi của người dùng:**
Người dùng dán log lỗi từ terminal khi chạy `run_all.bat`. Lỗi báo: `Error: The following dependencies are imported but could not be resolved: framer-motion (imported by D:/Download/Thi/LSD/tracnghiem_web/frontend/src/pages/Home.tsx)`.

**2. Suy nghĩ (Thinking) của Agent:**
- Ở phiên bản trước, file `Home.tsx` đã được nâng cấp giao diện bằng thư viện animation `framer-motion` nhưng lúc đó chưa kịp cài nó vào `package.json`.
- Cần bổ sung ngay `framer-motion` vào danh sách `dependencies` trong thư mục `frontend/package.json`.
- Vì file bat đang chờ cài đặt và chạy, tôi cần hướng dẫn người dùng chạy lại tiến trình cài thư viện.

**3. Câu trả lời cuối cùng:**
- Đã chỉnh sửa `package.json` thêm `framer-motion`.
- Hướng dẫn người dùng tắt terminal cũ và chạy `npm install` hoặc chạy lại `run_all.bat` để khắc phục triệt để.