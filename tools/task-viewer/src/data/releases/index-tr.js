// Sürüm metaverileri - gerçek içerik /releases/*.md dosyalarından yüklenir
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'Görev Tamamlama Özet Depolama Sistemi',
    summary: 'Yapılandırılmış veri modeli ve akıllı özet ayrıştırma yetenekleri ile geliştirilmiş görev tamamlama detayları'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: 'Geliştirilmiş Sürüm Notları ve Arşiv Sistemi',
    summary: 'İlk İstek Gösterimi ile bağlam takibi, AI destekli özetler, İçindekiler ile geliştirilmiş Sürüm Notları ve kapsamlı Arşiv yönetimi'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: 'İlk İstek Gösterimi',
    summary: 'Görev planlamasını başlatan orijinal kullanıcı isteğini yakalar ve görüntüler, görev listeleri için temel bağlam sağlar'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'Uluslararasılaştırma, Görev Geçmişi, Alt-ajanlar, Lightbox',
    summary: 'Çoklu dil desteği, şablon özelleştirme, proje geçmişi, ajan yönetimi, resim lightbox ve büyük UI geliştirmeleri'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'Geliştirilmiş Görev Yönetimi ve VS Code Entegrasyonu',
    summary: 'VS Code dosya bağlantıları, geliştirilmiş UUID yönetimi, bağımlılıklar sütunu ve uygulama içi sürüm notları'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'İlk Bağımsız Sürüm',
    summary: 'Profil yönetimi, gerçek zamanlı güncellemeler ve modern arayüz ile web tabanlı görev görüntüleyicisi'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};