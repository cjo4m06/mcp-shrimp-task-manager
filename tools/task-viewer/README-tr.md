# 🦐 Shrimp Görev Yöneticisi Görüntüleyici

MCP (Model Context Protocol) aracı ile oluşturulan [Shrimp Görev Yöneticisi](https://github.com/cjo4m06/mcp-shrimp-task-manager) görevlerini görüntülemek ve yönetmek için modern, React tabanlı web arayüzü. Bu görsel arayüz detaylı görev bilgilerini görmenizi, birden çok proje arasında ilerlemeyi takip etmenizi ve AI ajan etkileşimleri için görev UUID'lerini kolayca kopyalamanızı sağlar.

## Neden Shrimp Görev Görüntüleyicisini Kullanmalısınız?

Shrimp Görev Yöneticisini Claude gibi AI ajanlarıyla MCP sunucusu olarak kullanırken, bu görüntüleyici görev ekosistemine temel görünürlük sağlar:

- **Görsel Görev Genel Bakışı**: Temiz sekmeli arayüzde tüm görevleri, durumlarını, bağımlılıklarını ve ilerlemelerini görün
- **UUID Yönetimi**: `"Görev yöneticisini kullanarak bu shrimp görevini tamamla: [UUID]"` gibi komutlar için UUID'sini anında kopyalamak üzere herhangi bir görev rozetine tıklayın
- **Paralel Yürütme**: Birden çok terminal açın ve paralel AI ajan yürütmesi için görev talimatlarını kopyalamak üzere AI Eylemler sütununu (🤖) kullanın
- **Canlı Güncellemeler**: Doğrudan dosya yolu okuma, her zaman güncel görev durumunu görmenizi sağlar
- **Çok Projeli Destek**: Sürüklenebilir profil sekmeleriyle farklı projeler arasında görevleri yönetin

Shrimp Görev Yöneticisini MCP sunucusu olarak kurma hakkında bilgi için [ana repository](https://github.com/cjo4m06/mcp-shrimp-task-manager)'ye bakın.

## 📖 Detaylı Sayfa Belgelendirmesi

### 📋 Görevler Sayfası

Ana Görevler sayfası görev yönetimi için komuta merkezinizdir. Seçili profildeki tüm görevlerin organizasyon ve yürütme için güçlü özelliklerle kapsamlı görünümünü sağlar.

![Görevler Sayfası Genel Bakış](task-viewer-interface.png)

**Temel Özellikler:**
- **Görev Tablosu**: Görev #, Durum, Ajan, Oluşturma Tarihi, Adı, Bağımlılıklar ve Eylemler dahil sırlanabilir sütunlarla tüm görevleri gösterir
- **Durum Rozetleri**: Renk kodlu rozetler (🟡 Bekleyen, 🔵 Devam Eden, 🟢 Tamamlandı, 🔴 Engellendi)
- **Ajan Atama**: Görevlere özel AI ajanları atamak için dropdown seçici
- **Ajan Görüntüleyici Popup'ı**: Ajanları tarayabileceğiniz ve seçebileceğiniz popup'ı açmak için göz simgesine (👁️) tıklayın
- **Bağımlılıklar Sütunu**: Tıkla-git fonksiyonuyla bağlantılı görev ID'lerini gösterir
- **Eylemler Sütunu**: AI görev yürütme için güçlü robot emojisi (🤖) içerir
- **Görev Detay Navigasyonu**: Görev detaylarını görüntülerken, görevler arasında hızla gezinmek için ← Önceki ve Sonraki → düğmelerini kullanın

#### 🤖 Robot Emojisi - AI Görev Yürütme

Eylemler sütunundaki robot emojisi AI destekli görev yürütme için güçlü bir özelliktir:

![Robot Emojisi Tooltip](releases/agent-copy-instruction-tooltip.png)

**Nasıl çalışır:**
1. **🤖 emojisine tıklayın** görev yürütme talimatını panonuza kopyalamak için
2. **Ajanlı görevler için**: `use the built in subagent located in ./claude/agents/[agent-name] to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress` kopyalar
3. **Ajansız görevler için**: `Use task manager to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress` kopyalar
4. **Görsel Geri Bildirim**: Kopyalama eylemini onaylamak için emoji kısaca ✓'ya değişir

**Kullanım Durumları:**
- **Paralel Yürütme**: Farklı AI ajanlarıyla birden çok terminal penceresi açın ve eş zamanlı görev işleme için talimatları yapıştırın
- **Ajan Uzmanlaşması**: Uygun görevlere özelleşmiş ajanlar (ör. `react-components.md`, `database-specialist.md`) atayın
- **Hızlı Devretme**: Karmaşık komutlar yazmadan görevleri AI ajanlarına hızla devrerin

#### 🤖 AI Destekli Toplu Ajan Ataması

Görevler sayfası artık OpenAI GPT-4 kullanarak AI destekli toplu ajan ataması içeriyor:

**Nasıl kullanılır:**
1. **Görevleri Seç**: Ajan ataması gereken birden çok görevi seçmek için onay kutularını kullanın
2. **Toplu Eylemler Çubuğu**: "🤖 AI Ajan Ata (X görev seçildi)" gösteren mavi çubuk belirir
3. **Tek Tıkla Atama**: GPT-4'ün görevleri analiz edip uygun ajanları ataması için düğmeye tıklayın
4. **Otomatik Eşleştirme**: AI görev açıklamalarını, bağımlılıklarını ve ajan yeteneklerini değerlendirir

**Kurulum Gereksinimleri:**
1. **API Anahtarını Yapılandır**: Ayarlar → Genel Ayarlar'a gidin
2. **OpenAI Anahtarını Gir**: OpenAI API anahtarınızı alana yapıştırın (ayarlandığında ✓ Yapılandırıldı görünür)
3. **Alternatif Yöntem**: `OPENAI_API_KEY` veya `OPEN_AI_KEY_SHRIMP_TASK_VIEWER` çevre değişkenini ayarlayın
4. **API Anahtarı Al**: Anahtar oluşturmak için [OpenAI Platformu](https://platform.openai.com/api-keys) ziyaret edin

![Genel Ayarlar OpenAI Anahtarı](releases/global-settings-openai-key.png)
*Genel Ayarlar sayfası OpenAI API anahtarınızı yapılandırmak için güvenli alan sağlar*

#### 📝 Görev Detayları Görünümü

Kapsamlı bilgilerle detaylı görev görünümünü açmak için herhangi bir görev satırına tıklayın:

**Özellikler:**
- **Tam Görev Bilgisi**: Açıklamaları, notları, uygulama kılavuzlarını ve doğrulama kriterlerini tam görüntüle
- **Görev Navigasyonu**: Listeye dönmeden görevler arasında geçmek için ← Önceki ve Sonraki → düğmelerini kullanın
- **İlgili Dosyalar**: Satır numaralarıyla görevle ilişkilendirilmiş tüm dosyaları görün
- **Bağımlılık Grafiği**: Görev bağımlılıklarının görsel temsili
- **Düzenleme Modu**: Görev detaylarını değiştirmek için Düzenle'ye tıklayın (tamamlanmamış görevler için)
- **Hızlı Eylemler**: Görev ID'sini kopyala, ham JSON'ı görüntüle veya görevi sil

**Navigasyon Faydaları:**
- **Verimli İnceleme**: Birden çok görevi sırayla hızla inceleyin
- **Bağlam Koruma**: Görevler arasında geçerken detay görünümünde kalın
- **Klavye Desteği**: Daha da hızlı navigasyon için ok tuşlarını kullanın

### 📜 Proje Geçmişi Sayfası

Proje Geçmişi sayfası, Shrimp Görev Yöneticisi tarafından kaydedilen tamamlanmış görevlerin anlık görüntülerini göstererek projenizin evrimine değerli içgörüler sağlar.

![Proje Geçmişi Genel Bakış](releases/project-history-view.png)

**Özellikler:**
- **Zaman Çizelgesi Görünümü**: Projenizin görev durumlarının geçmiş anlık görüntülerini tarayın
- **Bellek Dosyaları**: Yeni oturumlar başlatırken Shrimp Görev Yöneticisi tarafından otomatik olarak kaydedilir
- **Görev Evrimi**: Görevlerin oluşturulma ile tamamlanma arasında nasıl ilerlediğini takip edin
- **Not Sistemi**: Geçmiş girişlere kişisel açıklamalar ekleyin

![Proje Geçmişi Detay](releases/project-history-detail-view.png)

**Navigasyon:**
- O andaki detaylı görev durumunu görmek için herhangi bir geçmiş girişe tıklayın
- Farklı anlık görüntüler arasında geçmek için navigasyon düğmelerini kullanın
- Ana görevler görünümündeki gibi geçmiş görevleri ara ve filtrele

### 🤖 Alt-Ajanlar Sayfası

Alt-Ajanlar sayfası optimal yürütme için görevlere atanabilen özelleşmiş AI ajanları yönetmenizi sağlar.

![AI Talimatı ile Ajan Liste Görünümü](releases/agent-list-view-with-ai-instruction.png)

**Özellikler:**
- **Ajan Kütüphanesi**: `.claude/agents` klasörünüzdeki tüm mevcut ajanları görüntüleyin
- **AI Talimat Sütunu**: Ajan kullanım talimatlarını anında kopyalamak için robot emojisine (🤖) tıklayın
  - Örnek: `use subagent debugger.md located in ./claude/agents to perform:`
  - Ajan yollarını manuel olarak yazmaya veya sözdizimini hatırlamaya gerek yok
  - Görsel geri bildirim panoya başarılı kopyayı onaylar
- **Ajan Editörü**: Ajanlar oluşturmak ve değiştirmek için yerleşik markdown editörü
- **Renk Kodlama**: Görsel organizasyon için ajanlara renkler atayın
- **Ajan Atama**: Görev tablosundaki dropdown ile görevlere kolayca ajan atayın
- **Ajan Görüntüleyici Popup'ı**: Ajanları taramak ve seçmek için göz simgesine (👁️) tıklayın

![Ajan Editörü](releases/agent-editor-color-selection.png)

**Ajan Atama İş Akışı:**

![Ajan Dropdown'ı](releases/agent-dropdown-task-table.png)

1. **Bir ajan seçin** görev tablosundaki dropdown'dan
2. **Veya göz simgesine (👁️) tıklayın** ajan görüntüleyici popup'ını açmak için
3. **Ajanları tarayın** popup'ta göreviniz için doğru olanı bulmak için
4. **Otomatik kaydet** görevin metadata'sını günceller
5. **Robot emojisini kullanın** ajana özel yürütme talimatlarını kopyalamak için

![Ajan Görüntüleyici Popup'ı](releases/agent-viewer-popup.png)
*Ajan görüntüleyici popup'ı tüm mevcut ajanları taramanızı ve her görev için en iyisini seçmenizi sağlar*

### 🎨 Şablonlar Sayfası

Shrimp Görev Yöneticisinin farklı operasyon türlerini nasıl analiz edip yürüttüğünü yönlendiren AI talimat şablonlarını yönetin.

![Şablon Yönetimi](releases/template-management-system.png)

**Yetenekler:**
- **Şablon Editörü**: Sözdizimi vurgulamalı tam markdown editörü
- **Şablon Türleri**: Varsayılan, Özel ve Özel+Ekle durumları
- **Canlı Önizleme**: Etkinleştirmeden önce şablon etkilerini görün
- **Dışa/İçe Aktarma**: Şablonları ekip üyeleriyle paylaşın

### ⚙️ Genel Ayarlar

Global ajanlara erişmek için Claude klasör yolu dahil sistem genelindeki ayarları yapılandırın.

**Ayarlar Şunları İçerir:**
- **Claude Klasör Yolu**: Global `.claude` klasörünüze yolu ayarlayın
- **API Anahtarı Yapılandırması**: AI hizmetleri için çevre değişkenlerini yönetin
- **Dil Tercihleri**: Desteklenen diller arasında geçiş yapın

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

### 📊 Kapsamlı Görev Yönetimi
- **Görev İstatistikleri**: Toplam, Tamamlanmış, Devam Eden ve Bekleyen görevler için canlı sayımlar
- **Profil Yönetimi**: Sezgisel arayüz ile profil ekle/kaldır/yeniden sırala
- **Kalıcı Ayarlar**: Oturumlar arası kaydedilen profil yapılandırmaları
- **Hot Reload**: Anında güncellemelerle geliştirme modu

### 🤖 AI Destekli Özellikler
- **Toplu Ajan Ataması**: Birden çok görev seçin ve en uygun ajanları otomatik atamak için GPT-4 kullanın
- **OpenAI Entegrasyonu**: API anahtarınızı Genel Ayarlar'da veya çevre değişkenleri ile yapılandırın
- **Akıllı Eşleştirme**: AI optimal atamalar için görev açıklamalarını ve ajan yeteneklerini analiz eder
- **Hata Rehberliği**: API anahtarı yapılandırılmadıysa net talimatlar

### 📚 Sürüm Kontrolü ve Geçmiş
- **Git Entegrasyonu**: Otomatik Git commit'leri zaman damgalı mesajlarla tasks.json'daki her değişikliği takip eder
- **Tam Denetim İzi**: Standart Git araçlarını kullanarak görev değişikliklerinin tam geçmişini inceleyin
- **Engelleyici Olmayan İşlemler**: Git arızaları görev yönetimini kesintiye uğratmaz
- **İzole Edilmiş Repository**: Görev geçmişi proje repository'nizden ayrı olarak takip edilir

### 🎨 Profesyonel UI/UX
- **Karanlık Tema**: Geliştirme ortamları için optimize edilmiş
- **Duyarlı Düzen**: Tüm ekran boyutlarına uyum sağlar
- **Erişilebilirlik**: Tam klavye navigasyonu ve ekran okuyucu desteği
- **Etkileşimli Öğeler**: Uygulama genelinde hover tooltip'leri ve görsel geri bildirim

## 🚀 Hızlı Başlangıç

### Kurulum ve Kurulum

1. **Klonla ve görev görüntüleyici dizinine git**
   ```bash
   cd yol/to/mcp-shrimp-task-manager/tools/task-viewer
   ```

2. **Bağımlılıkları yükle**
   ```bash
   npm install
   ```

3. **React uygulamasını oluştur**
   ```bash
   npm run build
   ```

4. **Sunucuyu başlat**
   ```bash
   npm start
   ```

   Görüntüleyici `http://localhost:9998` adresinde mevcut olacak

### Geliştirme Modu

Hot reload ile geliştirme için:

```bash
# Hem API sunucusunu hem de geliştirme sunucusunu başlat
npm run start:all

# Veya ayrı ayrı çalıştır:
npm start          # 9998 portunda API sunucusu
npm run dev        # 3000 portunda Vite dev sunucusu
```

Uygulama dosya değişikliklerinde otomatik yeniden oluşturma ile `http://localhost:3000` adresinde mevcut olacak.

### Üretim Dağıtımı

#### Standart Dağıtım

```bash
# Üretim için oluştur
npm run build

# Üretim sunucusunu başlat
npm start
```

#### Systemd Hizmeti (Linux)

Otomatik başlangıç ve süreç yönetimi için:

1. **Hizmet olarak yükle**
   ```bash
   sudo ./install-service.sh
   ```

2. **Hizmeti yönet**
   ```bash
   # Durumu kontrol et
   systemctl status shrimp-task-viewer
   
   # Başlat/durdur/yeniden başlat
   sudo systemctl start shrimp-task-viewer
   sudo systemctl stop shrimp-task-viewer
   sudo systemctl restart shrimp-task-viewer
   
   # Logları görüntüle
   journalctl -u shrimp-task-viewer -f
   
   # Otomatik başlatmayı devre dışı bırak/etkinleştir
   sudo systemctl disable shrimp-task-viewer
   sudo systemctl enable shrimp-task-viewer
   ```

3. **Hizmeti kaldır**
   ```bash
   sudo ./uninstall-service.sh
   ```

## 🖥️ Kullanım

### Başlangıç

1. **Sunucuyu başlat**:
   ```bash
   npm start
   ```
   
   **Not**: Uygulamayı henüz oluşturmadıysanız veya hot reload ile geliştirme modu kullanmak istiyorsanız, bunun yerine `npm run start:all` kullanın.

2. **Tarayıcınızı açın**:
   `http://127.0.0.1:9998` (üretim) veya `http://localhost:3000` (geliştirme) adresine gidin

3. **İlk profilinizi ekleyin**:
   - "**+ Sekme Ekle**" düğmesine tıklayın
   - Açıklayıcı profil adı girin (ör. "Takım Alpha Görevleri")
   - tasks.json içeren shrimp veri klasörünüzün yolunu girin
   - **İpucu:** Terminalden klasörünüze gidip tam yolu almak için `pwd` yazın
   - "**Profil Ekle**"ye tıklayın

4. **Görevlerinizi yönetin**:
   - Sekmeleri kullanarak profiller arasında geçiş yapın
   - Arama kutusunu kullanarak görevleri arayın
   - Başlıklara tıklayarak sütunları sıralayın
   - Gerektiğinde otomatik yenilemeyi yapılandırın

### Sekme Yönetimi

- **Profil Değiştir**: O profile geçmek için herhangi bir sekmeye tıklayın
- **Sekmeleri Yeniden Sırala**: Sekmeleri tercih ettiğiniz sırada yeniden düzenlemek için sürükleyin
- **Yeni Profil Ekle**: "**+ Sekme Ekle**" düğmesine tıklayın
- **Profil Kaldır**: Herhangi bir sekmedeki × işaretine tıklayın (onaylamayla)

### Arama ve Filtreleme

- **Global Arama**: Tüm görev alanlarında filtrelemek için arama kutusuna yazın
- **Sütun Sıralama**: Sıralamak için herhangi bir sütun başlığına tıklayın (tersine çevirmek için tekrar tıklayın)
- **Sayfalama**: Yerleşik sayfalama kontrolleriyle büyük görev listelerinde gezinin
- **Gerçek Zamanlı Güncellemeler**: Yazdığınız anda arama ve sıralama güncellenir

### Otomatik Yenileme Yapılandırması

1. **Otomatik Yenilemeyi Etkinleştir**: "Otomatik yenileme" onay kutusunu işaretleyin
2. **Aralığı Ayarla**: Dropdown'dan seçin (5s'den 5m'ye)
3. **Manuel Yenileme**: Anında yenileme için istediğiniz zaman 🔄 düğmesine tıklayın
4. **Görsel Geri Bildirim**: Yenileme işlemleri sırasında spinner gösterir

## 🔧 Yapılandırma

### Çevre Değişkenleri

Çevre değişkenlerini terminal oturumları arasında kalıcı hale getirmek için shell yapılandırma dosyanıza ekleyin:

**Zsh ile macOS/Linux** (modern macOS'ta varsayılan):
```bash
# ~/.zshrc dosyasına ekle
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.zshrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.zshrc

# Yapılandırmayı yeniden yükle
source ~/.zshrc
```

**Bash ile Linux/Unix**:
```bash
# ~/.bashrc dosyasına ekle
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.bashrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.bashrc

# Yapılandırmayı yeniden yükle
source ~/.bashrc
```

**Shell yapılandırmasına neden eklensin?**
- **Kalıcılık**: Terminalde `export` ile ayarlanan değişkenler sadece o oturum için geçerlidir
- **Tutarlılık**: Tüm yeni terminal pencereleri bu ayarlara sahip olacak
- **Kolaylık**: Sunucuyu her başlattığınızda değişkenleri ayarlamanıza gerek yok

**Mevcut Değişkenler**:
```bash
SHRIMP_VIEWER_PORT=9998           # Sunucu portu (varsayılan: 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Sunucu host (sadece localhost)
OPENAI_API_KEY=sk-...             # AI ajan ataması için OpenAI API anahtarı
OPEN_AI_KEY_SHRIMP_TASK_VIEWER=sk-...  # OpenAI anahtarı için alternatif env var
```

### Geliştirme Yapılandırması

- **Hot reload ile geliştirme (geliştirme için önerilen)**:
  ```bash
  npm run start:all  # API sunucusu (9998) + Vite dev sunucusu (3000) çalıştırır
  ```
  
  **Neden start:all kullanılsın?** Bu komut hem API sunucusunu hem de Vite dev sunucusunu aynı anda çalıştırır. Tam API fonksiyonuna sahipken UI değişiklikleri için anında hot module replacement (HMR) alırsınız. Değişiklikleriniz `http://localhost:3000` adresinde manuel yenileme olmadan anında tarayıcıda görünür.

- **Sadece API sunucusu (üretim veya API testi için)**:
  ```bash
  npm start  # 9998 portunda çalışır
  ```
  
  **Neden sadece API sunucusu kullanılsın?** Üretim dosyalarını oluşturduğunuzda ve uygulamanın tamamını üretimde çalışacağı gibi test etmek istediğinizde veya sadece API endpoint'lerine ihtiyaç duyduğunuzda bunu kullanın.

- **Üretim için oluştur ve servis et**:
  ```bash
  npm run build && npm start  # Oluştur sonra 9998 portunda servis et
  ```
  
  **Neden üretim için oluşturulsun?** Üretim oluşturması JavaScript'i minify ederek, ölü kodu kaldırarak ve varlıkları verimli şekilde paketleyerek kodunuzu optimize eder. Bu, son kullanıcılar için daha hızlı yükleme süreleri ve daha iyi performans sağlar. Dağıtırken her zaman üretim oluşturmasını kullanın.

### Profil Veri Depolama

**Profil Veri Yönetimini Anlamak**: Görev Görüntüleyici hem kalıcılığı hem de gerçek zamanlı doğruluğu önceliklendiren karma veri depolama yaklaşımı kullanır. Profil yapılandırmaları (sekme adları, klasör yolları ve sekme sırası gibi) ana dizininizde JSON ayarlar dosyasında yerel olarak depolanırken, görev verileri gerçek zamanlı olarak proje klasörlerinizden doğrudan okunur.

- **Ayarlar Dosyası**: `~/.shrimp-task-viewer-settings.json`
  
  Ana dizininizdeki bu gizli dosya sekme adları, klasör yolları, sekme sıralaması ve diğer tercihler dahil tüm profil yapılandırmalarınızı depolar. İlk profilinizi eklediğinizde otomatik olarak oluşturulur ve değişiklik yaptığınızda güncellenir. Gerekirse bu dosyayı manuel olarak düzenleyebilirsiniz, ancak geçerli JSON formatını korumaya dikkat edin.

- **Görev Dosyaları**: Belirtilen klasör yollarından doğrudan okunur (yükleme yok)
  
  Dosya kopyalarını yükleyip depolayan geleneksel web uygulamalarının aksine, Görev Görüntüleyici `tasks.json` dosyalarını belirtilen klasör yollarınızdan doğrudan okur. Bu, yeniden yükleme veya senkronizasyon ihtiyacı olmadan her zaman görevlerinizin güncel durumunu görmenizi sağlar. Profil eklediğinizde, görüntüleyiciye tasks.json dosyasını nerede arayacağını söylüyorsunuz.

- **Hot Reload**: Geliştirme değişiklikleri otomatik olarak yeniden oluşturulur
  
  Geliştirme modunda (`npm run dev`) çalışırken, kaynak kodundaki herhangi bir değişiklik otomatik yeniden oluşturma ve tarayıcı yenilemelerini tetikler. Bu React bileşenleri, stiller ve sunucu koduna uygulanır, geliştirmeyi daha hızlı ve verimli hale getirir.

### Git Görev Geçmişi

**Otomatik Sürüm Kontrolü**: v3.0'dan başlayarak, Shrimp Görev Yöneticisi Git kullanarak tüm görev değişikliklerini otomatik olarak takip eder. Bu, manuel yapılandırma olmadan tam denetim izi sağlar.

- **Repository Konumu**: `<shrimp-data-directory>/.git`
  
  Her proje `.mcp.json` dosyanızda yapılandırılan veri dizininde kendi Git repository'sini alır. Bu, projenizin ana Git repository'sinden tamamen ayrıdır, herhangi bir çakışma veya müdahaleyi önler.

- **Geçmişi Görüntüleme**: Görev geçmişini keşfetmek için standart Git komutlarını kullanın
  ```bash
  cd <shrimp-data-directory>
  git log --oneline          # Commit geçmişini görüntüle
  git show <commit-hash>     # Belirli değişiklikleri gör
  git diff HEAD~5            # 5 commit öncesiyle karşılaştır
  ```

- **Commit Formatı**: Tüm commit'ler zaman damgaları ve açıklayıcı mesajlar içerir
  ```
  [2025-08-07T13:45:23-07:00] Yeni görev ekle: Kullanıcı kimlik doğrulaması uygula
  [2025-08-07T14:12:10-07:00] Görevi güncelle: Giriş doğrulamasını düzelt
  [2025-08-07T14:45:55-07:00] Toplu görev operasyonu: ekleme modu, 6 görev
  ```

- **Kurtarma**: Gerekirse önceki görev durumlarını geri yükleyin
  ```bash
  cd <shrimp-data-directory>
  git checkout <commit-hash> -- tasks.json  # Belirli sürümü geri yükle
  git reset --hard <commit-hash>            # Önceki duruma tam reset
  ```

## 🏗️ Teknik Mimari

### Teknoloji Yığını

- **Frontend**: Hot reload geliştirme için React 19 + Vite
- **Tablo Bileşeni**: Gelişmiş tablo özellikleri için TanStack React Table
- **Stillendirme**: Karanlık tema ve duyarlı tasarımla özel CSS
- **Backend**: RESTful API ile Node.js HTTP sunucusu
- **Oluşturma Sistemi**: Hızlı geliştirme ve optimize edilmiş üretim oluşturmaları için Vite

### Dosya Yapısı

**Proje Organizasyonu**: Görev Görüntüleyici endişeleri ayıran ve kod tabanını gezinmesi ve genişletmesi kolay hale getiren temiz, modüler yapıyı takip eder. Her dizin ve dosya uygulama mimarisinde belirli bir amaca sahiptir.

```
task-viewer/
├── src/                       # React uygulama kaynak kodu
│   ├── App.jsx               # Ana React bileşeni - durum, profiller ve sekmeleri yönetir
│   ├── components/           # Yeniden kullanılabilir React bileşenleri
│   │   ├── TaskTable.jsx     # Görevleri görüntülemek ve sıralamak için TanStack tablosu
│   │   ├── Help.jsx          # Markdown render ile README görüntüleyici
│   │   └── ReleaseNotes.jsx  # Sözdizimi vurgulama ile sürüm geçmişi
│   ├── data/                 # Statik veri ve yapılandırma
│   │   └── releases.js       # Release metadata ve sürüm bilgisi
│   └── index.css             # Karanlık tema ile tam stillendirme sistemi
├── releases/                  # Release notları markdown dosyaları ve resimler
│   ├── v*.md                 # Bireysel release not dosyaları
│   └── *.png                 # Release'ler için ekran görüntüleri ve resimler
├── dist/                     # Üretim oluşturma çıktısı (otomatik oluşturulan)
│   ├── index.html            # Optimize edilmiş HTML giriş noktası
│   └── assets/               # Paketlenmiş JS, CSS ve diğer varlıklar
├── server.js                 # Express tarzı Node.js API sunucusu
├── cli.js                    # Hizmet yönetimi için komut satırı arayüzü
├── vite.config.js            # Geliştirme/üretim için oluşturma aracı yapılandırması
├── package.json              # Proje metadata, bağımlılıklar ve npm scriptleri
├── install-service.sh        # Linux systemd hizmet yükleyici
└── README.md                 # Kapsamlı dokümantasyon (bu dosya)
```

**Temel Dizinler Açıklandı**:

- **`src/`**: Tüm React kaynak kodunu içerir. UI değişikliklerinin çoğunu burada yapacaksınız.
- **`dist/`**: Otomatik oluşturulan üretim oluşturması. Bu dosyaları asla doğrudan düzenlemeyin.
- **`releases/`**: İlişkili resimlerle markdown formatında release notlarını depolar.
- **Kök dosyalar**: Oluşturma, servis etme ve dağıtımı işleyen yapılandırma ve sunucu dosyaları.

### API Endpoint'leri

- `GET /` - React uygulamasını servis eder
- `GET /api/agents` - Tüm yapılandırılmış profilleri listeler
- `GET /api/tasks/{profileId}` - Belirli profil için görevleri döndürür
- `POST /api/add-profile` - Klasör yoluyla yeni profil ekler
- `DELETE /api/remove-profile/{profileId}` - Profili kaldırır
- `PUT /api/rename-profile/{profileId}` - Profili yeniden adlandırır
- `PUT /api/update-profile/{profileId}` - Profil ayarlarını günceller
- `GET /api/readme` - Yardım sekmesi için README içeriğini döndürür
- `GET /releases/*.md` - Release notları markdown dosyalarını servis eder
- `GET /releases/*.png` - Release notları resimlerini servis eder

## 🛠️ Geliştirme

### Geliştirme Ortamını Kurma

```bash
# Bağımlılıkları yükle
npm install

# Hot reload ile geliştirme sunucusunu başlat
npm run dev

# Geliştirme sunucusu http://localhost:3000 üzerinde çalışır
# Backend API sunucusu http://localhost:9998 üzerinde çalışır
```

### Üretim için Oluşturma

```bash
# Optimize edilmiş üretim paketi oluştur
npm run build

# Dosyalar dist/ dizininde oluşturulur
# Üretim sunucusunu başlat
npm start
```

### Arayüzü Genişletme

Modüler React mimarisi genişletmeyi kolaylaştırır:

1. **Yeni Bileşenler Ekle**: `src/components/` altında oluştur
2. **Stillendirmeyi Değiştir**: CSS özel özellikleriyle `src/index.css` düzenle
3. **Özellik Ekle**: Yeni durum ve fonksiyonla `App.jsx` genişlet
4. **API Entegrasyonu**: `server.js`'te endpoint'ler ekle

## 🔒 Güvenlik ve Performans

### Güvenlik Özellikleri

- **Localhost Bağlama**: Sunucu sadece yerel makineden erişilebilir
- **Doğrudan Dosya Erişimi**: Görev dosyalarını doğrudan dosya sistemi yollarından okur
- **Dış Bağımlılık Yok**: Minimal saldırı yüzeyiyle kendi kendine yeterli
- **CORS Koruması**: API endpoint'leri CORS başlıklarıyla korunur

### Performans Optimizasyonları

- **Hot Module Replacement**: Anında geliştirme güncellemeleri
- **Code Splitting**: Optimize edilmiş paket yükleme
- **Verimli Yeniden Render**: React optimizasyon desenleri
- **Önbellekleme**: Daha hızlı yüklemeler için statik varlık önbelleklemesi
- **Duyarlı Resimler**: Tüm cihaz boyutları için optimize edilmiş

## 🐛 Sorun Giderme

### Yaygın Sorunlar

**Sunucu Başlamıyor**
```bash
# Port kullanımda mı kontrol et
lsof -i :9998

# Mevcut işlemleri öldür
pkill -f "node.*server.js"

# Farklı port dene
SHRIMP_VIEWER_PORT=8080 node server.js
```

**Yardım/Readme Sekmesi HTML Gösteriyor**
Yardım sekmesi README içeriği yerine HTML görüntülüyorsa, yeni API endpoint'lerini yüklemek için sunucunun yeniden başlatılması gerekir:
```bash
# Sunucuyu durdurun (Ctrl+C) ve yeniden başlatın
npm start
```

**Hot Reload Çalışmıyor**
```bash
# Geliştirme bağımlılıklarının yüklendiğinden emin olun
npm install

# Geliştirme sunucusunu yeniden başlatın
npm run dev
```

**Görevler Yüklenmiyor**
1. `tasks.json` dosyalarının geçerli JSON içerdiğini kontrol edin
2. Dosya izinlerinin okunabilir olduğunu doğrulayın
3. Hata mesajları için tarayıcı konsolunu kontrol edin
4. Verileri yeniden yüklemek için manuel yenileme düğmesini kullanın

**Oluşturma Hataları**
```bash
# node_modules'ü temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install

# Vite önbelleğini temizle
rm -rf dist/
npm run build
```

## 📋 Değişiklik Günlüğü

### Sürüm 2.1.0 (En Son) - 2025-07-29

#### 🚀 Ana Özellikler
- **Doğrudan Dosya Yolu Desteği**: Canlı güncellemeler için dosya yüklemeyi doğrudan klasör yolu girişi ile değiştirdi
- **Yardım/Readme Sekmesi**: Markdown render ile dokümantasyon sekmesi eklendi
- **Release Notları Sekmesi**: Resim desteğiyle uygulama içi release notları görüntüleyici  
- **Tıklanabilir Bağımlılıklar**: Bağımlı görevler arasında kolayca gezinin
- **AI Eylemler Sütunu**: Görev tamamlama için AI talimatlarını kopyalayın
- **Geliştirilmiş UUID Yönetimi**: UUID'leri kopyalamak için görev rozetlerine tıklayın
- **Profil Düzenleme**: Profilleri yeniden adlandırın ve proje köklerini yapılandırın
- **ES Modül Desteği**: Daha iyi uyumluluk için ES modüllerine dönüştürüldü

#### 🐛 Kritik Düzeltme
- **Statik Dosya Kopyalama Sorunu Düzeltildi**: Dosyalar artık `/tmp/`'de statik kopyalar oluşturmak yerine belirtilen yollardan doğrudan okunur

### Sürüm 1.0.3 - 2025-07-26

#### 🧪 Test ve Güvenilirlik
- **Kapsamlı Test Paketi**: Vitest ile tam test kapsamı eklendi
- **Bileşen Testleri**: Tüm bileşenler için React Testing Library testleri
- **Entegrasyon Testleri**: Sunucu ve API endpoint'lerinin uçtan uca testi
- **Hata Düzeltmeleri**: Profil yönetiminde multipart form data işleme çözüldü

### Sürüm 1.0.2 - 2025-07-26

#### 🎨 Görev Detay Görünümü
- **Sekme İçi Navigasyon**: Modal'ı sorunsuz sekme içi görev detaylarıyla değiştirdi
- **Geri Düğmesi**: Görev listesine kolay navigasyon
- **Geliştirilmiş UX**: Popup kesintileri olmadan daha iyi iş akışı

### Sürüm 1.0.1 - 2025-07-13

#### 🎨 Ana UI İyileştirmesi
- **Modern Sekme Arayüzü**: Sürükle ve bırak yeniden sıralama ile profesyonel tarayıcı tarzı sekmeler
- **Bağlantılı Tasarım**: Sekmeler ve içerik arasında sorunsuz görsel bağlantı
- **Geliştirilmiş Düzen**: Daha iyi iş akışı için yeniden konumlandırılmış arama ve kontroller

#### ⚡ Geliştirilmiş İşlevsellik  
- **Yapılandırılabilir Otomatik Yenileme**: 5 saniyeden 5 dakikaya kadar aralıklar seçin
- **Gelişmiş Arama**: Tüm görev alanlarında gerçek zamanlı filtreleme
- **Sırlanabilir Sütunlar**: Herhangi bir sütuna göre sıralamak için başlıklara tıklayın
- **Hot Reload Geliştirme**: Geliştirme sırasında anında güncellemeler

#### 🔧 Teknik İyileştirmeler
- **React Mimarisi**: React 19 + Vite kullanarak tam yeniden yazım
- **TanStack Table**: Sayfalama ile profesyonel tablo bileşeni
- **Duyarlı Tasarım**: Kırılma noktası optimizasyonu ile mobil öncelikli yaklaşım
- **Performans**: Optimize edilmiş render ve verimli durum yönetimi

### Sürüm 1.0.0 - 2025-07-01

#### 🚀 İlk Release
- **Temel Görüntüleyici**: Temel web arayüzü ile ilk uygulama
- **Profil Yönetimi**: Görev profilleri ekleme ve kaldırma
- **Sunucu API**: Görev verileri için RESTful endpoint'ler
- **Görev Görüntüleme**: Birden çok projeden görevleri görüntüle

## 📄 Lisans

MIT Lisansı - detaylar için ana proje lisansına bakın.

## 🤝 Katkıda Bulunma

Bu araç MCP Shrimp Görev Yöneticisi projesinin parçasıdır. Katkılar memnuniyetle karşılanır!

1. Repository'yi fork edin
2. Özellik dalı oluşturun (`git checkout -b feature/harika-ozellik`)
3. Uygun test ile değişikliklerinizi yapın
4. Değişikliklerinizi commit edin (`git commit -m 'Harika özellik ekle'`)
5. Dala push edin (`git push origin feature/harika-ozellik`)
6. Pull request gönderin

### Geliştirme Kılavuzları

- React en iyi uygulamalarını ve hooks desenlerini takip edin
- Duyarlı tasarım ilkelerini koruyun
- Uygulanabilir yerlerde uygun TypeScript tipleri ekleyin
- Farklı tarayıcı ve cihazlarda test edin
- Yeni özellikler için dokümantasyonu güncelleyin

---

**İyi görev yönetimi! 🦐✨**

React, Vite ve modern web teknolojileri kullanılarak ❤️ ile yapılmıştır.