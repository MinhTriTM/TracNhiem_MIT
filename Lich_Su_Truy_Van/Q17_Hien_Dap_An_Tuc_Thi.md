# Q17: Hiển thị đáp án tức thì và cập nhật UI

## Câu hỏi
thêm nút hiện đáp án ngay lập tức sau khi chọn, chỉnh mày chữ cho button btn-neon màu sáng hơn. đẩy lên github

## Suy nghĩ
1. **Phân tích yêu cầu**:
    - Hiển thị đáp án (đúng/sai) ngay khi người dùng chọn một phương án, không đợi đến khi nộp bài toàn bộ.
    - Màu chữ nút `.btn-neon` hiện tại là xanh đậm/đen, cần chuyển sang màu sáng (trắng) để nổi bật trên nền neon.
    - Đẩy toàn bộ thay đổi lên GitHub.

2. **Giải pháp kỹ thuật**:
    - Trong `Quiz.tsx`, thêm state `revealed` và `correctAnswers` để theo dõi những câu đã được trả lời và đáp án đúng tương ứng.
    - Cập nhật `handleOptionChange` thành hàm `async`. Khi người dùng chọn, gọi API nộp bài (submit) cho duy nhất câu hỏi đó để lấy đáp án đúng từ backend.
    - Cập nhật UI để nếu câu hỏi đã được "tiết lộ" (`revealed`), hiển thị ngay các class `correct`/`incorrect`.
    - Trong `index.css`, sửa thuộc tính `color` của `.btn-neon` từ `#0f172a` sang `#ffffff`.

3. **Thực hiện**:
    - Sửa `frontend/src/pages/Quiz.tsx`.
    - Sửa `frontend/src/index.css`.
    - Chuẩn bị commit và push.

## Câu trả lời
Đã thực hiện các thay đổi sau:
- **Logic Quiz**: Cập nhật trang làm bài để khi bạn chọn một đáp án, hệ thống sẽ tự động kiểm tra và hiển thị kết quả đúng/sai ngay lập tức cho câu đó. Bạn không cần đợi đến cuối buổi thi mới biết kết quả từng câu.
- **UI Enhancement**: Đổi màu chữ của các nút bấm Neon sang màu trắng tinh khiết, giúp giao diện trông chuyên nghiệp và dễ đọc hơn trên nền màu hiện đại.
- **Git**: Đang thực hiện đẩy code lên GitHub repository.
