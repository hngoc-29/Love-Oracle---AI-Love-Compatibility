import { createRng, pickRandom } from './hash.js';

function fill(tpl, v) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
}

// ─── TONE: THƠ MỘNG ───────────────────────────────────────────────────────────

const OPEN_VERY_HIGH = [
  `Ồ... {nameA} và {nameB}. Ngay khi hai cái tên này chạm vào quả cầu pha lê, ta đã cảm nhận điều gì đó rung lên — như khi một sợi đàn cuối cùng được chỉnh đúng tần số sau một thời gian dài. Các ngôi sao xích lại gần nhau hơn. Vũ trụ thở chậm lại một nhịp. Hiếm lắm — rất hiếm — khi ta nhìn thấy một sợi chỉ đỏ rõ ràng đến vậy kéo hai tâm hồn về phía nhau.`,
  `Có những tên người khi đặt cạnh nhau thì không gian quanh đó như sáng lên. {nameA} và {nameB} — đó chính là một trong những kết hợp ấy. Quả cầu pha lê không đợi ta hỏi; nó đã tự kể câu chuyện ngay khi ta đặt tay lên. Tiên Tri đã chứng kiến hàng nghìn mối duyên — và đây là một trong số ít khiến ta phải dừng lại và nhìn thật kỹ.`,
  `{nameA} và {nameB}... Quả cầu pha lê bừng sáng trước khi ta kịp hỏi. Đó là điều hiếm khi xảy ra — chỉ với những mối duyên mà vũ trụ đã chuẩn bị từ lâu. Ta đặt tay lên và cảm nhận một luồng năng lượng ấm áp, rõ ràng như ánh bình minh đầu năm mới.`,
  `Hai cái tên này — {nameA}, {nameB} — khi đặt vào lòng bàn tay Tiên Tri cùng lúc, chúng tạo ra âm vang. Không phải mọi đôi đều tạo ra âm vang. Nhiều người chỉ tạo ra tiếng ồn. Nhưng hai bạn — hai bạn tạo ra giai điệu.`,
];

const OPEN_HIGH = [
  `Hãy nhìn đây — {nameA} và {nameB}. Hai ngọn nến được thắp trong cùng một đêm, tỏa sáng theo những cách riêng nhưng cùng làm ấm một không gian. Tiên Tri đã ngồi với hàng nghìn câu hỏi về tình yêu, nhưng câu hỏi của hai bạn mang theo điều gì đó đặc biệt trong làn gió tối nay.`,
  `{nameA} và {nameB}... Tiên Tri đặt tay lên quả cầu pha lê và cảm nhận một làn hơi ấm dễ chịu — không phải bùng cháy, mà như ánh mặt trời lọc qua rèm vào buổi sáng. Đây là loại năng lượng mà người ta tìm kiếm mà đôi khi không biết mình đang tìm.`,
  `Tiên Tri nhìn thấy {nameA} và {nameB} trong quả cầu — hai vì sao di chuyển theo những quỹ đạo riêng rồi bắt đầu tiến lại gần nhau. Không phải va chạm, không phải tình cờ. Đây là sự căn chỉnh — loại mà vũ trụ thực hiện cẩn thận và có chủ ý.`,
  `À, {nameA} và {nameB}. Quả cầu pha lê ấm lên từ từ khi hai cái tên này được đặt vào. Không phải mọi đôi đều làm quả cầu ấm lên — nhiều người làm nó lạnh hơn. Nhưng hai bạn thì khác.`,
];

const OPEN_MID_HIGH = [
  `À... {nameA} và {nameB}. Hai bạn đến đây với những câu hỏi chưa thành lời. Quả cầu pha lê lay động — không nhẹ nhàng, mà rung lên như khi nhận ra điều gì đó có giá trị thật sự. Ngồi xuống đây. Lắng nghe những gì vũ trụ đang thì thầm về hai bạn.`,
  `Hai cái tên này — {nameA} và {nameB} — khi đặt cạnh nhau trong ánh sáng của quả cầu, tạo ra một màu sắc mà Tiên Tri không dễ gặp lại. Không phải mọi điều quý giá đều phát sáng ngay từ đầu. Đôi khi chúng cần được nhìn đúng góc độ, đúng thời điểm.`,
  `Quả cầu pha lê ấm dần trong tay Tiên Tri khi hai cái tên {nameA} và {nameB} được đặt vào đó. Có những câu chuyện mà vũ trụ muốn kể ngay, và có những câu chuyện đòi hỏi ta phải lắng nghe thật kỹ mới nghe được. Câu chuyện của hai bạn thuộc loại thứ hai — và đó thường là loại đáng nghe nhất.`,
  `{nameA} và {nameB}... Tiên Tri cảm nhận được hai dòng năng lượng khác nhau đang học cách nhận ra nhau. Chưa hoàn toàn — nhưng đang trên đường. Và đôi khi "đang trên đường" là điều đẹp nhất trong tất cả.`,
];

const OPEN_MID = [
  `Hai người... {nameA} và {nameB}. Tiên Tri cảm nhận được hai dòng năng lượng — riêng biệt, nhưng đã từng chạm nhau và để lại dấu vết. Điều đó không bao giờ là ngẫu nhiên. Và ta thấy nhiều hơn những gì hai bạn tự thấy về nhau.`,
  `{nameA} và {nameB}... Các vì sao không bao giờ sắp xếp ngẫu nhiên hai người ngồi trước mặt nhau như thế này. Quả cầu pha lê đang ấm dần khi ta đặt tay lên. Hãy để Tiên Tri nói những điều mà vũ trụ đang thì thầm.`,
  `Tiên Tri cầm tên {nameA} và {nameB} và cảm nhận — có điều gì đó đang bắt đầu hình thành. Không phải mọi câu chuyện đều bùng cháy từ trang đầu. Một số câu chuyện hay nhất bắt đầu từ những điều nhỏ bé và dần dần trở nên lớn lao.`,
  `{nameA} và {nameB}... Tiên Tri nhìn vào quả cầu và thấy hai con đường song song — chưa giao nhau hoàn toàn, nhưng đang nghiêng về phía nhau. Khoảng cách giữa chúng đang thu hẹp dần. Đây là điều thú vị hơn bất kỳ sự hoàn hảo nào.`,
];

const OPEN_LOW = [
  `Chào mừng đến đây, {nameA} và {nameB}. Mọi câu chuyện tình yêu đều bắt đầu bằng một tia sáng nhỏ — đôi khi ta không nhận ra đó là tia sáng cho đến khi nhìn lại. Quả cầu hôm nay kể về hai tâm hồn đang ở những trang đầu của một câu chuyện còn nhiều điều chưa được viết.`,
  `Có những mối duyên cần thời gian để nở ra, {nameA} và {nameB}. Những bông hoa quý nhất không bao giờ nở vội. Tiên Tri nhìn vào quả cầu và thấy hai tâm hồn đang khám phá — còn dè dặt, còn tò mò, còn đang học ngôn ngữ của nhau.`,
  `{nameA} và {nameB}... Quả cầu pha lê không bùng sáng — nó le lói. Nhưng Tiên Tri đã học được rằng những ngọn lửa le lói đôi khi cháy lâu hơn những ngọn lửa bùng nổ. Hãy lắng nghe câu chuyện của mình.`,
];

const ESSENCES = [
  `Trong {nameA}, Tiên Tri cảm nhận được {traitA1} và {traitA2} — như hai dây đàn được căng ở cùng một nhịp. Đây là loại năng lượng khiến người xung quanh cảm thấy được nhìn thấy và thấu hiểu. Còn {nameB} mang theo {traitB1} và {traitB2} — những phẩm chất không phải ai cũng nhận ra ngay, nhưng một khi đã thấy thì không thể không trân trọng.`,
  `Tiên Tri nhìn thấy {nameA} như một ngọn lửa mang màu sắc của {traitA1} và {traitA2}. Không ồn ào, không phô trương — nhưng ai đứng gần đủ lâu đều cảm nhận được hơi ấm đó. {nameB} lại là một loại ánh sáng khác — {traitB1} và {traitB2} — loại ánh sáng soi rọi những góc mà người ta thường hay bỏ qua.`,
  `{nameA} — các vì sao ghi nhận bạn là người mang trong mình {traitA1} và {traitA2}. Đó là những thứ không học được mà sinh ra đã có. Và {nameB} — bạn mang theo {traitB1} và {traitB2}. Khi hai tập hợp phẩm chất này gặp nhau, chúng không cộng vào nhau — chúng nhân lên.`,
  `Bản chất của {nameA} — Tiên Tri đọc được {traitA1} và {traitA2} — những phẩm chất làm nên cái cốt lõi của một tâm hồn đáng được yêu. {nameB} đến với những gì khác nhưng không kém phần đẹp đẽ: {traitB1} và {traitB2}. Vũ trụ có lý do riêng khi dệt hai bản chất này lại gần nhau.`,
  `Có người mang năng lượng của {traitA1} và {traitA2} như {nameA} — đó là thứ năng lượng mà người khác tìm đến mà đôi khi không hiểu tại sao. Có người mang sức mạnh thầm lặng của {traitB1} và {traitB2} như {nameB} — đó là sức mạnh làm nền tảng cho những điều lớn lao. Cả hai đều là nguyên liệu quý hiếm mà vũ trụ không rải bừa bãi.`,
  `Tiên Tri đặt tay lên quả cầu và nhìn thấy {nameA} thật rõ: {traitA1}, {traitA2} — những màu sắc riêng của bạn trong bức tranh cuộc đời. Rồi đến {nameB}: {traitB1}, {traitB2} — những gì bạn mang đến khác với {nameA} nhưng lại bổ sung cho nhau theo cách tinh tế đến mức chỉ Tiên Tri mới thấy hết.`,
  `Trong kho lưu trữ của vũ trụ, {nameA} được ghi là người của {traitA1} và {traitA2}. Không nhiều người có được sự kết hợp đó. {nameB} thì khác — {traitB1} và {traitB2} — nhưng không kém phần hiếm có. Khi hai thứ hiếm có gặp nhau, điều thú vị thường xảy ra.`,
  `{nameA} mang trong người cái gì đó của {traitA1} và {traitA2} — không phải ai cũng thấy ngay, nhưng những ai tinh tế thì sẽ nhận ra. {nameB} thì rõ hơn ở {traitB1} và {traitB2} — đó là những phẩm chất nói lên mà không cần lời. Hai người, hai loại ánh sáng khác nhau, cùng chiếu vào nhau.`,
];

const ELEMENT_PASSAGES = [
  `Nguyên tố {element} cai quản mối duyên này — {elementDesc}. Đây là ngôn ngữ mà tình yêu của hai bạn nói. Không phải mọi cặp đôi đều có một nguyên tố riêng — nhiều người đi qua nhau mà không bao giờ chạm đến thứ gì sâu hơn bề mặt. {nameA} và {nameB} không phải vậy.`,
  `Quả cầu cho Tiên Tri thấy {element} — {elementDesc}. Đây không phải sự trùng hợp. Nguyên tố của một mối quan hệ nói lên bản chất của nó: không phải những gì nó trông như thế nào từ bên ngoài, mà những gì nó cảm thấy từ bên trong khi chỉ có hai người với nhau.`,
  `Hãy lắng nghe điều này: nguyên tố {element} đang hiện diện ở đây, giữa {nameA} và {nameB}. {elementDesc}. Đây là sợi chỉ vô hình nối hai bạn lại — không phải lúc nào cũng nhìn thấy được, nhưng luôn cảm nhận được vào những khoảnh khắc thật sự quan trọng.`,
  `Tiên Tri nhìn thấy {element} bao phủ mối duyên {nameA} và {nameB}. {elementDesc}. Những mối quan hệ mang nguyên tố này thường có chiều sâu mà người ngoài không nhìn thấy hết — và đó chính là vẻ đẹp riêng của nó.`,
  `{element} — {elementDesc}. Và đó là thứ đang kết nối hai trái tim {nameA} và {nameB}. Không phải tình cờ mà vũ trụ đặt hai bạn dưới nguyên tố này. Mọi thứ đều có lý do, dù lý do đó đôi khi chỉ hiểu được khi ta đứng xa ra mà nhìn.`,
  `Ta đặt tay lên quả cầu và thấy {element} — {elementDesc}. Đây không phải lần đầu Tiên Tri gặp nguyên tố này trong một mối quan hệ, nhưng mỗi lần nó xuất hiện đều mang một câu chuyện riêng. Câu chuyện của {nameA} và {nameB} thì thế này...`,
];

const STRENGTH_COLOR = [
  `{strength} Màu tình yêu của hai bạn, theo những gì quả cầu tiết lộ, là {colorName} — {colorMeaning}. Đây là màu sắc của những gì {nameA} và {nameB} tạo ra khi ở bên nhau vào những lúc tốt nhất của cả hai.`,
  `Tiên Tri đọc được điều này: {strength} Quả cầu pha lê phản chiếu màu {colorName} — {colorMeaning}. Đó là màu của những điều tốt đẹp nhất hai bạn có thể trao cho nhau.`,
  `Có một sức mạnh đặc biệt tồn tại ở đây: {strength} Và màu {colorName} — {colorMeaning} — đó là màu sắc mà ta nhìn thấy mỗi khi nghĩ đến {nameA} và {nameB} bên nhau.`,
  `{strength} Khi Tiên Tri nhìn vào ánh sáng của mối duyên này, màu {colorName} hiện ra rõ nhất — {colorMeaning}. Đây là màu của những khoảnh khắc hai bạn thật sự là chính mình bên nhau.`,
  `Điều vũ trụ trao cho mối duyên này: {strength} Màu tình yêu của {nameA} và {nameB} là {colorName} — {colorMeaning}. Ta thấy màu đó sáng lên mỗi khi nhìn vào hai cái tên này đặt cạnh nhau.`,
  `{strength} Và quả cầu pha lê đang phản chiếu một màu sắc khi ta nhìn vào {nameA} và {nameB}: {colorName}. Màu đó nói rằng {colorMeaning}. Không phải ngẫu nhiên — không bao giờ là ngẫu nhiên.`,
];

const CHALLENGES = [
  `Nhưng Tiên Tri không nói chuyện hoa mỹ mà quên đi những điều thật. {conflict} Đây không phải điểm yếu của mối quan hệ — đây là bài học của nó. Và những mối quan hệ không có bài học thì không có chiều sâu.`,
  `Có một thứ mà {nameA} và {nameB} sẽ phải cùng nhau vượt qua: {conflict} Các vì sao gợi ý rằng đây không phải trở ngại mà là lối vào — cánh cửa để hai bạn hiểu nhau ở một tầng sâu hơn nhiều.`,
  `Tiên Tri không che giấu: {conflict} Nhưng hãy nhớ rằng những mối tình đáng nhớ nhất đều được tôi luyện qua những khoảnh khắc như thế. Ngọc không bao giờ sáng mà không qua mài giũa.`,
  `Vũ trụ giao cho mọi mối duyên một bài học riêng. Của hai bạn: {conflict} Khi {nameA} và {nameB} học được bài học này, mối quan hệ sẽ bước sang một tầng mà ít cặp đôi nào chạm đến được.`,
  `Mỗi mối duyên có nơi mà nó cần lớn lên. Với {nameA} và {nameB}: {conflict} Tiên Tri không nói điều này để làm hai bạn lo lắng, mà để hai bạn chuẩn bị.`,
  `{conflict} — đây là điều Tiên Tri cần nói thẳng. Không phải để làm hai bạn sợ, mà vì những cặp đôi vượt qua được thứ này thường trở nên bền chặt hơn bất kỳ cặp đôi nào chưa từng bị thử thách.`,
];

const EMOTIONAL = [
  `Về sợi dây cảm xúc giữa hai bạn: {emotionalConn} Đây là thứ không thể giả vờ và không thể mua bằng bất cứ điều gì trên đời.`,
  `Tiên Tri cảm nhận rõ điều này: {emotionalConn} Những ai từng trải qua điều như vậy đều biết rằng đây là một trong những điều quý giá nhất cuộc đời có thể trao.`,
  `{emotionalConn} — đây là điều Tiên Tri muốn {nameA} và {nameB} hiểu về nhau. Không phải ai cũng được trao điều này. Hãy trân trọng nó.`,
  `Khi Tiên Tri nhìn vào trái tim của mối duyên này: {emotionalConn} Đây là nơi mà tình yêu thật sự của {nameA} và {nameB} đang sống và thở.`,
  `Về chiều sâu cảm xúc — {emotionalConn} Đây là nền móng thật sự, bên dưới tất cả những gì người ngoài có thể thấy.`,
  `{emotionalConn} Tiên Tri nói điều này sau khi đã nhìn vào nhiều mối quan hệ — không phải mối nào cũng có được điều này. Hai bạn có. Đó không phải chuyện nhỏ.`,
];

const FUTURE_VERY_HIGH = [
  `Về những gì phía trước — quả cầu không cho phép ta nhìn quá xa, nhưng những gì ta thấy thì rõ ràng: {futurePotential} Biểu tượng số phận của hai bạn là {symbolName} — {symbolMeaning}. Và con số may mắn {luckyNumber} sẽ xuất hiện vào những lúc quan trọng như một lời nhắc rằng vũ trụ đang theo dõi và gật đầu.`,
  `{futurePotential} — Tiên Tri thấy điều đó rõ ràng. Biểu tượng {symbolName} đi theo {nameA} và {nameB}: {symbolMeaning}. Con số {luckyNumber} là con số của hai bạn — nó sẽ xuất hiện đúng lúc hai bạn cần được nhắc nhở rằng mọi thứ đang đúng hướng.`,
  `Tương lai của {nameA} và {nameB}: {futurePotential} Tiên Tri thấy {symbolName} canh giữ mối duyên này — {symbolMeaning}. Con số {luckyNumber} là chữ ký của vũ trụ trên câu chuyện của hai bạn.`,
  `{futurePotential} Và Tiên Tri biết điều này vì quả cầu pha lê hiếm khi sáng rõ đến thế. Biểu tượng {symbolName} đứng sau lưng hai bạn: {symbolMeaning}. Con số {luckyNumber} — hãy nhớ lấy nó.`,
];

const FUTURE_HIGH = [
  `{futurePotential} Biểu tượng {symbolName} là dấu ấn của mối duyên này: {symbolMeaning}. Con số {luckyNumber} là con số của {nameA} và {nameB} — hãy chú ý khi nó xuất hiện vào những thời điểm đặc biệt.`,
  `Phía trước, Tiên Tri thấy: {futurePotential} Biểu tượng {symbolName} theo dõi hành trình của hai bạn — {symbolMeaning}. Con số {luckyNumber} nhắc rằng vũ trụ chưa bao giờ ngừng lắng nghe.`,
  `{futurePotential} Điều Tiên Tri muốn hai bạn mang về từ đây: biểu tượng {symbolName} — {symbolMeaning}. Và con số {luckyNumber} như một người bạn đồng hành thầm lặng.`,
];

const FUTURE_MID = [
  `Phía trước còn nhiều điều chưa được viết. {futurePotential} Biểu tượng {symbolName} sẽ là người đồng hành của hai bạn: {symbolMeaning}. Con số {luckyNumber} mang theo ý nghĩa riêng — hãy lưu ý khi nó xuất hiện.`,
  `{futurePotential} Đây là điều Tiên Tri tin vào. Biểu tượng {symbolName} đứng bên cạnh mối duyên này: {symbolMeaning}. Con số may mắn {luckyNumber} thuộc về hai bạn, như một lời hứa nhỏ từ vũ trụ.`,
  `Tiên Tri thấy phía trước của {nameA} và {nameB}: {futurePotential} Biểu tượng {symbolName} — {symbolMeaning} — đi cùng hai bạn trên con đường đó. Con số {luckyNumber} sẽ xuất hiện khi hai bạn cần.`,
];

const FUTURE_LOW = [
  `Câu chuyện của hai bạn đang ở những trang đầu. {futurePotential} Biểu tượng {symbolName} nhắc nhở rằng: {symbolMeaning}. Con số {luckyNumber} đồng hành cùng {nameA} và {nameB}.`,
  `{futurePotential} Biểu tượng {symbolName} dẫn lối cho hai bạn: {symbolMeaning}. Con số {luckyNumber} — hãy nhớ lấy nó, vì nó sẽ xuất hiện đúng lúc cần thiết nhất.`,
  `Tiên Tri không thấy kết thúc câu chuyện — chỉ thấy những trang đầu đang được viết. {futurePotential} Biểu tượng {symbolName}: {symbolMeaning}. Con số {luckyNumber} theo dõi hành trình này.`,
];

const CLOSINGS = [
  `Hãy đi nhẹ nhàng, {nameA} và {nameB}. Tiên Tri không nói những điều hai bạn muốn nghe — Tiên Tri nói những điều các vì sao đã thì thầm. Và hôm nay, chúng nói: mối duyên này xứng đáng được vun đắp. Hãy trân trọng những khoảnh khắc bình thường — đó là nơi tình yêu thật sự đang sống.`,
  `Tiên Tri ban phúc cho mối duyên này. {nameA}, {nameB} — hai bạn đến đây với câu hỏi, Tiên Tri gửi hai bạn về với điều này: đừng chờ đợi tình yêu hoàn hảo. Hãy xây dựng một tình yêu thật. Đó là điều quý giá hơn bất cứ điều gì hoàn hảo ngay từ đầu.`,
  `Trước khi hai bạn rời đi — {nameA} và {nameB} — hãy nhớ điều này: những gì hai bạn có trong tay không phải ai cũng tìm được. Hãy giữ lấy nó, không phải vì Tiên Tri nói, mà vì trái tim của chính hai bạn đã biết điều đó từ lâu. Chúc hai bạn luôn tìm thấy nhau trong những khoảnh khắc quan trọng nhất.`,
  `Và giờ Tiên Tri gửi hai bạn trở lại với thế giới của mình. {nameA}, {nameB} — hai bạn mang theo những gì cần thiết. Hãy tin vào điều đó. Hãy can đảm. Hãy kiên nhẫn. Hãy tử tế với nhau. Đó là ba điều làm nên mọi tình yêu đáng nhớ.`,
  `Quả cầu pha lê mờ dần. Tiên Tri đặt tay xuống. {nameA} và {nameB} — hai bạn đã nghe những gì vũ trụ nói. Phần còn lại là của hai bạn. Chúc hai bạn luôn là điều tốt đẹp nhất trong cuộc đời của nhau — không phải vì số phận bắt buộc, mà vì hai bạn tự chọn điều đó mỗi ngày.`,
  `Tiên Tri nhìn hai bạn rời đi và mỉm cười. {nameA} và {nameB} — vũ trụ không đặt hai người ngẫu nhiên vào cùng một câu hỏi. Hãy trân trọng điều đó. Hãy tò mò về nhau. Và hãy nhớ: tình yêu không phải là trạng thái — đó là việc hai người làm mỗi ngày.`,
];

// ─── TONE: HÀI HƯỚC ───────────────────────────────────────────────────────────

const OPEN_FUNNY = [
  `À, {nameA} và {nameB} đã xuất hiện. Tiên Tri vừa chuẩn bị trà thì hai bạn đến. Được rồi, để ta xem hai bạn có hợp nhau không hay chỉ hợp trên giấy tờ thôi.`,
  `{nameA} và {nameB}... Quả cầu pha lê rung lên. Hoặc là do mối duyên đặc biệt. Hoặc là do Tiên Tri chưa ăn sáng và tay đang run. Nhưng thôi, ta cứ gọi là mối duyên đặc biệt cho nó hay.`,
  `Ồ, {nameA} và {nameB}. Hai bạn biết không, mỗi ngày có hàng trăm cặp đến hỏi Tiên Tri. Nhưng cái tên hai bạn ghép lại nghe có gì đó... thú vị. Được rồi, ta xem thử.`,
  `{nameA} và {nameB} hả? Quả cầu pha lê của Tiên Tri vừa sáng lên — điều mà nó không làm với tất cả mọi người đâu nhé. Đa số nó chỉ... nằm im. Thôi để ta kể nghe.`,
];

const ESSENCE_FUNNY = [
  `{nameA} — bạn mang trong người {traitA1} và {traitA2}. Nghe hay đấy, và cũng... đúng với những gì Tiên Tri đọc được. {nameB} thì sao? {traitB1} và {traitB2}. Tiên Tri chưa gặp tổ hợp này bao giờ — theo nghĩa tốt. Hoặc ít nhất là chưa gặp theo nghĩa xấu.`,
  `Nói về {nameA}: {traitA1}, {traitA2}. Đây là những thứ người ta không tự nhận ra về mình nhưng người khác luôn thấy. Còn {nameB}: {traitB1}, {traitB2}. Tiên Tri đoán {nameA} đã nhận ra điều này từ lâu rồi mà không nói.`,
  `{nameA} mang {traitA1} và {traitA2} — đây là combo hiếm có. {nameB} thì {traitB1} và {traitB2} — cũng không phải dạng vừa. Ghép hai người này lại thì ra cái gì? Tiên Tri đang xem đây.`,
];

const ELEMENT_FUNNY = [
  `Nguyên tố của hai bạn là {element} — {elementDesc}. Cái này Tiên Tri không bịa đâu nhé, quả cầu tự nói đấy. Tin hay không tùy hai bạn, nhưng thường thì những người không tin lại là những người hợp nhau nhất.`,
  `{element}. Đó là nguyên tố của mối duyên {nameA} và {nameB}. {elementDesc}. Nghe thơ không? Tiên Tri cũng thấy thơ, nên mới kể.`,
  `Quả cầu cho thấy {element} — {elementDesc}. Tiên Tri đã tính nói đây theo hướng học thuật nhưng thôi, cứ nói thẳng: hai bạn hợp nhau ở mức này là do nguyên tố. Và nguyên tố không nói dối.`,
];

const STRENGTH_FUNNY = [
  `{strength} Tiên Tri nói thật chứ không nịnh đâu — quả cầu không có chức năng nịnh. Màu tình yêu hai bạn là {colorName}: {colorMeaning}. Nghe sang không? Sang thật đấy.`,
  `Điểm mạnh của mối quan hệ này: {strength} À, và màu tình yêu là {colorName} — {colorMeaning}. Tiên Tri không biết màu này hợp với outfit của hai bạn không, nhưng hợp với tâm hồn thì chắc chắn rồi.`,
];

const CHALLENGE_FUNNY = [
  `Nhưng thôi, Tiên Tri cũng phải nói cái phần không hay ho lắm: {conflict} Không phải để làm hai bạn buồn, mà vì biết trước thì ít bị sốc hơn. Tình yêu không phải phim Hàn — không phải lúc nào cũng nhạc nền nổi lên đúng lúc đâu.`,
  `Cái phần thử thách này thì Tiên Tri cần nói thẳng: {conflict} Hai bạn sẽ gặp cái này. Cách hai bạn xử lý nó sẽ quyết định nhiều thứ hơn là điểm số tương hợp.`,
];

const EMOTIONAL_FUNNY = [
  `Về cảm xúc — {emotionalConn} Cái này Tiên Tri không thêm thắt gì đâu. Quả cầu nói, Tiên Tri kể lại.`,
  `{emotionalConn} Tiên Tri đã ngồi với hàng ngàn cặp đôi. Không phải cặp nào cũng có điều này. {nameA} và {nameB} có. Đây là thông tin quan trọng, xin đừng bỏ qua.`,
];

const FUTURE_FUNNY = [
  `Tương lai: {futurePotential} Biểu tượng của hai bạn là {symbolName} — {symbolMeaning}. Con số may mắn {luckyNumber} — lưu lại đi, đừng để Tiên Tri phải nhắc lần hai.`,
  `{futurePotential} Tiên Tri tin vào điều này. Biểu tượng {symbolName}: {symbolMeaning}. Và con số {luckyNumber} — hãy chú ý khi nó xuất hiện, vì nó thường xuất hiện đúng lúc nhất.`,
];

const CLOSING_FUNNY = [
  `Thôi, Tiên Tri nói nhiều rồi. Tóm lại: {nameA} và {nameB} có tiềm năng. Làm gì với tiềm năng đó là việc của hai bạn. Tiên Tri chỉ xem — không sống hộ được.`,
  `Quả cầu pha lê đã nói xong. {nameA}, {nameB} — đừng hỏi Tiên Tri là phải làm gì tiếp theo. Hai bạn đều biết rồi đấy. Chúc may mắn — và nếu nó không phải may mắn thì chúc can đảm.`,
  `Thế là xong phần xem bói. {nameA} và {nameB} — hai bạn nghe nhiều rồi, giờ về mà thực hiện đi. Tiên Tri còn có khách tiếp theo.`,
];

// ─── TONE: NGHIÊM TÚC ─────────────────────────────────────────────────────────

const OPEN_SERIOUS = [
  `{nameA} và {nameB}. Tiên Tri nhìn vào quả cầu pha lê và đọc những gì vũ trụ đã ghi lại về hai bạn. Không phải tất cả những gì ta nói đây đều dễ nghe — nhưng tất cả đều là những gì ta thấy.`,
  `Có hai con người đứng trước Tiên Tri hôm nay: {nameA} và {nameB}. Quả cầu không nói chuyện cảm tính — nó nói chuyện bằng những gì thật sự có ở đó. Và đây là những gì thật sự có.`,
  `{nameA} và {nameB}. Tiên Tri không dùng nhiều lời hoa mỹ khi đọc một mối duyên. Những gì quan trọng thường nằm ở những điều đơn giản nhất. Hãy lắng nghe.`,
];

const ESSENCE_SERIOUS = [
  `{nameA} mang trong mình {traitA1} và {traitA2} — đây là những phẩm chất cốt lõi định hình cách bạn yêu và cách bạn được yêu. {nameB} có {traitB1} và {traitB2} — những phẩm chất này sẽ là điểm tựa của mối quan hệ trong những lúc khó khăn nhất.`,
  `Phân tích bản chất: {nameA} — {traitA1}, {traitA2}. {nameB} — {traitB1}, {traitB2}. Hai tập hợp phẩm chất này không phủ nhận nhau — chúng bổ sung cho nhau theo những cách mà đôi khi chỉ thấy được sau một thời gian dài ở cạnh nhau.`,
];

const ELEMENT_SERIOUS = [
  `Nguyên tố {element} — {elementDesc}. Đây là nền tảng năng lượng của mối quan hệ {nameA} và {nameB}. Nó không quyết định tất cả, nhưng nó định hình cách hai bạn tương tác ở những tầng sâu nhất.`,
  `{element}: {elementDesc}. Tiên Tri đề cập điều này vì nguyên tố của một mối quan hệ thường giải thích những điều mà ngôn ngữ thông thường không diễn tả được — tại sao ở bên nhau lại cảm thấy như thế, tại sao một số khoảnh khắc lại có trọng lượng đặc biệt.`,
];

const STRENGTH_SERIOUS = [
  `{strength} Đây không phải lời khen xã giao — đây là điều Tiên Tri đọc được từ năng lượng của hai bạn. Màu tình yêu {colorName}: {colorMeaning}. Hai yếu tố này kết hợp lại nói lên nền tảng mà {nameA} và {nameB} đang đứng trên.`,
  `Điểm mạnh cốt lõi: {strength} Tiên Tri cũng ghi nhận màu {colorName} — {colorMeaning}. Những điều này không tự dưng có — chúng là kết quả của cách hai bạn đối xử với nhau.`,
];

const CHALLENGE_SERIOUS = [
  `Thử thách cần nhận diện rõ: {conflict} Tiên Tri đề cập điều này không phải để bi quan, mà vì nhận diện được thử thách là bước đầu tiên để không bị nó kiểm soát.`,
  `{conflict} — đây là điểm cần chú ý. Không phải mọi thứ trong mối quan hệ đều cần giải quyết ngay, nhưng cái này thì cần được nhìn nhận thẳng thắn bởi cả hai người.`,
];

const EMOTIONAL_SERIOUS = [
  `Về chiều sâu cảm xúc: {emotionalConn} Đây là điều không thể xây dựng qua thời gian ngắn — hoặc có hoặc không. {nameA} và {nameB} có.`,
  `{emotionalConn} Tiên Tri ghi nhận điều này như một tài sản quan trọng của mối quan hệ. Nhiều cặp đôi thiếu điều này dù có nhiều thứ khác.`,
];

const FUTURE_SERIOUS = [
  `Về tương lai: {futurePotential} Biểu tượng {symbolName} — {symbolMeaning} — đi theo mối duyên này. Con số {luckyNumber} sẽ xuất hiện vào những thời điểm quan trọng nếu hai bạn để ý.`,
  `{futurePotential} Tiên Tri nói điều này dựa trên những gì quả cầu cho thấy, không phải những gì hai bạn muốn nghe. Biểu tượng {symbolName}: {symbolMeaning}. Con số {luckyNumber} đi cùng hai bạn.`,
];

const CLOSING_SERIOUS = [
  `{nameA} và {nameB} — Tiên Tri đã nói những gì cần nói. Mối quan hệ không được xây dựng bằng những lời tiên tri — nó được xây dựng bằng những quyết định hàng ngày của hai người. Những gì vừa nghe chỉ là bản đồ. Hai bạn mới là người đi.`,
  `Tiên Tri kết thúc ở đây. {nameA} và {nameB} — không có mối quan hệ nào thành công mà không có nỗ lực ý thức từ cả hai phía. Những gì hai bạn có là tiềm năng — những gì hai bạn làm với nó mới là câu trả lời thật sự.`,
];

// ─── Builder ──────────────────────────────────────────────────────────────────

function buildSections(rng, score, tone) {
  if (tone === 'hai-huoc') {
    return {
      opening: pickRandom(OPEN_FUNNY, rng),
      essence: pickRandom(ESSENCE_FUNNY, rng),
      element: pickRandom(ELEMENT_FUNNY, rng),
      strength: pickRandom(STRENGTH_FUNNY, rng),
      challenge: pickRandom(CHALLENGE_FUNNY, rng),
      emotional: pickRandom(EMOTIONAL_FUNNY, rng),
      future: pickRandom(FUTURE_FUNNY, rng),
      closing: pickRandom(CLOSING_FUNNY, rng),
    };
  }

  if (tone === 'nghiem-tuc') {
    return {
      opening: pickRandom(OPEN_SERIOUS, rng),
      essence: pickRandom(ESSENCE_SERIOUS, rng),
      element: pickRandom(ELEMENT_SERIOUS, rng),
      strength: pickRandom(STRENGTH_SERIOUS, rng),
      challenge: pickRandom(CHALLENGE_SERIOUS, rng),
      emotional: pickRandom(EMOTIONAL_SERIOUS, rng),
      future: pickRandom(FUTURE_SERIOUS, rng),
      closing: pickRandom(CLOSING_SERIOUS, rng),
    };
  }

  // Thơ mộng (default)
  const opening = score >= 90 ? pickRandom(OPEN_VERY_HIGH, rng)
    : score >= 75 ? pickRandom(OPEN_HIGH, rng)
    : score >= 60 ? pickRandom(OPEN_MID_HIGH, rng)
    : score >= 40 ? pickRandom(OPEN_MID, rng)
    : pickRandom(OPEN_LOW, rng);

  const future = score >= 90 ? pickRandom(FUTURE_VERY_HIGH, rng)
    : score >= 75 ? pickRandom(FUTURE_HIGH, rng)
    : score >= 40 ? pickRandom(FUTURE_MID, rng)
    : pickRandom(FUTURE_LOW, rng);

  return {
    opening,
    essence: pickRandom(ESSENCES, rng),
    element: pickRandom(ELEMENT_PASSAGES, rng),
    strength: pickRandom(STRENGTH_COLOR, rng),
    challenge: pickRandom(CHALLENGES, rng),
    emotional: pickRandom(EMOTIONAL, rng),
    future,
    closing: pickRandom(CLOSINGS, rng),
  };
}

export function generateProphecy(personA, personB, analysis, tone = 'tho-mong') {
  const rng = createRng(analysis.seed + 31337 + (tone === 'hai-huoc' ? 111 : tone === 'nghiem-tuc' ? 222 : 0));

  const sections = buildSections(rng, analysis.score, tone);

  const vars = {
    nameA: personA.name, nameB: personB.name,
    traitA1: analysis.traits.personA[0] ?? '',
    traitA2: analysis.traits.personA[1] ?? '',
    traitB1: analysis.traits.personB[0] ?? '',
    traitB2: analysis.traits.personB[1] ?? '',
    element: analysis.element.label,
    elementDesc: analysis.element.desc,
    colorName: analysis.loveColor.name,
    colorMeaning: analysis.loveColor.meaning,
    symbolName: analysis.destinySymbol.name,
    symbolMeaning: analysis.destinySymbol.meaning,
    strength: analysis.strength,
    conflict: analysis.conflict,
    emotionalConn: analysis.emotionalConnection,
    futurePotential: analysis.futurePotential,
    luckyNumber: analysis.luckyNumber,
  };

  return Object.values(sections).map(t => fill(t, vars)).join('\n\n');
}
