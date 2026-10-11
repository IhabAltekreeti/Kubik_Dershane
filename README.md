# kübik+ — Öğrenme Atölyesi

Bu dal, eski demo arayüzünden bağımsız olarak tasarlanmış bir ürün deneyimidir. Ana `main` dalı değiştirilmemiştir.

## Ürün akışı

1. Öğrenci profili olarak LGS veya YKS örneği seçilir.
2. Öğrenci soruyu yanıtlar ve adım odaklı geri bildirim görür.
3. Benzer bir pekiştirme sorusuyla tekrar dener.
4. AI çalışma arkadaşı, yapılandırılmış bir sohbet alanında açıklama ve ipuçları sunar.
5. Öğretmen, veli ve kurum görünümleri aynı demo oturumunun durumunu farklı amaçlarla gösterir.

## İçerik doğruluğu

- LGS ana sorusu sunucudaki kaynak kaydından alınır ve MEB ÖDSGM kaynak bilgisiyle gösterilir.
- Pekiştirme soruları ve YKS örneği demo için hazırlanmıştır; resmî sınav sorusu olarak sunulmaz.
- YKS için doğrulanmış resmî soru kaydı bulunmadığı için LGS sorusu YKS öğrencisine gösterilmez.
- Sunucu doğrulaması başarısız olursa uygulama doğru cevabı tahmin etmez ve ilerleme kaydı oluşturmaz.
- Görülen ilerleme değeri sunucuya kaydedilmiş değilse açıkça başlangıç demo göstergesi olarak etiketlenir.

## Yerel başlatma

Gereksinimler: Node.js 22 veya uyumlu bir güncel sürüm.

```bash
npm install
```

Proje kökünde `.env` dosyası oluştur:

```env
GEMINI_API_KEY=KENDI_GEMINI_API_ANAHTARIN
```

API anahtarını kaynak koda yazma veya GitHub'a gönderme. `.env*` dosyaları `.gitignore` içinde yok sayılır.

Uygulamayı başlat:

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç. Bu demo Express sunucusu üzerinden Vite'ı çalıştırır; sadece `vite preview` ile açmak API uçlarını sağlamaz.

## Kontrol komutları

```bash
npm run build
npm run lint
npm test
```

## Sınırlar

Bu bir sunum prototipidir; gerçek kullanıcı hesabı, üretim veritabanı, kurum yetkilendirmesi, KVKK uyumluluk denetimi veya gerçek kurum analitiği olarak değerlendirilmemelidir. Öğretmen, veli ve kurum ekranları demo verileriyle aynı oturum akışını açıklamak için tasarlanmıştır.
