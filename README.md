# Sổ Từ Tiếng Anh

Website học từ vựng tiếng Anh cho người Việt. Chạy hoàn toàn trên trình duyệt, không cần cài đặt, không cần tài khoản.

## Tính năng

- **Hôm nay**: chuỗi ngày học, số thẻ cần ôn, số từ đã nhớ, mục tiêu mỗi ngày, "Từ của ngày" và tiến độ theo từng chủ đề.
- **Thẻ từ (flashcards)**: lật thẻ để xem nghĩa, phiên âm IPA và câu ví dụ có dịch. Sau khi lật, tự chấm mức nhớ *Quên / Khó / Nhớ / Dễ*. Thuật toán lặp lại ngắt quãng (dựa trên SM-2) sẽ hẹn ngày ôn lại: từ nhớ tốt quay lại sau nhiều ngày, từ hay quên gặp lại sớm hơn. Từ mới được đưa ra theo thứ tự từ dễ đến khó (A1 trước, C1 sau).
- **Luyện tập**: 4 kiểu bài kiểm tra
  - Chọn nghĩa (Anh → Việt)
  - Chọn từ (Việt → Anh)
  - Nghe và chọn (luyện nghe)
  - Gõ chính tả

  Từ trả lời sai được đưa lại vào hàng ôn tập, và có thể ôn riêng các từ sai bằng thẻ.
- **Sổ từ**: tra cứu (gõ không dấu vẫn tìm được, ví dụ `hanh ly` ra `luggage`), lọc theo chủ đề, trình độ CEFR và trạng thái, đánh dấu sao từ khó, **thêm từ của riêng bạn**.
- **Phát âm** bằng Web Speech API của trình duyệt, chọn giọng Anh-Mỹ hoặc Anh-Anh và chỉnh tốc độ đọc.
- **Phím tắt**: `Space` lật thẻ, `1`–`4` chấm mức nhớ hoặc chọn đáp án, `S` nghe lại, `Enter` sang câu tiếp theo.
- Giao diện sáng/tối theo hệ điều hành, dùng tốt trên điện thoại.
- Tiến độ lưu trong `localStorage` của trình duyệt.

Bộ từ có sẵn gồm **1.040 từ** thuộc 26 chủ đề (mỗi chủ đề 40 từ):

| Nhóm | Chủ đề |
|---|---|
| Đời sống | Cuộc sống hằng ngày, Nhà cửa & việc nhà, Gia đình & các mối quan hệ, Ngoại hình & tính cách, Cảm xúc |
| Ăn uống & mua sắm | Ẩm thực, Mua sắm & tiền bạc |
| Đi lại | Du lịch, Giao thông & đô thị |
| Thiên nhiên | Thời tiết & các mùa, Thiên nhiên & môi trường, Động vật |
| Sức khỏe | Sức khỏe, Thể thao & rèn luyện |
| Học tập & công việc | Giáo dục, Công việc, Kinh doanh & văn phòng |
| Công nghệ & khoa học | Công nghệ, Khoa học |
| Xã hội | Giải trí & truyền thông, Xã hội, Pháp luật & tội phạm |
| Từ vựng cốt lõi | Động từ thông dụng, Tính từ thông dụng, Cụm động từ, Từ học thuật (IELTS) |

Mỗi từ có từ loại, phiên âm IPA (giọng Anh-Mỹ), nghĩa tiếng Việt, câu ví dụ kèm bản dịch và cấp độ CEFR. Theo trình độ: 101 từ A1, 287 từ A2, 467 từ B1, 165 từ B2 và 20 từ C1.

## Chạy thử

Mở trực tiếp file `index.html` bằng trình duyệt, hoặc chạy một web server tĩnh bất kỳ:

```bash
npx http-server .
# hoặc
python3 -m http.server 8000
```

rồi mở `http://localhost:8000`.

## Đưa lên GitHub Pages

1. Vào **Settings → Pages** của repo.
2. Ở mục *Build and deployment*, chọn **Deploy from a branch**, chọn nhánh chứa code và thư mục `/ (root)`.
3. Sau khoảng một phút, trang sẽ có ở `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Cấu trúc

```
index.html      Khung trang và thanh điều hướng
css/style.css   Giao diện (token màu cho chế độ sáng/tối, responsive)
js/vocab.js     Kho từ vựng (hàm VOCAB.add để đăng ký chủ đề)
js/data/*.js    Bộ từ vựng mặc định, chia file theo nhóm chủ đề
js/app.js       Toàn bộ logic: lặp lại ngắt quãng, thẻ từ, bài kiểm tra, sổ từ
```

## Thêm từ vào bộ mặc định

Mở file phù hợp trong `js/data/`, thêm một dòng vào chủ đề theo định dạng:

```js
["word", "loại từ", "/phiên âm/", "nghĩa tiếng Việt", "Câu ví dụ.", "Dịch câu ví dụ.", "B1"]
```

Muốn thêm chủ đề mới thì gọi thêm một lần `VOCAB.add({ id, en, vi }, [...])`. Nếu tạo file mới, nhớ thêm thẻ `<script>` tương ứng vào `index.html` (trước `js/app.js`). Mỗi từ chỉ được xuất hiện một lần trong toàn bộ kho; từ trùng sẽ bị bỏ qua và báo trong console.
