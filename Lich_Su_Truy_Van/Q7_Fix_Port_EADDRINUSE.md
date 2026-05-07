# Câu hỏi
Người dùng cung cấp log lỗi:
`Error: listen EADDRINUSE: address already in use :::5000`

# Suy nghĩ
Lỗi `EADDRINUSE` xảy ra do cổng (port) 5000 đã có một tiến trình khác sử dụng (có thể là một lần chạy backend cũ chưa được tắt hẳn, hoặc một ứng dụng khác trên máy).
Cách giải quyết tốt nhất ở đây là:
1. **Ở cấp độ `run_all.bat`:** Tạm thời tiêu diệt tiến trình đang chiếm port 5000 trên Windows trước khi gọi lệnh chạy. Tuy nhiên, việc này (dùng `netstat` và `taskkill`) có thể giết nhầm ứng dụng khác của người dùng.
2. **Ở cấp độ Node.js (Backend):** Bắt lỗi EADDRINUSE và tự động nhảy sang cổng 5001, 5002... Việc này an toàn hơn, nhưng frontend sẽ không biết backend chạy ở port nào vì frontend đang hardcode `http://localhost:5000` trong code.
3. **Cách an toàn & ổn định nhất:** Thay đổi cổng mặc định của Backend sang một cổng ít bị đụng hơn (như `5555` hoặc `5050`) và cập nhật đồng bộ các file Frontend để gọi đúng cổng này. Đồng thời, tôi khuyên người dùng khởi động lại máy hoặc tắt các terminal cũ.
Tôi sẽ chọn đổi hẳn cổng giao tiếp Backend sang `5050` để dứt điểm sự cố dính port `5000` này. Tôi cần dùng `replace` để sửa:
- `backend/src/index.ts` đổi `5000` thành `5050`.
- `run_all.bat` đổi log `5000` thành `5050`.
- `frontend/src/pages/Home.tsx`, `frontend/src/pages/SubjectDetails.tsx`, `frontend/src/pages/Quiz.tsx` đổi chuỗi `http://localhost:5000` thành `http://localhost:5050`.

# Câu trả lời
Lỗi EADDRINUSE nghĩa là Cổng 5000 trên máy của bạn đang bị một ứng dụng khác hoặc một cửa sổ chạy ngầm trước đó chiếm dụng. Tôi sẽ đổi Backend sang chạy trên cổng `5050` và cấu hình lại toàn bộ Frontend để chúng nhận diện cổng mới này. Đồng thời, khuyên bạn đóng các cửa sổ dòng lệnh đen (cmd) đang mở trước khi chạy lại `run_all.bat`.