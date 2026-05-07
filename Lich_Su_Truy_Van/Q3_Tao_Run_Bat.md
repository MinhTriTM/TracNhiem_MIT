# Câu hỏi
nhớ viết file run_all.bat, chạy ở port 3000,

# Suy nghĩ
Người dùng yêu cầu viết script `run_all.bat` để chạy ứng dụng và yêu cầu chạy ở port 3000.
Mặc định Vite chạy ở port 5173. Tôi cần cấu hình file `vite.config.ts` ở Frontend để chuyển sang port 3000.
Backend hiện đang chạy ở port 5000 (đã cứng trong frontend components), nên tôi sẽ giữ nguyên Backend port 5000 và chỉnh Frontend chạy trên port 3000.
Đồng thời, tạo file `run_all.bat` tại thư mục gốc để tự động cài npm packages và chạy cả 2 server.

# Câu trả lời
Tôi đã chỉnh sửa file cấu hình của Frontend để chạy trên port 3000 và tạo file `run_all.bat` cho bạn.