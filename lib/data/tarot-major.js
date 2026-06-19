/**
 * Major Arcana — 22 lá ẩn chính.
 * img khớp với file SVG trong public/tarot/cards/ (vector hoá bộ Rider-Waite-Smith, public domain).
 */
export const MAJOR_ARCANA = [
  { id:'major-00', img:'a-00.svg', number:0, arcana:'major', suit:null,
    nameVn:'Kẻ Khờ', nameEn:'The Fool', element:'air',
    keywords:['khởi đầu mới','tự do','ngây thơ','niềm tin'],
    upright:'Một hành trình mới đang mở ra, đầy hồn nhiên và tin tưởng vào những điều chưa biết. Đây là lúc để bước đi mà không cần biết hết mọi câu trả lời — sự ngây thơ ấy chính là sức mạnh.',
    reversed:'Sự bồng bột, hấp tấp khiến bạn bỏ lỡ những rủi ro cần lường trước. Có thể đang sợ hãi việc bắt đầu, hoặc lao vào một quyết định mà chưa suy nghĩ kỹ.' },

  { id:'major-01', img:'a-01.svg', number:1, arcana:'major', suit:null,
    nameVn:'Nhà Ảo Thuật', nameEn:'The Magician', element:'air',
    keywords:['sáng tạo','ý chí','kỹ năng','biểu lộ'],
    upright:'Bạn có đủ mọi công cụ cần thiết để biến ý tưởng thành hiện thực. Đây là lúc hành động, tập trung ý chí và biến tiềm năng thành kết quả cụ thể.',
    reversed:'Tài năng đang bị dùng sai cách, hoặc bạn chưa thực sự tin vào khả năng của mình. Cẩn thận với sự lừa dối — từ người khác hoặc từ chính bạn.' },

  { id:'major-02', img:'a-02.svg', number:2, arcana:'major', suit:null,
    nameVn:'Nữ Tư Tế', nameEn:'The High Priestess', element:'water',
    keywords:['trực giác','bí ẩn','tiềm thức','tĩnh lặng'],
    upright:'Câu trả lời không nằm ở logic mà ở trực giác. Hãy lắng nghe tiếng nói bên trong, có những điều chỉ có thể cảm nhận, chưa thể nói thành lời.',
    reversed:'Bạn đang lờ đi trực giác của chính mình, hoặc có những bí mật bị che giấu cần được nhìn nhận lại. Mất kết nối với phần sâu thẳm bên trong.' },

  { id:'major-03', img:'a-03.svg', number:3, arcana:'major', suit:null,
    nameVn:'Hoàng Hậu', nameEn:'The Empress', element:'earth',
    keywords:['nuôi dưỡng','sung túc','sáng tạo','thiên nhiên'],
    upright:'Sự sung túc, ấm áp và khả năng nuôi dưỡng đang nở rộ — trong tình yêu, trong sáng tạo, hay trong một điều gì đang lớn lên. Hãy cho phép mình được chăm sóc và chăm sóc người khác.',
    reversed:'Sự phụ thuộc quá mức, hoặc bỏ quên bản thân khi chăm lo cho người khác. Có thể đang bế tắc trong sáng tạo hoặc cảm thấy thiếu thốn dù xung quanh đầy đủ.' },

  { id:'major-04', img:'a-04.svg', number:4, arcana:'major', suit:null,
    nameVn:'Hoàng Đế', nameEn:'The Emperor', element:'fire',
    keywords:['quyền lực','cấu trúc','kỷ luật','ổn định'],
    upright:'Một nền tảng vững chắc đang được xây dựng nhờ kỷ luật và quyết đoán. Đây là lúc để dẫn dắt, đặt ra giới hạn rõ ràng và chịu trách nhiệm.',
    reversed:'Sự cứng nhắc hoặc kiểm soát quá mức đang gây ngột thở. Có thể đang thiếu kỷ luật, hoặc ngược lại, áp đặt quá nhiều lên người khác.' },

  { id:'major-05', img:'a-05.svg', number:5, arcana:'major', suit:null,
    nameVn:'Giáo Hoàng', nameEn:'The Hierophant', element:'earth',
    keywords:['truyền thống','niềm tin','quy tắc','cố vấn'],
    upright:'Những giá trị truyền thống, một hệ thống niềm tin, hoặc lời khuyên từ người đi trước đang soi sáng con đường. Có sự an toàn trong việc tuân theo khuôn khổ đã được kiểm chứng.',
    reversed:'Cảm thấy ngột ngạt bởi quy tắc cứng nhắc, muốn phá vỡ khuôn mẫu để tìm con đường riêng. Chất vấn những gì đã được dạy từ trước.' },

  { id:'major-06', img:'a-06.svg', number:6, arcana:'major', suit:null,
    nameVn:'Tình Nhân', nameEn:'The Lovers', element:'air',
    keywords:['kết nối','lựa chọn','hài hòa','giá trị'],
    upright:'Một sự kết nối sâu sắc, hài hòa giữa hai tâm hồn hoặc giữa các giá trị bên trong bạn. Đây cũng là lá bài của lựa chọn — chọn điều phù hợp nhất với con người thật của mình.',
    reversed:'Mất cân bằng trong một mối quan hệ, sự bất hoà về giá trị, hoặc một lựa chọn khó khăn đang bị trì hoãn. Có thể đang mâu thuẫn với chính mình.' },

  { id:'major-07', img:'a-07.svg', number:7, arcana:'major', suit:null,
    nameVn:'Cỗ Xe', nameEn:'The Chariot', element:'water',
    keywords:['ý chí','chiến thắng','quyết tâm','kiểm soát'],
    upright:'Bằng ý chí và sự tập trung, bạn đang vượt qua những hướng đi mâu thuẫn để tiến về phía trước. Chiến thắng đến từ việc giữ vững tay lái giữa hỗn loạn.',
    reversed:'Mất phương hướng, hai lực đối lập đang kéo bạn về hai phía khiến bạn không thể tiến lên. Cần lấy lại sự kiểm soát trước khi đi tiếp.' },

  { id:'major-08', img:'a-08.svg', number:8, arcana:'major', suit:null,
    nameVn:'Sức Mạnh', nameEn:'Strength', element:'fire',
    keywords:['can đảm','kiên nhẫn','nội lực','dịu dàng'],
    upright:'Sức mạnh thực sự không đến từ vũ lực mà từ sự dịu dàng kiên định. Bạn đang thuần hoá nỗi sợ của chính mình bằng lòng can đảm thầm lặng.',
    reversed:'Tự nghi ngờ bản thân, cảm thấy yếu đuối trước thử thách. Có thể đang dùng vũ lực hoặc ép buộc thay vì sự kiên nhẫn cần có.' },

  { id:'major-09', img:'a-09.svg', number:9, arcana:'major', suit:null,
    nameVn:'Ẩn Sĩ', nameEn:'The Hermit', element:'earth',
    keywords:['tự soi','cô độc','tìm kiếm','nội tâm'],
    upright:'Câu trả lời nằm ở việc lui về phía sau, tự soi xét bản thân trong tĩnh lặng. Đây là thời gian cần cho riêng mình để tìm thấy ánh sáng nội tâm.',
    reversed:'Cô lập quá mức khiến bạn xa cách với mọi người, hoặc từ chối sự giúp đỡ khi đang rất cần. Cẩn thận với cảm giác cô đơn kéo dài.' },

  { id:'major-10', img:'a-10.svg', number:10, arcana:'major', suit:null,
    nameVn:'Vòng Xoay Số Phận', nameEn:'Wheel of Fortune', element:'fire',
    keywords:['vận may','chu kỳ','định mệnh','thay đổi'],
    upright:'Một bước ngoặt của số phận đang xoay chuyển. Những gì lên rồi sẽ xuống, và xuống rồi sẽ lên — hãy đón nhận sự thay đổi này như một phần tự nhiên của hành trình.',
    reversed:'Cảm giác như đang gặp vận xấu liên tiếp, hoặc chống lại một sự thay đổi không thể tránh khỏi. Vòng xoay vẫn quay, dù bạn có muốn hay không.' },

  { id:'major-11', img:'a-11.svg', number:11, arcana:'major', suit:null,
    nameVn:'Công Lý', nameEn:'Justice', element:'air',
    keywords:['công bằng','sự thật','nhân quả','quyết định'],
    upright:'Mọi việc đang được nhìn nhận một cách công bằng và rõ ràng. Nhân nào quả nào — những hành động trong quá khứ đang mang lại kết quả tương xứng ở hiện tại.',
    reversed:'Có sự bất công, thiên vị, hoặc một sự thật đang bị che giấu. Có thể bạn đang trốn tránh trách nhiệm cho hành động của mình.' },

  { id:'major-12', img:'a-12.svg', number:12, arcana:'major', suit:null,
    nameVn:'Người Treo Ngược', nameEn:'The Hanged Man', element:'water',
    keywords:['buông bỏ','góc nhìn mới','tạm dừng','hi sinh'],
    upright:'Đôi khi cần dừng lại, treo ngược góc nhìn cũ để thấy điều gì đó hoàn toàn mới. Sự buông bỏ tạm thời này không phải thất bại, mà là một dạng giác ngộ.',
    reversed:'Đang chống lại sự trì hoãn cần thiết, cố gắng kiểm soát những gì nên được để tự nhiên diễn ra. Sợ buông bỏ vì sợ mất kiểm soát.' },

  { id:'major-13', img:'a-13.svg', number:13, arcana:'major', suit:null,
    nameVn:'Tử Thần', nameEn:'Death', element:'water',
    keywords:['kết thúc','chuyển hoá','tái sinh','buông bỏ'],
    upright:'Một chương đang kết thúc để một chương mới có thể bắt đầu. Đây không phải sự kết liễu đáng sợ, mà là sự chuyển hoá cần thiết để bạn được tái sinh.',
    reversed:'Cố bám lấy những gì đã hết thời, sợ thay đổi đến mức trì hoãn điều tất yếu. Sự trì trệ đang kéo dài hơn cần thiết.' },

  { id:'major-14', img:'a-14.svg', number:14, arcana:'major', suit:null,
    nameVn:'Điều Độ', nameEn:'Temperance', element:'fire',
    keywords:['cân bằng','hoà hợp','kiên nhẫn','chữa lành'],
    upright:'Sự cân bằng đang được tìm thấy qua việc pha trộn hài hòa giữa các cực đối lập. Kiên nhẫn và điều độ đang chữa lành những gì từng đứt gãy.',
    reversed:'Mất cân bằng, thái quá ở một phía nào đó — quá nhiều hoặc quá ít. Thiếu kiên nhẫn đang cản trở quá trình hàn gắn cần thiết.' },

  { id:'major-15', img:'a-15.svg', number:15, arcana:'major', suit:null,
    nameVn:'Ác Quỷ', nameEn:'The Devil', element:'earth',
    keywords:['ràng buộc','cám dỗ','vật chất','bóng tối'],
    upright:'Một sự ràng buộc, cám dỗ, hoặc thói quen không lành mạnh đang giữ bạn lại. Nhưng dây xích ấy lỏng hơn bạn nghĩ — nhận ra nó là bước đầu để thoát ra.',
    reversed:'Đang giải thoát mình khỏi một ràng buộc độc hại, hoặc bắt đầu nhận ra mình đã tự trói buộc chính mình bằng nỗi sợ.' },

  { id:'major-16', img:'a-16.svg', number:16, arcana:'major', suit:null,
    nameVn:'Tòa Tháp', nameEn:'The Tower', element:'fire',
    keywords:['đột phá','sụp đổ','tỉnh thức','biến động'],
    upright:'Một cấu trúc giả tạo đang sụp đổ bất ngờ — gây sốc nhưng cần thiết. Sau đổ vỡ là sự thật được phơi bày và một nền tảng chân thật hơn được xây lại.',
    reversed:'Sợ hãi một sự sụp đổ sắp xảy ra, hoặc đang trì hoãn một sự thay đổi tất yếu khiến nó tích tụ âm ỉ hơn.' },

  { id:'major-17', img:'a-17.svg', number:17, arcana:'major', suit:null,
    nameVn:'Sao Hy Vọng', nameEn:'The Star', element:'air',
    keywords:['hy vọng','chữa lành','cảm hứng','bình yên'],
    upright:'Sau bão tố là ánh sáng dịu dàng của hy vọng. Đây là thời điểm chữa lành, để bản thân được nghỉ ngơi và tin tưởng vào những điều tốt đẹp đang đến.',
    reversed:'Mất niềm tin, cảm thấy tuyệt vọng hoặc ngắt kết nối với những điều truyền cảm hứng cho mình. Cần tìm lại ánh sáng nhỏ đang bị che mờ.' },

  { id:'major-18', img:'a-18.svg', number:18, arcana:'major', suit:null,
    nameVn:'Mặt Trăng', nameEn:'The Moon', element:'water',
    keywords:['ảo tưởng','trực giác','sợ hãi','tiềm thức'],
    upright:'Mọi thứ không hoàn toàn như vẻ ngoài — có những lớp ẩn giấu trong tiềm thức cần được soi sáng. Tin vào trực giác hơn là những gì mắt thấy lúc này.',
    reversed:'Sự nhầm lẫn dần được giải toả, sự thật bắt đầu lộ ra sau những ảo tưởng. Hoặc đang chìm sâu hơn vào lo lắng không rõ nguyên do.' },

  { id:'major-19', img:'a-19.svg', number:19, arcana:'major', suit:null,
    nameVn:'Mặt Trời', nameEn:'The Sun', element:'fire',
    keywords:['niềm vui','thành công','sức sống','rõ ràng'],
    upright:'Ánh sáng rực rỡ của niềm vui, thành công và sự rõ ràng đang chiếu rọi. Đây là lúc để toả sáng, tự tin là chính mình mà không cần che giấu.',
    reversed:'Niềm vui bị che mờ tạm thời, hoặc sự tự tin đang lung lay. Vẫn còn ánh sáng đó, chỉ là đang bị mây che khuất.' },

  { id:'major-20', img:'a-20.svg', number:20, arcana:'major', suit:null,
    nameVn:'Phán Xét', nameEn:'Judgement', element:'fire',
    keywords:['tỉnh thức','đánh giá lại','tha thứ','hồi sinh'],
    upright:'Một lời kêu gọi tỉnh thức đang vang lên — nhìn lại hành trình đã qua để bước vào một phiên bản mới của chính mình. Sự tha thứ, cho mình và cho người khác, đang mở ra cơ hội hồi sinh.',
    reversed:'Tự phán xét bản thân quá khắc nghiệt, hoặc trốn tránh việc nhìn lại những gì cần được giải quyết. Nghi ngờ tiếng gọi bên trong.' },

  { id:'major-21', img:'a-21.svg', number:21, arcana:'major', suit:null,
    nameVn:'Thế Giới', nameEn:'The World', element:'earth',
    keywords:['hoàn thành','viên mãn','hợp nhất','thành tựu'],
    upright:'Một chu kỳ đã hoàn thành viên mãn — mọi mảnh ghép đã khớp lại với nhau. Đây là khoảnh khắc ăn mừng thành tựu trước khi một vòng tròn mới bắt đầu.',
    reversed:'Cảm giác như còn thiếu điều gì đó để hoàn thiện, hoặc khó khăn trong việc khép lại một chương để tiến tới điều mới.' },
];
