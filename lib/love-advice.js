import { createRng, pickRandom, pickUniqueN } from './hash.js';

const ADVICE = {
  high: [
    "Đừng để những lúc bận rộn làm quên đi những cử chỉ nhỏ — một tin nhắn buổi sáng hay câu hỏi thăm buổi tối đủ để giữ lửa.",
    "Hãy tạo ra những 'nghi lễ' riêng của hai người — dù nhỏ như cùng uống cà phê sáng hay kể chuyện trước khi ngủ.",
    "Thỉnh thoảng hãy làm điều gì đó bất ngờ — không cần to lớn, chỉ cần đủ để người kia biết bạn vẫn để ý.",
    "Học cách nói 'cảm ơn' với nhau cho những điều nhỏ bé — đó là thứ giữ tình yêu sống lâu hơn bất kỳ lời hứa nào.",
    "Đặt điện thoại xuống khi ở bên nhau. Sự hiện diện đầy đủ là món quà quý nhất bạn có thể trao.",
    "Hãy nói thẳng những gì bạn cần thay vì chờ người kia đoán — tình yêu không có chức năng đọc suy nghĩ.",
    "Dành riêng ít nhất một buổi mỗi tuần chỉ để ở cạnh nhau không làm gì — đôi khi bình yên mới là đỉnh cao.",
  ],
  mid: [
    "Đừng tích lũy những khó chịu nhỏ — giải quyết sớm, trước khi chúng thành tường ngăn cách.",
    "Hãy lắng nghe để hiểu, không phải lắng nghe để trả lời — đó là kỹ năng hiếm và đáng giá.",
    "Thử chia sẻ một sở thích của người kia, dù bạn chưa chắc thích — đôi khi tình yêu nằm ở việc thử thôi.",
    "Mỗi khi xảy ra bất đồng, hãy nhớ bạn đang giải quyết vấn đề cùng nhau — không phải chống lại nhau.",
    "Khen ngợi nhau nhiều hơn bạn nghĩ là cần thiết — con người không bao giờ nghe đủ những điều tốt về mình.",
    "Hãy thành thật về kỳ vọng của bạn ngay từ đầu — hiểu lầm thường đến từ những điều chưa được nói.",
  ],
  low: [
    "Dành thời gian để thực sự biết nhau trước khi vội kết luận — những lớp sâu hơn luôn đáng để khám phá.",
    "Đừng so sánh mối quan hệ này với những gì bạn đã trải qua — mỗi người là một câu chuyện hoàn toàn mới.",
    "Hãy trung thực với bản thân: bạn đang tìm kiếm điều gì, và người kia có thể cho bạn điều đó không?",
    "Áp lực làm mọi thứ chậm lại — hãy để mọi thứ diễn ra tự nhiên thay vì cố đẩy nhanh hay kéo dài.",
    "Hai người cần thời gian để đồng điệu — đừng mong ngay ngày đầu đã hiểu hết nhau.",
  ],
};

const ADVICE_FUNNY = {
  high: [
    "Vẫn nhớ ngày sinh nhật người ta chứ? Nếu chưa lưu vào điện thoại thì làm ngay đi.",
    "Thỉnh thoảng nhường người ta cái đùi gà — tình yêu đôi khi chỉ đơn giản vậy thôi.",
    "Đừng để người ta đoán bạn đang giận — nói thẳng ra đi, không ai có thần giao cách cảm đâu.",
    "Hãy thỉnh thoảng tắt chế độ 'chuyên gia phân tích' và chỉ đơn giản là ôm người ta thôi.",
    "Nhớ rằng 'tôi đúng' và 'chúng ta hạnh phúc' đôi khi không thể cùng tồn tại — chọn cái nào quan trọng hơn nhé.",
  ],
  mid: [
    "Bớt đăng story, tăng tin nhắn thật sự cho người ta đi.",
    "Gặp nhau rồi nhìn điện thoại là tội ác — trừ khi đang chụp ảnh cùng nhau.",
    "Đừng 'seen' rồi không trả lời — tim người ta chứ không phải đá.",
    "Thử một lần chủ động thay vì chờ người kia — không chừng họ cũng đang chờ bạn đấy.",
  ],
  low: [
    "Chưa biết nhau thì đừng vội — Rome không xây trong một ngày, tình yêu cũng không.",
    "Nhắn tin trước khi mong người ta nhắn lại — mối quan hệ không phải trò đấu ngu ai trả lời trước.",
    "Nếu bạn không chắc người ta thích mình không, cứ hỏi thẳng đi — người lớn rồi mà.",
  ],
};

const ADVICE_SERIOUS = {
  high: [
    "Xây dựng nền tảng tin tưởng qua hành động nhất quán, không phải lời hứa. Sự đáng tin cậy tích lũy theo thời gian.",
    "Thiết lập ranh giới lành mạnh từ sớm — hai người có không gian cá nhân sẽ trân trọng thời gian chung hơn.",
    "Thảo luận về định hướng tương lai để đảm bảo hai người đang đi cùng một hướng về những điều quan trọng.",
    "Phát triển ngôn ngữ tình yêu của nhau: không phải ai cũng cảm nhận tình cảm theo cùng một cách.",
    "Đối mặt với xung đột sớm và thẳng thắn — những vấn đề bị né tránh không biến mất, chúng tích lũy lại.",
  ],
  mid: [
    "Đánh giá lại kỳ vọng: những gì bạn muốn từ mối quan hệ này có thực tế và công bằng không?",
    "Giao tiếp về nhu cầu cảm xúc một cách trực tiếp — không thể yêu cầu ai đó đáp ứng điều họ không biết bạn cần.",
    "Chú ý đến pattern trong xung đột: nếu cùng một vấn đề lặp lại, đó là dấu hiệu cần giải quyết tận gốc.",
  ],
  low: [
    "Hãy tự hỏi: bạn thích người này vì họ là ai, hay vì cảm giác được yêu thích mà họ mang lại?",
    "Đừng lý tưởng hóa người kia — hiểu họ thực sự là ai, kể cả điểm chưa hoàn hảo, trước khi đầu tư cảm xúc.",
    "Mối quan hệ cần hai người cùng muốn — hãy đảm bảo nỗ lực là hai chiều trước khi đi tiếp.",
  ],
};

export function generateAdvice(personA, personB, analysis, tone = 'tho-mong') {
  const rng = createRng(analysis.seed + 54321);

  let pool;
  if (tone === 'hai-huoc') {
    pool = analysis.score >= 60 ? ADVICE_FUNNY.high
         : analysis.score >= 40 ? ADVICE_FUNNY.mid
         : ADVICE_FUNNY.low;
  } else if (tone === 'nghiem-tuc') {
    pool = analysis.score >= 60 ? ADVICE_SERIOUS.high
         : analysis.score >= 40 ? ADVICE_SERIOUS.mid
         : ADVICE_SERIOUS.low;
  } else {
    pool = analysis.score >= 60 ? ADVICE.high
         : analysis.score >= 40 ? ADVICE.mid
         : ADVICE.low;
  }

  return pickUniqueN(pool, Math.min(3, pool.length), rng);
}
