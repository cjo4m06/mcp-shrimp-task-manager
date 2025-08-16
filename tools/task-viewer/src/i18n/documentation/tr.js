export const trDocumentation = {
  releaseNotes: {
    header: '📋 Sürüm Notları',
    versions: 'Sürümler',
    loading: 'Sürüm notları yükleniyor...',
    notFound: 'Sürüm notları bulunamadı.',
    error: 'Sürüm notları yüklenirken hata oluştu.',
    copy: 'Kopyala',
    copied: 'Kopyalandı!'
  },
  help: {
    header: 'ℹ️ Yardım ve Dokümantasyon',
    loading: 'Dokümantasyon yükleniyor...',
    notFound: 'README bulunamadı.',
    error: 'README yüklenirken hata oluştu.',
    copy: 'Kopyala',
    copied: 'Kopyalandı!'
  },
  releases: {
    'v3.0.0': {
      title: '🚀 Task Viewer v3.0.0 Sürüm Notları',
      date: 'Sürüm Tarihi: 7 Ağustos 2025',
      content: `# 🚀 Task Viewer v3.0.0 Sürüm Notları

*Sürüm Tarihi: 7 Ağustos 2025*

## 📑 İçindekiler

- [🎉 Ana Yeni Özellikler](#-ana-yeni-özellikler)
  - [🤖 Ajan Yönetim Sistemi](#-ajan-yönetim-sistemi)
  - [🤖 AI Destekli Toplu Ajan Ataması](#-ai-destekli-toplu-ajan-ataması)
  - [📊 Görev Geçmişi için Git Sürüm Kontrolü](#-görev-geçmişi-için-git-sürüm-kontrolü)
  - [📊 Proje Geçmişi Görünümü](#-proje-geçmişi-görünümü)
  - [🎨 Şablon Yönetim Sistemi](#-şablon-yönetim-sistemi)
  - [🌍 Uluslararasılaştırma (i18n) Desteği](#-uluslararasılaştırma-i18n-desteği)
  - [🧭 Geliştirilmiş Navigasyon ve UI](#-geliştirilmiş-navigasyon-ve-ui)

## 🎉 Ana Yeni Özellikler

### 🤖 Ajan Yönetim Sistemi
SHRIMP-TASK-MANAGER artık farklı türdeki görevler için özelleşmiş AI ajanları tanımlayıp kullanmanıza olanak sağlayan güçlü ajan yönetim yetenekleri destekliyor.

### 🤖 AI Destekli Toplu Ajan Ataması
Task Viewer artık görev açıklamaları ve gereksinimlerine dayalı olarak görevlere zekice ajan atamak için OpenAI'nin GPT-4'ü ile entegre oluyor.

### 📊 Görev Geçmişi için Git Sürüm Kontrolü
SHRIMP-TASK-MANAGER artık tasks.json dosyanızdaki tüm değişiklikleri otomatik olarak takip eden yerleşik Git entegrasyonu içeriyor.

### 📊 Proje Geçmişi Görünümü
Yeni Proje Geçmişi Görünümü görev geçmişini açığa çıkarır ve projenizin zaman içinde nasıl evrimleştiğini keşfetmenizi sağlar.

### 🎨 Şablon Yönetim Sistemi
Şablonlar, SHRIMP-TASK-MANAGER'ı farklı operasyon türlerini analiz etme ve yürütme konusunda yönlendiren temel talimatlardır. Bu yeni Şablon Yönetim arayüzü AI talimatlarını özelleştirmek için sezgisel bir yol sağlar.

### 🌍 Uluslararasılaştırma (i18n) Desteği
- **Desteklenen Üç Dil**: İngilizce (en), Çince (中文) ve İspanyolca (Español)
- **Kalıcı Dil Seçimi**: Dil tercihiniz kaydedilir ve hatırlanır
- **Tam UI Çevirisi**: Tüm UI öğeleri tamamen çevrilmiştir
- **Dinamik Dil Değiştirme**: Sayfa yenileme olmaksızın anında dil değiştirme

### 🧭 Geliştirilmiş Navigasyon ve UI
- **İç İçe Sekme Sistemi**: Birincil ve ikincil sekmelerle düzenlenmiş navigasyon
- **URL Durum Senkronizasyonu**: Mevcut görünümü yansıtmak için tarayıcı URL'si güncellenir
- **Görev Detay Navigasyonu**: Önceki/Sonraki düğmeleri sıralı görev incelemesine olanak tanır
- **Yükleme Döndürücüleri**: Veri yükleme sırasında görsel geri bildirim

## 🔄 Önemli İyileştirmeler

### Görev Detay Navigasyonu
Görev Detayları görünümü artık görevleri nasıl incelediğinizi ve onlarla çalıştığınızı dönüştüren Önceki/Sonraki navigasyon düğmelerini içeriyor.

### Performans İyileştirmeleri
- **Optimize Edilmiş Yeniden Render'lar**: Daha iyi performans için React hook'ları uygun şekilde memoize edildi
- **Lazy Loading**: Daha hızlı başlangıç sayfa yükleme için isteğe bağlı bileşen yükleme
- **Verimli Durum Yönetimi**: Gereksiz durum güncellemeleri azaltıldı

## 🐛 Hata Düzeltmeleri

### Kritik Düzeltmeler
- **useRef Hook Hatası**: Uygulama çökmelerine neden olan eksik React hook import'u düzeltildi
- **Çeviri Anahtarları**: Desteklenen tüm diller için eksik çeviri anahtarları eklendi
- **Sembolik Bağlantı Döngüsü**: Screenshots dizini sonsuz döngü sorunu çözüldü

### UI Düzeltmeleri
- **Modal Z-index**: Modal katmanlama sorunları düzeltildi
- **Sekme Seçimi**: Sayfa yenilemeleri boyunca sekme kalıcılığı düzeltildi
- **Dil Seçici**: Durum senkronizasyon sorunları düzeltildi

## 🏗️ Teknik Güncellemeler

### Yeni Bağımlılıklar
- \`@headlessui/react\`: Modern UI bileşenleri
- \`@tanstack/react-table\`: Gelişmiş tablo işlevselliği
- \`@uiw/react-md-editor\`: Şablonlar için Markdown düzenleme

### API İyileştirmeleri
- **GET /api/templates**: Tüm mevcut şablonları listele
- **PUT /api/templates/:name**: Şablon içeriğini güncelle
- **POST /api/templates/:name/duplicate**: Şablonları çoğalt

## 📝 Uyumsuz Değişiklikler

### Yapılandırma Güncellemeleri
- **Dil Ayarları**: Yeni dil tercihi depolama formatı
- **Şablon Depolama**: Şablonlar artık kullanıcı ana dizininde depolanıyor

## 🚀 Migrasyon Kılavuzu

### v2.1'den v3.0'a
1. **Dil Seçimi**: Varsayılan diliniz İngilizce olacak; yeni seçiciden tercih ettiğiniz dili seçin
2. **Şablonlar**: Mevcut özel şablonlar korunacak ancak yeniden etkinleştirme gerekebilir
3. **Tarayıcı Önbelleği**: Optimal performans için tarayıcı önbelleğini temizleyin

## 🎯 Özet

Sürüm 3.0, Task Viewer için basit bir görev görselleştirme aracından kapsamlı bir görev yönetimi ve özelleştirme platformuna dönüşümü temsil eden büyük bir sıçramayı ifade ediyor. Tam uluslararasılaştırma desteği, güçlü şablon yönetimi, AI destekli otomasyon ve Git tabanlı geçmiş takip yetenekleri ile bu sürüm, takımlara AI destekli geliştirme iş akışları üzerinde eşi görülmemiş kontrol sağlıyor.`
    },
    'v2.1.0': {
      title: 'Task Viewer v2.1.0 Sürüm Notları',
      date: 'Sürüm Tarihi: 29 Temmuz 2025',
      content: `# Task Viewer v2.1.0 Sürüm Notları

*Sürüm Tarihi: 29 Temmuz 2025*

## 🚀 Ana Özellikler

### 🔗 Proje Kökü Desteğiyle Tıklanabilir Dosya Yolları
- **Kopyalamak için Tıklanabilir Dosya Yolları**: Tam dosya yollarını tek tıkla kopyalayın
- **Proje Kökü Yapılandırması**: Tam dosya yolu kopyalama özelliğini etkinleştirmek için profil başına proje kökünü ayarlayın

### 📋 Geliştirilmiş UUID Yönetimi
- **Kopyalamak için Tıklanabilir Görev Rozetleri**: UUID'lerini anında kopyalamak için herhangi bir görev numarası rozetine tıklayın
- **Görev Adı Sütununda UUID Görüntüleme**: Görev adının altında birleştirilmiş UUID, kopyalamak için tıklayın

### 🔄 Kolay Paralelleştirme için Görev Bağımlılık Sütunu
Herhangi bir bağımlı görevin bağlantılı UUID'lerini listeleyen Bağımlılık sütunu eklendi. Artık bağımlı görevlere kolayca gidebilirsiniz.

### 🤖 AI Talimat Eylemleri
Faydalı Robot emojisi bulunan Eylemler Sütunu eklendi. Emojiye tıklarsanız, daha sonra ajan sohbetinize yapıştırabileceğiniz bir AI Talimatını panoya kopyalar.

### ✏️ Profil Düzenleme Düğmesi
- **Proje Kökü Yapılandırması**: Profil başına proje kökünü ayarlayın
- **Profil Yeniden Adlandırma Yetisi**: Silip yeniden oluşturmak zorunda kalmadan bir profil sekmesini yeniden adlandırın

## 🔄 Değişiklikler

### UI/UX İyileştirmeleri
- **Basitleştirilmiş Kopyalama Eylemleri**: UUID kopyalama sadece görev rozeti tıklamasında birleştirildi
- **Notlar Üzerinde Bağımlılıklar**: Notlar sütununu daha faydalı Bağımlılıklar sütunuyla değiştirdi
- **Uygulama İçi Sürüm Notları**: Görev görüntüleyici için sürüm notları üst banner'da gösteriliyor

### Mimari Güncellemeler
- **ES Modül Uyumluluğu**: Daha iyi ES modül desteği için busboy bağımlılığı kaldırıldı
- **Yerel Form Ayrıştırma**: Üçüncü taraf form ayrıştırmasını yerleşik Node.js fonksiyonlarıyla değiştirdi

## 🐛 Hata Düzeltmeleri

### 🚨 KRİTİK DÜZELTME: Dosya Yükleme Statik Kopyalar Oluşturuyor
**Problem**: Bir tasks.json dosyası yükleyerek profil eklerken, sistem \`/tmp/\` dizininde statik bir kopya oluşturuyordu.

**Çözüm**: Dosya yükleme tamamen kaldırıldı. Artık klasör yolunu doğrudan girmelisiniz ve sistem otomatik olarak \`/tasks.json\` ekler.

## 🗑️ Kaldırılanlar

### Kullanımdan Kaldırılmış Özellikler
- **Busboy Bağımlılığı**: Yerel Node.js form ayrıştırması ile değiştirildi
- **Notlar Sütunu**: Daha faydalı Bağımlılıklar sütunuyla değiştirildi
- **Bireysel Kopyalama Düğmeleri**: UUID kopyalama görev rozeti tıklamasında birleştirildi`
    }
  },
  readme: {
    title: '🦐 Shrimp Görev Yöneticisi Görüntüleyici',
    content: `# 🦐 Shrimp Görev Yöneticisi Görüntüleyici

MCP (Model Context Protocol) aracı ile oluşturulan [Shrimp Görev Yöneticisi](https://github.com/cjo4m06/mcp-shrimp-task-manager) görevlerini görüntülemek ve yönetmek için modern, React tabanlı web arayüzü.

## Neden Shrimp Görev Görüntüleyicisini Kullanmalısınız?

Shrimp Görev Yöneticisini Claude gibi AI ajanlarıyla MCP sunucusu olarak kullanırken, bu görüntüleyici görev ekosistemine temel görünürlük sağlar:

- **Görsel Görev Genel Bakışı**: Temiz sekmeli arayüzde tüm görevleri, durumlarını, bağımlılıklarını ve ilerlemelerini görün
- **UUID Yönetimi**: Görev UUID'sini anında kopyalamak için herhangi bir görev rozetine tıklayın
- **Paralel Yürütme**: Birden çok terminal açın ve paralel AI ajan yürütmesi için görev talimatlarını kopyalamak üzere AI Eylemler sütununu (🤖) kullanın
- **Canlı Güncellemeler**: Doğrudan dosya yolu okuma, her zaman güncel görev durumunu görmenizi sağlar
- **Çok Projeli Destek**: Sürüklenebilir profil sekmeleriyle farklı projeler arasında görevleri yönetin

## 🌟 Özellikler

### 🏷️ Modern Sekme Arayüzü
- **Sürüklenebilir Sekmeler**: Sekmeleri sürükleyerek profilleri yeniden sırala
- **Profesyonel Tasarım**: İçeriğe sorunsuz bağlanan tarayıcı tarzı sekmeler
- **Görsel Geri Bildirim**: Net aktif sekme gösterimi ve hover efektleri
- **Yeni Profil Ekleme**: Arayüz tasarımıyla uyumlu entegre "+ Sekme Ekle" düğmesi

### 🔍 Gelişmiş Arama ve Filtreleme
- **Gerçek Zamanlı Arama**: Ad, açıklama, durum veya ID'ye göre anında görev filtreleme
- **Sırlanabilir Sütunlar**: Herhangi bir alana göre sıralamak için sütun başlıklarına tıklayın
- **TanStack Table**: Sayfalama ve filtreleme ile güçlü tablo bileşeni
- **Duyarlı Tasarım**: Masaüstü, tablet ve mobilde mükemmel çalışır

### 🔄 Akıllı Otomatik Yenileme
- **Yapılandırılabilir Aralıklar**: 5s, 10s, 15s, 30s, 1m, 2m veya 5m arasından seçin
- **Akıllı Kontroller**: Aralık seçimiyle otomatik yenileme geçişi
- **Görsel Göstergeler**: Yükleme durumları ve yenileme durumu
- **Manuel Yenileme**: İsteğe bağlı güncellemeler için özel yenileme düğmesi

### 🤖 AI Destekli Özellikler
- **Toplu Ajan Ataması**: Birden çok görev seçin ve en uygun ajanları otomatik atamak için GPT-4 kullanın
- **OpenAI Entegrasyonu**: API anahtarınızı Genel Ayarlar'da veya çevre değişkenleri ile yapılandırın
- **Akıllı Eşleştirme**: AI optimal atamalar için görev açıklamalarını ve ajan yeteneklerini analiz eder

### 🎨 Profesyonel UI/UX
- **Karanlık Tema**: Geliştirme ortamları için optimize edilmiş
- **Duyarlı Düzen**: Tüm ekran boyutlarına uyum sağlar
- **Erişilebilirlik**: Tam klavye navigasyonu ve ekran okuyucu desteği
- **Etkileşimli Öğeler**: Uygulama genelinde hover tooltip'leri ve görsel geri bildirim

## 🚀 Hızlı Başlangıç

### Kurulum ve Kurulum

1. **Klonla ve görev görüntüleyici dizinine git**
   \`\`\`bash
   cd yol/to/mcp-shrimp-task-manager/tools/task-viewer
   \`\`\`

2. **Bağımlılıkları yükle**
   \`\`\`bash
   npm install
   \`\`\`

3. **React uygulamasını oluştur**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Sunucuyu başlat**
   \`\`\`bash
   npm start
   \`\`\`

   Görüntüleyici \`http://localhost:9998\` adresinde mevcut olacak

## 🖥️ Kullanım

### Başlangıç

1. **Sunucuyu başlat**: \`npm start\`
2. **Tarayıcınızı açın**: \`http://127.0.0.1:9998\` adresine gidin
3. **İlk profilinizi ekleyin**: "+ Sekme Ekle" düğmesine tıklayın
4. **Görevlerinizi yönetin**: Sekmeler arasında geçiş yapın, görevleri arayın ve sıralayın

### Sekme Yönetimi
- **Profil Değiştir**: O profile geçmek için herhangi bir sekmeye tıklayın
- **Sekmeleri Yeniden Sırala**: Sekmeleri tercih ettiğiniz sırada yeniden düzenlemek için sürükleyin
- **Yeni Profil Ekle**: "+ Sekme Ekle" düğmesine tıklayın
- **Profil Kaldır**: Herhangi bir sekmedeki × işaretine tıklayın

## 🔧 Yapılandırma

### Çevre Değişkenleri
\`\`\`bash
SHRIMP_VIEWER_PORT=9998           # Sunucu portu (varsayılan: 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Sunucu host (sadece localhost)
OPENAI_API_KEY=sk-...             # AI ajan ataması için OpenAI API anahtarı
\`\`\`

### Geliştirme Yapılandırması
- **Hot reload ile geliştirme**: \`npm run start:all\`
- **Sadece API sunucusu**: \`npm start\`
- **Üretim için oluştur**: \`npm run build && npm start\`

## 🐛 Sorun Giderme

### Yaygın Sorunlar

**Sunucu Başlamıyor**
\`\`\`bash
# Port kullanımda mı kontrol et
lsof -i :9998

# Mevcut işlemleri öldür
pkill -f "node.*server.js"

# Farklı port dene
SHRIMP_VIEWER_PORT=8080 node server.js
\`\`\`

**Hot Reload Çalışmıyor**
\`\`\`bash
# Geliştirme bağımlılıklarının yüklendiğinden emin olun
npm install

# Geliştirme sunucusunu yeniden başlatın
npm run dev
\`\`\`

## 📄 Lisans

MIT Lisansı - detaylar için ana proje lisansına bakın.

## 🤝 Katkıda Bulunma

Bu araç MCP Shrimp Görev Yöneticisi projesinin parçasıdır. Katkılar memnuniyetle karşılanır!

---

**İyi görev yönetimi! 🦐✨**

React, Vite ve modern web teknolojileri kullanılarak ❤️ ile yapılmıştır.`
  }
};