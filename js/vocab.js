// Kho từ vựng. Mỗi file trong js/data/ gọi VOCAB.add(chủ đề, danh sách từ).
// Chủ đề thuộc một bộ (group): "basic" (mặc định) hoặc "toeic".
// Mỗi từ: [word, pos, ipa, vi, example, exampleVi, level]
// IPA theo giọng Anh-Mỹ. Level theo khung CEFR (A1 → C2).
window.VOCAB = (function () {
  const groups = [
    { id: 'basic', name: 'Cơ bản', desc: 'Từ vựng đời sống theo chủ đề, từ A1 đến C1.' },
    { id: 'toeic', name: 'TOEIC', desc: 'Từ vựng công sở và kinh doanh hay gặp trong đề TOEIC, hướng tới mục tiêu 785+.' }
  ];
  const topics = [];
  const words = [];
  const seen = new Set();

  function add(topic, rows) {
    topic.group = topic.group || 'basic';
    topics.push(topic);
    for (const [word, pos, ipa, vi, ex, exVi, level] of rows) {
      const id = word.replace(/\s+/g, '-');
      if (seen.has(id)) {
        console.warn('Từ bị trùng, đã bỏ qua:', word);
        continue;
      }
      seen.add(id);
      words.push({ id, word, pos, ipa, vi, ex, exVi, level, topic: topic.id });
    }
  }

  return { groups, topics, words, add };
})();
