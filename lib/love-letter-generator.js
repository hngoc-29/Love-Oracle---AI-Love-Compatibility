/**
 * Love Letter Generator — template-based fallback
 * Không đề cập điểm số. Dùng cung hoàng đạo & biểu tượng để tăng chiều sâu.
 */
import { createRng, pickRandom } from './hash.js';

const LETTERS_THO_MONG = [
  `{nameA} thân mến,

Có những điều tôi đã muốn nói từ lâu nhưng cứ mãi tìm chưa ra từ nào đủ đúng. Hôm nay tôi thử.

Tôi không biết từ khi nào mà sự hiện diện của {nameB} trở thành thứ tôi tìm kiếm đầu tiên vào mỗi buổi sáng — không phải điện thoại, không phải cà phê, mà là cảm giác biết rằng ngày hôm nay có {nameB} trong đó.

Cung {zodiacA} và cung {zodiacB} — hai bầu trời khác nhau nhưng các vì sao đã tìm cách đặt chúng ta cạnh nhau. Nguyên tố {element} dẫn lối cho câu chuyện này, và tôi chọn tin vào điều đó.

Màu tình yêu của chúng ta là {colorName} — {colorMeaning}. Tôi nghĩ đó cũng là màu của cái cách tôi nhìn về phía {nameB} mỗi khi không ai chú ý.

Tôi không có nhiều lời hay. Chỉ có điều này: cảm ơn vì đã là {nameB}.

Mãi mãi của bạn,
{nameA}`,

  `Gửi {nameB},

Tôi đã thử viết thư này nhiều lần. Lần nào cũng xóa đi vì cảm thấy chưa đủ. Nhưng hôm nay tôi quyết định gửi dù chưa hoàn hảo — vì {nameB} xứng đáng được nghe điều này.

Bạn có biết không, có những người bước vào cuộc đời mình và làm mọi thứ trở nên khác đi mà không cần làm gì to lớn? {nameB} là người như vậy với tôi.

Tiên tri nói nguyên tố của chúng ta là {element} — {elementDesc}. Tôi tin điều đó. Bởi vì ở cạnh {nameB}, tôi cảm thấy được cân bằng theo cách tôi chưa từng tìm thấy ở đâu khác.

Biểu tượng số phận của chúng ta là {symbolName}. {symbolMeaning}. Tôi muốn tin rằng câu chuyện của hai ta cũng sẽ như vậy.

Không cần {nameB} nói gì cả. Chỉ cần tiếp tục là chính mình — điều đó đã đủ làm tôi muốn ở lại rồi.

Trân trọng và hơn thế nữa,
{nameA}`,

  `{nameB} yêu dấu,

Người ta hay nói về định mệnh như một thứ gì đó huyền bí và xa xôi. Nhưng với tôi, định mệnh chỉ đơn giản là khoảnh khắc tôi nhận ra rằng {nameB} đang ở đây — và cảm giác đó đúng hơn bất cứ điều gì tôi từng biết.

{nameB} là {zodiacB}, tôi là {zodiacA}. Hai cung hoàng đạo, hai cách nhìn đời, nhưng cùng hướng về một điều. Các vì sao không ghép ngẫu nhiên — chúng ghép có chủ đích.

Màu {colorName} luôn nhắc tôi nhớ đến {nameB}. {colorMeaning} — đó cũng là cách tôi cảm nhận về người này.

Yêu bạn theo cách tôi biết yêu,
{nameA}`,
];

const LETTERS_HAI_HUOC = [
  `{nameB} ơi,

Thú thật là tôi đã gõ xóa cái thư này bảy lần. Đây là lần thứ tám và tôi quyết định không xóa nữa vì tay tôi mỏi rồi.

Tiên Tri ghép {zodiacA} với {zodiacB} và gật đầu. Tôi không biết hai cung đó có hợp không nhưng nghe khá hay, nên thôi cứ để vậy.

Các vì sao bảo nguyên tố của hai ta là {element}. Tôi không chắc điều đó nghĩa là gì nhưng nó nghe hay nên tôi cứ đề cập.

Điều tôi muốn nói thực ra đơn giản hơn nhiều: {nameB} làm tôi muốn trở thành phiên bản tốt hơn của mình. Không phải vì áp lực gì, mà vì tôi muốn xứng đáng với người ngồi kế bên.

Thư tình này có thể không hay lắm. Nhưng nó thật. Và thật thì hơn hay.

Người đang run tay gõ những dòng này,
{nameA}`,

  `Kính gửi {nameB} (tôi viết kính gửi cho nó trọng thể),

Tôi biết viết thư tình nghe hơi cổ. Nhưng nhắn tin thì dễ bị seen rồi không trả lời, nên thư có vẻ an toàn hơn.

Tiên Tri bảo {nameA} là {zodiacA}, {nameB} là {zodiacB}. Tôi không biết hai cung đó có nghĩa gì với nhau nhưng Tiên Tri có vẻ hài lòng, vậy là đủ.

{nameB} biết không, màu tình yêu của chúng ta là {colorName}. {colorMeaning}. Tôi thấy màu đó mỗi khi nhìn về phía {nameB}. (Đây là phần lãng mạn nhất của thư, hãy trân trọng.)

Nói thật: tôi không giỏi bày tỏ. Nhưng nếu {nameB} đang đọc đến đây thì ít nhất {nameB} biết tôi đã cố.

Người viết thư tình lần đầu trong đời,
{nameA}`,
];

const LETTERS_NGHIEM_TUC = [
  `{nameB},

Có những điều quan trọng cần được nói rõ ràng, không phải qua những lời hoa mỹ hay ám chỉ. Đây là một trong những điều đó.

{nameA} là {zodiacA}, {nameB} là {zodiacB}. Hai cung hoàng đạo với những phẩm chất khác nhau — nhưng nguyên tố {element} ({elementDesc}) đang kết nối hai ta theo cách mà tôi tin là có giá trị lâu dài.

Sự tương hợp thực sự không đến từ con số hay lời tiên tri — nó đến từ quyết định của hai người trong cách đối xử với nhau mỗi ngày. Tôi muốn được là người đồng hành trong câu chuyện của {nameB}, không phải vì số phận chỉ định, mà vì tôi chọn điều đó.

Biểu tượng {symbolName} đi theo chúng ta: {symbolMeaning}. Tôi muốn cùng {nameB} viết câu chuyện đó.

Trân trọng,
{nameA}`,
];

function fill(tpl, v) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
}

export function generateLoveLetter(personA, personB, analysis, tone = 'tho-mong') {
  const rng = createRng(analysis.seed + 99999);

  const pool = tone === 'hai-huoc'   ? LETTERS_HAI_HUOC
             : tone === 'nghiem-tuc' ? LETTERS_NGHIEM_TUC
             : LETTERS_THO_MONG;

  const template = pickRandom(pool, rng);
  return fill(template, {
    nameA:        personA.name,
    nameB:        personB.name,
    zodiacA:      analysis.zodiac?.personA?.sign?.name ?? '',
    zodiacB:      analysis.zodiac?.personB?.sign?.name ?? '',
    element:      analysis.element.label,
    elementDesc:  analysis.element.desc,
    colorName:    analysis.loveColor.name,
    colorMeaning: analysis.loveColor.meaning,
    symbolName:   analysis.destinySymbol.name,
    symbolMeaning: analysis.destinySymbol.meaning,
  });
}
