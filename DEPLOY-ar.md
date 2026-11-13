# دليل ربط الدومين ونشر موقع Zuronix — Cloudflare Workers

هذا المستودع جاهز للنشر على **Cloudflare Workers** كما هو، ومربوط بمستودع GitHub بحيث كل push لفرع `main` ينشر تلقائياً على دومينك.

**البنية:** Next.js 16 (بواجهة OpenNext) + قاعدة بيانات Cloudflare D1 + تخزين مرفقات Cloudflare R2. كل شيء داخل حساب Cloudflare الذي تملكه — لا حسابات خارجية.

---

## ما الذي تحتاجه قبل البدء (مرة واحدة)

1. **Node.js** على جهازك (من nodejs.org — نسخة LTS تكفي).
2. **بطاقة دفع مضافة في Cloudflare**: لا لدفن أي شيء، بل لأن خدمة تخزين الملفات R2 تطلب بطاقة عند التفعيل. الاستخدام داخل 10GB مجاني تماماً — مرفقات الموقع لن تتجاوز جزءاً ضئيلاً من هذا الحد.
3. مستودع GitHub: الأبسط هو **إعادة استخدام مستودعك الحالي** `medboune/zur` (المربوط أصلاً بالـ Worker والدومين). إن فضّلت مستودعاً جديداً فسيعمل أيضاً مع خطوة إضافية واحدة (الخطوة 1-ب).

---

## خطوات النشر (15 دقيقة)

### 1. ارفع الكود إلى المستودع

على جهازك، بعد فك ضغط الملف:

```bash
cd zuronix-site
git remote add origin https://github.com/medboune/zur.git
git push -f origin main   # -f يستبدل المحتوى القديم بالكامل
```

**1-ب. فقط إن أنشأت مستودعاً جديداً:** من لوحة Cloudflare → Workers & Pages → اختر الـ Worker المربوط بالدومين → Settings → Builds → Git → افصل المستودع القديم واربط الجديد (فرع الإنتاج `main`).

### 2. أنشئ قاعدة البيانات D1

```bash
npx wrangler login          # يفتح صفحة تصديق في المتصفح — مرة واحدة
npx wrangler d1 create zuronix-db
```

سيطبع الأمر `database_id`. انسخه والصقه في ملف `wrangler.jsonc` مكان `REPLACE_WITH_YOUR_D1_DATABASE_ID`، ثم ادفعه:

```bash
# حرّر wrangler.jsonc أولاً، ثم:
git add wrangler.jsonc && git commit -m "Add D1 database id" && git push
```

### 3. أنشئ مخزن المرفقات R2

```bash
npx wrangler r2 bucket create zuronix-uploads
```

### 4. عيّن كلمات السر (الأسرار)

```bash
npx wrangler secret put ADMIN_PASSWORD          # كلمة مرور شاشة /admin — قوية!
npx wrangler secret put ADMIN_SESSION_SECRET    # الصق نصاً عشوائياً طويلاً
npx wrangler secret put RESEND_API_KEY          # اختياري — لتفعيل بريد التنبيهات (انظر § البريد)
```

### 5. اضبط أمر البناء في لوحة Cloudflare (مرة واحدة)

من لوحة Cloudflare → الـ Worker → Settings → Builds → Build configuration:

- **Build command:** `npm run cf:build`
- **Deploy command:** `npx wrangler d1 migrations apply zuronix-db --remote && npx wrangler deploy`
  (الأمر الجديد يطبّق ترحيلات قاعدة البيانات تلقائياً قبل النشر — آمن للتكرار ولا يعيد ما طبّقه سابقاً. إن أبقيته `npx wrangler deploy` فقط فطبّق الترحيلات يدوياً كما في الخطوة 6.)

> ملاحظة مهمة: في ملف `wrangler.jsonc` غيّر قيمة `"name"` (وقيمة `service` داخل `services`) لتطابق **اسم الـ Worker الحالي** كما يظهر أعلى صفحته في اللوحة — حتى يحدّث النشرُ الـ Workerَ نفسه الذي يحمل دومينك، بدلاً من إنشاء Worker جديد.

### 6. نفّذ الترحيل على قاعدة الإنتاج (مرة واحدة)

```bash
npx wrangler d1 migrations apply zuronix-db --remote
```

هذا ينشئ جداول الطلبات والمعدات ومحدد المحاولات في القاعدة الحقيقية.

#### اختياري: تعبئة الكتالوج بالعناصر التجريبية الثمانية

قاعدة الإنتاج تبدأ **فارغة** — بيانات التجربة المحلية (الطلبات التجريبية + العناصر) لا تُرفع مع الكود. إن أردت أن يفتح الزائر كتالوجاً فيه عناصر منذ اليوم الأول، نفّذ بعد الترحيل:

```bash
npx wrangler d1 execute zuronix-db --remote --file=scripts/seed-d1.sql
```

هذا يُدخل العناصر التجريبية الثمانية (كلها موسومة `isSample=1` وشريط "Demo" ظاهر). ثم في `wrangler.jsonc` غيّر `SHOW_SAMPLE_LISTINGS` إلى `"true"` ليظهر إشعار "سجلات تجريبية" للزوار. احذفها لاحقاً من لوحة الإدارة أو بإعادة تشغيل الملف — ويمكن تخطي هذه الخطوة كلياً والاكتفاء بوضع "الطلب أولاً" حتى تنشر معداتك الحقيقية (أنشئها من تبويب Equipment في لوحة الإدارة).

### 7. انشر

كل push لـ `main` بعد ذلك ينشر تلقائياً. أول نشر يحدث فور إتمام الخطوة 2 (رفع `wrangler.jsonc`). تابع البناء من تبويب Builds في صفحة الـ Worker.

### 8. تحقق

- افتح دومينك — الموقع يعمل (الدومين مربوط بالـ Worker أصلاً، لا تحتاج لمس DNS).
- أرسل طلباً تجريبياً من أي نموذج.
- ادخل `/admin` بكلمة المرور التي عيّنتها — الطلب أمامك، والمعدات تُدار من تبويب Equipment.

### 9. (موصى به) بيئة تجربة + نسخ احتياطي

هذه النسخة من المستودع تتضمن إعداداً كاملاً لبيئة تجربة معزولة (Worker ثانٍ يراقب فرع `staging` بقاعدة بيانات ومرفقات منفصلين تماماً) ونظام نسخ احتياطي يومي تلقائي — كل شيء ضمن الخطة المجانية. **الإعداد خطوة بخطوة في ملف `STAGING-BACKUP-ar.md` المرفق** (~15 دقيقة). الملفات الجديدة:

- `wrangler.staging.jsonc` — إعدادات بيئة التجربة (Worker منفصل + عزل بيانات)
- `.github/workflows/backup.yml` — نسخ احتياطي يومي لقاعدة البيانات إلى R2 (يتفعّل بعد إضافة سرّين في GitHub)
- حجب فهرسة تلقائي لبيئة التجربة (`ALLOW_INDEXING=false`) مع sitemap/robots لكل بيئة على حدة

---

## البريد (تنبيهات الفريق + تأكيد العميل)

كما هو موثق في وثيقة التسليم: التنبيهات تُفعّل بوضع مفتاح Resend في `npx wrangler secret put RESEND_API_KEY`. بريد تأكيد العميل معطّل بالمتغير `AUTO_ACK_EMAIL_ENABLED` في `wrangler.jsonc` — غيّره إلى `true` عند الجاهزية (يتطلب توثيق النطاق في Resend). عناوين المتغيرات الأخرى كلها في `wrangler.jsonc` تحت `vars`.

---

## التطوير محلياً على جهازك

```bash
npm install
cp .env.example .env        # ثم حرّره (كلمة مرور الإدارة للمعاينة المحلية)
mkdir -p db && npx prisma db push   # مرة واحدة: ينشئ قاعدة SQLite المحلية وجداولها
npm run dev                 # http://localhost:3000 — قاعدة SQLite محلية
```

> ملاحظة: مع وجود بيئة التجربة (انظر `STAGING-BACKUP-ar.md`) قد لا تحتاج للتطوير المحلي أصلاً — يمكنك تطوير كل شيء على فرع `staging` واختباره على رابط التجربة مباشرة.

ولتجربة نسخة Workers كاملة محلياً (بنفس بيئة الإنتاج):

```bash
npm run cf:build
npx wrangler d1 migrations apply zuronix-db --local
npx wrangler dev            # http://localhost:8788 — D1 و R2 محليتان
```

---

## حدود الخطة المجانية (مضبوطة لهذا الموقع)

| الحد | الخطة المجانية | حاجتنا |
|---|---|---|
| طلبات | 100,000 / يوم | موقع B2B — كافية جداً |
| حجم الحزمة | 3MB مضغوطة | حزمتنا **2.2MB** ✓ (مقاسة) |
| D1 | 5GB تخزين، 5M قراءة/يوم | آلاف الطلبات شهرياً — كافية |
| R2 | 10GB | مرفقات بحد 10MB للملف — كافية لسنوات |

إن نما الموقع مستقبلاً: خطة Workers Paid بـ $5/شهر ترفع كل الحدود.

## استكشاف الأخطاء

- **البناء يفشل في Cloudflare** → تأكد أن Build command هو `npm run cf:build` وليس None.
- **الموقع يعمل لكن النماذج ترجع خطأ** → نسيت الخطوة 6 (ترحيل القاعدة) أو `database_id` خاطئ.
- **نشر على Worker جديد بدل الحالي** → قيمة `name` في `wrangler.jsonc` لا تطابق اسم الـ Worker؛ صحّحها وادفع.
- **تحميل مرفق يفشل في /admin** → تأكد من إنشاء مخزن `zuronix-uploads` (الخطوة 3) بحرفيته.
