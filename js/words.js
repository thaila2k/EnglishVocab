// Bộ từ vựng mặc định. Mỗi từ: [word, pos, ipa, vi, example, exampleVi, level]
// IPA theo giọng Anh-Mỹ. Level theo khung CEFR (A1 → C2).
(function () {
  const topics = [
    { id: 'daily', en: 'Daily Life', vi: 'Cuộc sống hằng ngày' },
    { id: 'food', en: 'Food & Drink', vi: 'Ẩm thực' },
    { id: 'travel', en: 'Travel', vi: 'Du lịch' },
    { id: 'work', en: 'Work & Career', vi: 'Công việc' },
    { id: 'feelings', en: 'Feelings', vi: 'Cảm xúc' },
    { id: 'tech', en: 'Technology', vi: 'Công nghệ' },
    { id: 'health', en: 'Health', vi: 'Sức khỏe' },
    { id: 'nature', en: 'Nature & Environment', vi: 'Thiên nhiên & Môi trường' },
    { id: 'education', en: 'Education', vi: 'Giáo dục' },
    { id: 'academic', en: 'Academic (IELTS)', vi: 'Từ học thuật' }
  ];

  const raw = {
    daily: [
      ['routine', 'n.', '/ruːˈtiːn/', 'nếp sinh hoạt hằng ngày', 'My morning routine starts with a cup of coffee.', 'Buổi sáng của tôi luôn bắt đầu bằng một tách cà phê.', 'B1'],
      ['commute', 'v.', '/kəˈmjuːt/', 'đi lại giữa nhà và nơi làm việc', 'She commutes to work by bus every day.', 'Cô ấy đi làm bằng xe buýt mỗi ngày.', 'B1'],
      ['chore', 'n.', '/tʃɔːr/', 'việc nhà', 'Doing the dishes is my least favorite chore.', 'Rửa bát là việc nhà tôi ghét nhất.', 'A2'],
      ['neighbor', 'n.', '/ˈneɪbər/', 'hàng xóm', 'Our neighbor helped us carry the sofa upstairs.', 'Người hàng xóm đã giúp chúng tôi khiêng ghế sofa lên lầu.', 'A2'],
      ['grocery', 'n.', '/ˈɡroʊsəri/', 'thực phẩm, hàng tạp hóa', 'I need to buy some groceries after work.', 'Tôi cần mua ít đồ ăn sau giờ làm.', 'A2'],
      ['appointment', 'n.', '/əˈpɔɪntmənt/', 'cuộc hẹn', 'I have a dentist appointment at 3 p.m.', 'Tôi có hẹn với nha sĩ lúc 3 giờ chiều.', 'A2'],
      ['laundry', 'n.', '/ˈlɔːndri/', 'việc giặt giũ; quần áo cần giặt', 'I usually do the laundry on Sundays.', 'Tôi thường giặt đồ vào Chủ nhật.', 'A2'],
      ['oversleep', 'v.', '/ˌoʊvərˈsliːp/', 'ngủ quên', 'If I oversleep, I will miss the train.', 'Nếu ngủ quên, tôi sẽ lỡ chuyến tàu.', 'B1'],
      ['errand', 'n.', '/ˈerənd/', 'việc vặt phải ra ngoài làm', 'I have a few errands to run this afternoon.', 'Chiều nay tôi có vài việc vặt phải đi làm.', 'B1'],
      ['tidy', 'adj.', '/ˈtaɪdi/', 'gọn gàng, ngăn nắp', 'Please keep your room tidy.', 'Con nhớ giữ phòng gọn gàng nhé.', 'A2'],
      ['borrow', 'v.', '/ˈbɑːroʊ/', 'mượn', 'Can I borrow your umbrella?', 'Tôi mượn cái ô của bạn được không?', 'A2'],
      ['habit', 'n.', '/ˈhæbɪt/', 'thói quen', 'Reading before bed is a good habit.', 'Đọc sách trước khi ngủ là một thói quen tốt.', 'A2']
    ],
    food: [
      ['delicious', 'adj.', '/dɪˈlɪʃəs/', 'ngon', 'This pho is absolutely delicious!', 'Món phở này ngon tuyệt!', 'A1'],
      ['recipe', 'n.', '/ˈresəpi/', 'công thức nấu ăn', 'Can you share your recipe for spring rolls?', 'Bạn chia sẻ công thức làm nem cuốn được không?', 'A2'],
      ['ingredient', 'n.', '/ɪnˈɡriːdiənt/', 'nguyên liệu', 'Fresh herbs are a key ingredient in Vietnamese food.', 'Rau thơm tươi là nguyên liệu quan trọng trong món ăn Việt.', 'B1'],
      ['spicy', 'adj.', '/ˈspaɪsi/', 'cay', 'Is this soup too spicy for you?', 'Món súp này có quá cay với bạn không?', 'A2'],
      ['vegetarian', 'n.', '/ˌvedʒəˈteriən/', 'người ăn chay', 'My sister has been a vegetarian for five years.', 'Chị tôi đã ăn chay được năm năm.', 'B1'],
      ['leftovers', 'n.', '/ˈleftoʊvərz/', 'đồ ăn thừa', 'We had the leftovers for lunch the next day.', 'Hôm sau chúng tôi ăn đồ thừa cho bữa trưa.', 'B1'],
      ['boil', 'v.', '/bɔɪl/', 'luộc, đun sôi', 'Boil the eggs for about ten minutes.', 'Luộc trứng khoảng mười phút.', 'A2'],
      ['appetite', 'n.', '/ˈæpɪtaɪt/', 'sự thèm ăn, cảm giác ngon miệng', 'Swimming always gives me a big appetite.', 'Bơi lội luôn khiến tôi ăn rất ngon miệng.', 'B2'],
      ['flavor', 'n.', '/ˈfleɪvər/', 'hương vị', 'Lemongrass adds a fresh flavor to the dish.', 'Sả làm món ăn thêm hương vị tươi mát.', 'B1'],
      ['dessert', 'n.', '/dɪˈzɜːrt/', 'món tráng miệng', "Let's have mango sticky rice for dessert.", 'Mình ăn xôi xoài tráng miệng nhé.', 'A2'],
      ['bland', 'adj.', '/blænd/', 'nhạt nhẽo, vô vị', 'The soup tastes bland, so add some fish sauce.', 'Canh hơi nhạt, cho thêm chút nước mắm đi.', 'B2'],
      ['portion', 'n.', '/ˈpɔːrʃən/', 'khẩu phần, suất ăn', 'The portions at this restaurant are huge.', 'Khẩu phần ở nhà hàng này rất lớn.', 'B1']
    ],
    travel: [
      ['destination', 'n.', '/ˌdestɪˈneɪʃən/', 'điểm đến', 'Da Nang is a popular destination for tourists.', 'Đà Nẵng là điểm đến được du khách yêu thích.', 'B1'],
      ['itinerary', 'n.', '/aɪˈtɪnəreri/', 'lịch trình chuyến đi', 'Our itinerary includes three days in Hoi An.', 'Lịch trình của chúng tôi có ba ngày ở Hội An.', 'B2'],
      ['luggage', 'n.', '/ˈlʌɡɪdʒ/', 'hành lý', 'Please do not leave your luggage unattended.', 'Vui lòng không để hành lý mà không có người trông.', 'A2'],
      ['passport', 'n.', '/ˈpæspɔːrt/', 'hộ chiếu', "Don't forget to bring your passport.", 'Đừng quên mang hộ chiếu nhé.', 'A1'],
      ['souvenir', 'n.', '/ˌsuːvəˈnɪr/', 'quà lưu niệm', 'I bought a conical hat as a souvenir.', 'Tôi mua một chiếc nón lá làm quà lưu niệm.', 'B1'],
      ['accommodation', 'n.', '/əˌkɑːməˈdeɪʃən/', 'chỗ ở', 'The price includes flights and accommodation.', 'Giá đã bao gồm vé máy bay và chỗ ở.', 'B1'],
      ['delay', 'v.', '/dɪˈleɪ/', 'trì hoãn, làm chậm trễ', 'Our flight was delayed by two hours.', 'Chuyến bay của chúng tôi bị hoãn hai tiếng.', 'B1'],
      ['sightseeing', 'n.', '/ˈsaɪtsiːɪŋ/', 'việc đi tham quan', 'We spent the whole day sightseeing in Hue.', 'Chúng tôi dành cả ngày đi tham quan Huế.', 'A2'],
      ['landmark', 'n.', '/ˈlændmɑːrk/', 'địa danh nổi tiếng', 'The Golden Bridge has become a famous landmark.', 'Cầu Vàng đã trở thành một địa danh nổi tiếng.', 'B1'],
      ['backpack', 'n.', '/ˈbækpæk/', 'ba lô', 'He travels around Asia with just a backpack.', 'Anh ấy đi khắp châu Á chỉ với một chiếc ba lô.', 'A2'],
      ['currency', 'n.', '/ˈkɜːrənsi/', 'tiền tệ', 'What currency do they use in Thailand?', 'Ở Thái Lan người ta dùng loại tiền gì?', 'B1'],
      ['departure', 'n.', '/dɪˈpɑːrtʃər/', 'sự khởi hành', 'Please arrive two hours before departure.', 'Vui lòng có mặt hai tiếng trước giờ khởi hành.', 'B1']
    ],
    work: [
      ['colleague', 'n.', '/ˈkɑːliːɡ/', 'đồng nghiệp', 'I often have lunch with my colleagues.', 'Tôi thường ăn trưa với đồng nghiệp.', 'B1'],
      ['deadline', 'n.', '/ˈdedlaɪn/', 'hạn chót', 'The deadline for this report is Friday.', 'Hạn chót nộp báo cáo này là thứ Sáu.', 'B1'],
      ['salary', 'n.', '/ˈsæləri/', 'tiền lương', 'She asked for a higher salary.', 'Cô ấy đề nghị được tăng lương.', 'B1'],
      ['resign', 'v.', '/rɪˈzaɪn/', 'từ chức, xin nghỉ việc', 'He resigned to start his own business.', 'Anh ấy nghỉ việc để tự kinh doanh.', 'B2'],
      ['promotion', 'n.', '/prəˈmoʊʃən/', 'sự thăng chức', 'She got a promotion after only one year.', 'Cô ấy được thăng chức chỉ sau một năm.', 'B1'],
      ['interview', 'n.', '/ˈɪntərvjuː/', 'cuộc phỏng vấn', 'I have a job interview tomorrow morning.', 'Sáng mai tôi có buổi phỏng vấn xin việc.', 'A2'],
      ['schedule', 'n.', '/ˈskedʒuːl/', 'lịch làm việc, thời gian biểu', 'My schedule is very busy this week.', 'Tuần này lịch của tôi rất kín.', 'B1'],
      ['negotiate', 'v.', '/nɪˈɡoʊʃieɪt/', 'đàm phán, thương lượng', 'We need to negotiate a better price.', 'Chúng ta cần thương lượng một mức giá tốt hơn.', 'B2'],
      ['responsible', 'adj.', '/rɪˈspɑːnsəbəl/', 'chịu trách nhiệm', 'Who is responsible for this project?', 'Ai chịu trách nhiệm cho dự án này?', 'B1'],
      ['overtime', 'n.', '/ˈoʊvərtaɪm/', 'giờ làm thêm', 'I worked overtime to finish the project.', 'Tôi làm thêm giờ để hoàn thành dự án.', 'B1'],
      ['employer', 'n.', '/ɪmˈplɔɪər/', 'người tuyển dụng, chủ lao động', 'My employer pays for my English classes.', 'Công ty tôi trả tiền học tiếng Anh cho tôi.', 'B1'],
      ['teamwork', 'n.', '/ˈtiːmwɜːrk/', 'tinh thần làm việc nhóm', 'Good teamwork is the key to success.', 'Làm việc nhóm tốt là chìa khóa thành công.', 'B1']
    ],
    feelings: [
      ['anxious', 'adj.', '/ˈæŋkʃəs/', 'lo lắng, bồn chồn', 'I always feel anxious before exams.', 'Tôi luôn thấy lo lắng trước mỗi kỳ thi.', 'B1'],
      ['grateful', 'adj.', '/ˈɡreɪtfəl/', 'biết ơn', "I'm grateful for all your help.", 'Tôi rất biết ơn mọi sự giúp đỡ của bạn.', 'B1'],
      ['embarrassed', 'adj.', '/ɪmˈbærəst/', 'xấu hổ, ngượng', 'He was embarrassed when he forgot her name.', 'Anh ấy ngượng khi quên mất tên cô ấy.', 'B1'],
      ['exhausted', 'adj.', '/ɪɡˈzɔːstɪd/', 'kiệt sức', "I'm exhausted after the long flight.", 'Tôi kiệt sức sau chuyến bay dài.', 'B1'],
      ['confident', 'adj.', '/ˈkɑːnfɪdənt/', 'tự tin', 'She feels confident about her presentation.', 'Cô ấy thấy tự tin về bài thuyết trình của mình.', 'B1'],
      ['disappointed', 'adj.', '/ˌdɪsəˈpɔɪntɪd/', 'thất vọng', 'We were disappointed with the hotel.', 'Chúng tôi thất vọng về khách sạn đó.', 'B1'],
      ['jealous', 'adj.', '/ˈdʒeləs/', 'ghen tị', "He's jealous of his brother's success.", 'Anh ấy ghen tị với thành công của em trai.', 'B1'],
      ['relieved', 'adj.', '/rɪˈliːvd/', 'nhẹ nhõm', 'I was relieved to hear that she was safe.', 'Tôi thấy nhẹ nhõm khi biết cô ấy an toàn.', 'B1'],
      ['frustrated', 'adj.', '/ˈfrʌstreɪtɪd/', 'bực bội, nản lòng', 'I get frustrated when my computer is slow.', 'Tôi bực mình khi máy tính chạy chậm.', 'B1'],
      ['homesick', 'adj.', '/ˈhoʊmsɪk/', 'nhớ nhà', 'Students studying abroad often feel homesick.', 'Du học sinh thường cảm thấy nhớ nhà.', 'B1'],
      ['curious', 'adj.', '/ˈkjʊriəs/', 'tò mò', 'Children are naturally curious about the world.', 'Trẻ em vốn tò mò về thế giới xung quanh.', 'B1'],
      ['overwhelmed', 'adj.', '/ˌoʊvərˈwelmd/', 'choáng ngợp, quá tải', 'She felt overwhelmed by all the work.', 'Cô ấy thấy quá tải vì đống công việc.', 'B2']
    ],
    tech: [
      ['device', 'n.', '/dɪˈvaɪs/', 'thiết bị', 'Please turn off all electronic devices.', 'Vui lòng tắt mọi thiết bị điện tử.', 'B1'],
      ['download', 'v.', '/ˈdaʊnloʊd/', 'tải xuống', 'You can download the app for free.', 'Bạn có thể tải ứng dụng miễn phí.', 'A2'],
      ['password', 'n.', '/ˈpæswɜːrd/', 'mật khẩu', 'Never share your password with anyone.', 'Đừng bao giờ chia sẻ mật khẩu với ai.', 'A2'],
      ['update', 'v.', '/ʌpˈdeɪt/', 'cập nhật', 'Remember to update your phone regularly.', 'Nhớ cập nhật điện thoại thường xuyên.', 'B1'],
      ['screenshot', 'n.', '/ˈskriːnʃɑːt/', 'ảnh chụp màn hình', 'Send me a screenshot of the error.', 'Gửi cho tôi ảnh chụp màn hình lỗi đó.', 'B1'],
      ['storage', 'n.', '/ˈstɔːrɪdʒ/', 'bộ nhớ, dung lượng lưu trữ', 'My phone is running out of storage.', 'Điện thoại tôi sắp hết bộ nhớ.', 'B1'],
      ['wireless', 'adj.', '/ˈwaɪərləs/', 'không dây', 'These wireless earbuds are really comfortable.', 'Tai nghe không dây này đeo rất thoải mái.', 'B1'],
      ['install', 'v.', '/ɪnˈstɔːl/', 'cài đặt', 'It takes a few minutes to install the software.', 'Cài đặt phần mềm mất vài phút.', 'B1'],
      ['browser', 'n.', '/ˈbraʊzər/', 'trình duyệt', 'Open the link in your browser.', 'Mở đường link trong trình duyệt của bạn.', 'B1'],
      ['artificial intelligence', 'n.', '/ˌɑːrtɪfɪʃəl ɪnˈtelɪdʒəns/', 'trí tuệ nhân tạo', 'Artificial intelligence is changing how we work.', 'Trí tuệ nhân tạo đang thay đổi cách chúng ta làm việc.', 'B2'],
      ['reliable', 'adj.', '/rɪˈlaɪəbəl/', 'đáng tin cậy, ổn định', 'We need a reliable internet connection.', 'Chúng ta cần kết nối mạng ổn định.', 'B1'],
      ['backup', 'n.', '/ˈbækʌp/', 'bản sao lưu', 'Always keep a backup of your files.', 'Luôn giữ một bản sao lưu các tệp của bạn.', 'B2']
    ],
    health: [
      ['symptom', 'n.', '/ˈsɪmptəm/', 'triệu chứng', 'Fever is a common symptom of the flu.', 'Sốt là triệu chứng phổ biến của bệnh cúm.', 'B1'],
      ['prescription', 'n.', '/prɪˈskrɪpʃən/', 'đơn thuốc', 'You need a prescription for this medicine.', 'Bạn cần có đơn thuốc để mua loại thuốc này.', 'B1'],
      ['headache', 'n.', '/ˈhedeɪk/', 'chứng đau đầu', 'I have a terrible headache.', 'Tôi đau đầu kinh khủng.', 'A1'],
      ['recover', 'v.', '/rɪˈkʌvər/', 'hồi phục', 'It took him a month to recover from the surgery.', 'Anh ấy mất một tháng để hồi phục sau ca mổ.', 'B1'],
      ['nutrition', 'n.', '/nuːˈtrɪʃən/', 'dinh dưỡng', 'Good nutrition is important for children.', 'Dinh dưỡng tốt rất quan trọng với trẻ em.', 'B2'],
      ['injury', 'n.', '/ˈɪndʒəri/', 'chấn thương', 'He missed the match because of a knee injury.', 'Anh ấy lỡ trận đấu vì chấn thương đầu gối.', 'B1'],
      ['exercise', 'v.', '/ˈeksərsaɪz/', 'tập thể dục', 'People who exercise regularly usually sleep better.', 'Người tập thể dục đều đặn thường ngủ ngon hơn.', 'A2'],
      ['cough', 'n.', '/kɑːf/', 'cơn ho', 'Drink warm water with honey for your cough.', 'Uống nước ấm pha mật ong để đỡ ho.', 'A2'],
      ['allergic', 'adj.', '/əˈlɜːrdʒɪk/', 'bị dị ứng', "I'm allergic to seafood.", 'Tôi bị dị ứng hải sản.', 'B1'],
      ['stress', 'n.', '/stres/', 'sự căng thẳng', 'Too much stress can make you sick.', 'Căng thẳng quá mức có thể khiến bạn bị ốm.', 'B1'],
      ['balanced diet', 'n.', '/ˌbælənst ˈdaɪət/', 'chế độ ăn cân bằng', 'A balanced diet includes plenty of vegetables.', 'Chế độ ăn cân bằng có nhiều rau xanh.', 'B1'],
      ['insomnia', 'n.', '/ɪnˈsɑːmniə/', 'chứng mất ngủ', 'Drinking coffee late at night can cause insomnia.', 'Uống cà phê lúc khuya có thể gây mất ngủ.', 'C1']
    ],
    nature: [
      ['pollution', 'n.', '/pəˈluːʃən/', 'sự ô nhiễm', 'Air pollution is a serious problem in big cities.', 'Ô nhiễm không khí là vấn đề nghiêm trọng ở các thành phố lớn.', 'B1'],
      ['climate', 'n.', '/ˈklaɪmət/', 'khí hậu', 'The climate in Da Lat is cool all year round.', 'Khí hậu Đà Lạt mát mẻ quanh năm.', 'B1'],
      ['recycle', 'v.', '/ˌriːˈsaɪkəl/', 'tái chế', 'We recycle plastic bottles and paper.', 'Chúng tôi tái chế chai nhựa và giấy.', 'B1'],
      ['flood', 'n.', '/flʌd/', 'lũ lụt', 'The flood destroyed hundreds of homes.', 'Trận lũ đã phá hủy hàng trăm ngôi nhà.', 'B1'],
      ['wildlife', 'n.', '/ˈwaɪldlaɪf/', 'động vật hoang dã', 'The national park is home to a lot of wildlife.', 'Vườn quốc gia là nơi sinh sống của nhiều loài động vật hoang dã.', 'B1'],
      ['drought', 'n.', '/draʊt/', 'hạn hán', 'The Mekong Delta suffered a severe drought.', 'Đồng bằng sông Cửu Long chịu một đợt hạn hán nghiêm trọng.', 'B2'],
      ['renewable', 'adj.', '/rɪˈnuːəbəl/', 'có thể tái tạo', 'Solar power is a renewable energy source.', 'Điện mặt trời là một nguồn năng lượng tái tạo.', 'B2'],
      ['endangered', 'adj.', '/ɪnˈdeɪndʒərd/', 'có nguy cơ tuyệt chủng', 'The saola is an endangered species.', 'Sao la là loài có nguy cơ tuyệt chủng.', 'B2'],
      ['waste', 'n.', '/weɪst/', 'rác thải', 'Plastic waste is harming our oceans.', 'Rác thải nhựa đang hủy hoại đại dương.', 'B1'],
      ['forest', 'n.', '/ˈfɔːrɪst/', 'rừng', 'They are planting trees along the edge of the forest.', 'Họ đang trồng cây dọc bìa rừng.', 'A1'],
      ['global warming', 'n.', '/ˌɡloʊbəl ˈwɔːrmɪŋ/', 'sự nóng lên toàn cầu', 'Global warming is causing sea levels to rise.', 'Sự nóng lên toàn cầu khiến mực nước biển dâng cao.', 'B1'],
      ['protect', 'v.', '/prəˈtekt/', 'bảo vệ', 'We must protect the environment for future generations.', 'Chúng ta phải bảo vệ môi trường cho thế hệ mai sau.', 'A2']
    ],
    education: [
      ['assignment', 'n.', '/əˈsaɪnmənt/', 'bài tập được giao', 'I have to finish my assignment by tonight.', 'Tối nay tôi phải làm xong bài tập.', 'B1'],
      ['scholarship', 'n.', '/ˈskɑːlərʃɪp/', 'học bổng', 'She won a scholarship to study in Australia.', 'Cô ấy giành được học bổng du học Úc.', 'B1'],
      ['graduate', 'v.', '/ˈɡrædʒueɪt/', 'tốt nghiệp', 'He graduated from university last year.', 'Anh ấy tốt nghiệp đại học năm ngoái.', 'B1'],
      ['semester', 'n.', '/səˈmestər/', 'học kỳ', 'The new semester starts in September.', 'Học kỳ mới bắt đầu vào tháng Chín.', 'B1'],
      ['tuition', 'n.', '/tuˈɪʃən/', 'học phí', 'Tuition has gone up again this year.', 'Học phí năm nay lại tăng.', 'B2'],
      ['review', 'v.', '/rɪˈvjuː/', 'ôn tập, xem lại', "Let's review the new words from yesterday.", 'Mình cùng ôn lại những từ mới hôm qua nhé.', 'B1'],
      ['lecture', 'n.', '/ˈlektʃər/', 'bài giảng', 'The lecture was about Vietnamese history.', 'Bài giảng nói về lịch sử Việt Nam.', 'B1'],
      ['knowledge', 'n.', '/ˈnɑːlɪdʒ/', 'kiến thức', 'Reading helps you gain knowledge.', 'Đọc sách giúp bạn mở mang kiến thức.', 'B1'],
      ['fluent', 'adj.', '/ˈfluːənt/', 'lưu loát, trôi chảy', 'She is fluent in three languages.', 'Cô ấy nói thành thạo ba thứ tiếng.', 'B1'],
      ['vocabulary', 'n.', '/voʊˈkæbjəleri/', 'vốn từ vựng', 'Learning ten new words a day builds your vocabulary.', 'Học mười từ mới mỗi ngày giúp bạn tăng vốn từ.', 'B1'],
      ['pronunciation', 'n.', '/prəˌnʌnsiˈeɪʃən/', 'cách phát âm', 'Listening to podcasts can improve your pronunciation.', 'Nghe podcast có thể cải thiện phát âm của bạn.', 'B1'],
      ['certificate', 'n.', '/sərˈtɪfɪkət/', 'chứng chỉ', 'You need an IELTS certificate to apply.', 'Bạn cần chứng chỉ IELTS để nộp hồ sơ.', 'B1']
    ],
    academic: [
      ['significant', 'adj.', '/sɪɡˈnɪfɪkənt/', 'đáng kể', 'There has been a significant increase in prices.', 'Giá cả đã tăng đáng kể.', 'B2'],
      ['analyze', 'v.', '/ˈænəlaɪz/', 'phân tích', 'Scientists analyzed data from 2,000 patients.', 'Các nhà khoa học đã phân tích dữ liệu của 2.000 bệnh nhân.', 'B2'],
      ['evidence', 'n.', '/ˈevɪdəns/', 'bằng chứng', 'There is no evidence that the drug works.', 'Không có bằng chứng nào cho thấy loại thuốc đó có hiệu quả.', 'B1'],
      ['contribute', 'v.', '/kənˈtrɪbjuːt/', 'đóng góp, góp phần', 'Everyone can contribute to a cleaner city.', 'Ai cũng có thể góp phần làm thành phố sạch hơn.', 'B2'],
      ['consequence', 'n.', '/ˈkɑːnsəkwens/', 'hậu quả', 'Deforestation has serious consequences.', 'Phá rừng gây ra những hậu quả nghiêm trọng.', 'B2'],
      ['approach', 'n.', '/əˈproʊtʃ/', 'cách tiếp cận, phương pháp', 'We need a new approach to this problem.', 'Chúng ta cần một cách tiếp cận mới cho vấn đề này.', 'B2'],
      ['crucial', 'adj.', '/ˈkruːʃəl/', 'then chốt, cực kỳ quan trọng', 'Sleep is crucial for memory.', 'Giấc ngủ cực kỳ quan trọng đối với trí nhớ.', 'B2'],
      ['decline', 'v.', '/dɪˈklaɪn/', 'suy giảm', 'The number of visitors declined sharply in 2020.', 'Lượng du khách giảm mạnh vào năm 2020.', 'B2'],
      ['phenomenon', 'n.', '/fəˈnɑːmənɑːn/', 'hiện tượng', 'Climate change is a global phenomenon.', 'Biến đổi khí hậu là một hiện tượng toàn cầu.', 'C1'],
      ['hypothesis', 'n.', '/haɪˈpɑːθəsɪs/', 'giả thuyết', 'The experiment supported our hypothesis.', 'Thí nghiệm đã ủng hộ giả thuyết của chúng tôi.', 'C1'],
      ['sustainable', 'adj.', '/səˈsteɪnəbəl/', 'bền vững', 'We need a more sustainable way of living.', 'Chúng ta cần một lối sống bền vững hơn.', 'B2'],
      ['fluctuate', 'v.', '/ˈflʌktʃueɪt/', 'dao động, lên xuống thất thường', 'Oil prices fluctuate from month to month.', 'Giá dầu dao động theo từng tháng.', 'C1']
    ]
  };

  const words = [];
  for (const topic of topics) {
    for (const [word, pos, ipa, vi, ex, exVi, level] of raw[topic.id]) {
      words.push({ id: word.replace(/\s+/g, '-'), word, pos, ipa, vi, ex, exVi, level, topic: topic.id });
    }
  }

  window.VOCAB = { topics, words };
})();
