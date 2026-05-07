# Q16: Lỗi EADDRINUSE (Trùng cổng 5050) ở Backend

**1. Câu hỏi của người dùng:**
Frontend đã chạy thành công `VITE v5.4.21 ready`. Tuy nhiên, Backend văng lỗi `Error: listen EADDRINUSE: address already in use :::5050`.

**2. Suy nghĩ (Thinking) của Agent:**
- Lỗi `EADDRINUSE` (Error Address In Use) xảy ra khi cổng 5050 đã bị một chương trình khác chiếm dụng.
- Nguyên nhân 99% là do những lần chạy thử `run_all.bat` trước đó, hoặc một cửa sổ terminal ẩn vẫn đang chạy ngầm tiến trình Node.js của Backend cũ và chưa được tắt hoàn toàn.
- Vì không thể can thiệp trực tiếp vào shell của hệ điều hành để tắt tiến trình (do lỗi không tìm thấy shell trước đó), tôi sẽ hướng dẫn người dùng tự kill các tiến trình Node.js đang chạy ngầm bằng lệnh Windows cơ bản.

**3. Câu trả lời cuối cùng:**
- Chúc mừng vì toàn bộ thư viện (Framer Motion, SQLite) đều đã cài đặt thành công 100% (bước 1 và 2 hiển thị `up to date`).
- Hướng dẫn người dùng tắt các tiến trình Node.js đang bị kẹt bằng lệnh `taskkill /F /IM node.exe`.
- Hoặc người dùng chỉ cần tắt hết các cửa sổ terminal màu đen hiện tại và mở lại.