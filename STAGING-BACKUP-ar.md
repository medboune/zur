# بيئتان + نسخ احتياطي — الدليل الكامل لموقع Zuronix

هذا الدليل يشرح كيف تدير **بيئة تجربة (Staging)** منفصلة تماماً عن **بيئة الإنتاج (Production)**، تجرّب فيها أي ميزة قبل نشرها، مع **نظام نسخ احتياطي من 3 طبقات**. كل شيء ضمن الخطة المجانية.

> **الشرط الوحيد:** أن تكون قد أكملت دليل النشر `DEPLOY-ar.md` أولاً (الموقع يعمل على الإنتاج).

---

## الفكرة في دقيقة

```
مستودع GitHub واحد (medboune/zur)
│
├── فرع main    ──► Worker «zuronix»          ──► zuronix.com
│                    ├─ قاعدة D1:  zuronix-db
│                    └─ مخزن R2:   zuronix-uploads
│
└── فرع staging ──► Worker «zuronix-staging»  ──► staging.zuronix.com
                     ├─ قاعدة D1:  zuronix-staging-db      (منفصلة!)
                     └─ مخزن R2:   zuronix-staging-uploads  (منفصل!)
```

**سير العمل:** تطور الميزة على `staging` → تجرّبها على رابط التجربة → إذا نجحت تعمل **Merge** إلى `main` → تنشر تلقائياً على الإنتاج. أي خطأ يبقى محصوراً في بيئة التجربة — بيانات الإنتاج (طلبات العملاء) لا يمكن أن تُلمس من الاختبارات أبداً.

**لماذا Worker ثانٍ؟** Cloudflare يوفر "Preview Deployments" مدمجة لكل فرع، لكنها تدار من اللوحة فقط ورابطها يتغير. Worker مستقل يعطيك: رابط تجربة **ثابتاً** (staging.zuronix.com)، إعدادات موثقة **في الكود** (`wrangler.staging.jsonc`)، وعزل بيانات كامل. (يمكنك لاحقاً تفعيل المعاينات المدمجة أيضاً للفحص السريع — لا تتعارض.)

---

# الجزء الأول: إعداد بيئة التجربة (مرة واحدة، ~15 دقيقة)

### الخطوة 1 — ارفع آخر نسخة من الكود إلى main

النسخة الجديدة تتضمن ملف `wrangler.staging.jsonc` ومجلد `.github/workflows/`. ارفعها إلى `main` كما فعلت سابقاً (فك الضغط ثم `git push`).

### الخطوة 2 — أنشئ فرع staging

من واجهة GitHub: افتح المستودع → القائمة المنسدلة للفروع (تقول `main`) → اكتب `staging` → **Create branch: staging from 'main'**.

### الخطوة 3 — أنشئ موارد التجربة (على جهازك)

```bash
npx wrangler d1 create zuronix-staging-db
npx wrangler r2 bucket create zuronix-staging-uploads
```

انسخ `database_id` المطبوع من الأمر الأول.

### الخطوة 4 — أدخل المعرف في ملف الإعدادات

من واجهة GitHub: افتح ملف `wrangler.staging.jsonc` على فرع `main` → أيقونة القلم (تعديل) → استبدل `REPLACE_WITH_STAGING_D1_DATABASE_ID` بالمعرف → **Commit changes**.

ثم حدّث فرع التجربة ليحصل على الملف: من واجهة GitHub احذف فرع `staging` وأعد إنشاءه من `main` (أسهل طريقة — الفرع لم يُستخدم بعد).

### الخطوة 5 — أنشئ Worker التجربة واربطه بنفس المستودع

1. لوحة Cloudflare → **Workers & Pages** → **Create** → **Worker** → سمّه `zuronix-staging` → Deploy.
2. ادخل على الـ Worker الجديد → **Settings** → **Builds** → **Connect** → اختر مستودع `medboune/zur`.
3. عند سؤال **Production branch** اختر `staging`.
4. في **Build configuration**:
   - **Build command:** `npm run cf:build`
   - **Deploy command:** `npx wrangler d1 migrations apply zuronix-staging-db --remote && npx wrangler deploy -c wrangler.staging.jsonc`

> ربط المستودع نفسه بأكثر من Worker ميزة رسمية مدعومة — سترى حالة بناء كل Worker في GitHub.

### الخطوة 6 — أوقف بناء المعاينات على الـ Workerين

بدون هذه الخطوة، كل push على أي فرع سيبني مرتين (مرة إنتاج + مرة معاينة للـ Worker الآخر) — إهدار لدقائق البناء:

- لكل من Worker `zuronix` وWorker `zuronix-staging`: **Settings** → **Build** → **Branch control** → اجعل بناء الـ Preview معطلاً (Disabled) وفرع الإنتاج كما هو (`main` للأول، `staging` للثاني).

### الخطوة 7 — كلمات سر بيئة التجربة

```bash
npx wrangler secret put ADMIN_PASSWORD --name zuronix-staging          # كلمة مختلفة عن الإنتاج!
npx wrangler secret put ADMIN_SESSION_SECRET --name zuronix-staging
```

**لا تضع `RESEND_API_KEY` هنا** — هكذا تبقى تجاربك بلا أي بريد يُرسل (ميزة مقصودة). إن أردت يوماً اختبار البريد على التجربة: ضع المفتاح مؤقتاً وغيّر `NOTIFY_EMAIL_TO` في `wrangler.staging.jsonc` إلى بريدك الشخصي، ثم احذفه بعدها:
`npx wrangler secret delete RESEND_API_KEY --name zuronix-staging`

### الخطوة 8 — اربط دومين التجربة (موصى به)

على Worker `zuronix-staging` → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → اكتب `staging.zuronix.com`. يضيف Cloudflare سجل DNS وشهادة SSL تلقائياً خلال دقائق.

> رابط التجربة عام على الإنترنت (كأي موقع)، لكنه محجوب عن جوجل تماماً — انظر الخطوة 9.

### الخطوة 9 — تحقق أن كل شيء يعمل

افتح `https://staging.zuronix.com`:

- [ ] الموقع يعمل، والكتالوج فارغ أو تجريبي (بيئة معزولة — عناصر الإنتاج لا تظهر).
- [ ] اختيارياً عبّئ الكتالوج التجريبي: `npx wrangler d1 execute zuronix-staging-db --remote --file=scripts/seed-d1.sql`
- [ ] أدخل `/admin` بكلمة مرور التجربة — قاعدة فارغة ونظيفة.
- [ ] أرسل طلباً تجريبياً من نموذج — يظهر في `/admin` ولا يصل أي بريد (المفتاح غير موجود).
- [ ] افتح `staging.zuronix.com/robots.txt` — يجب أن يظهر `Disallow: /` (حجب الفهرسة يعمل تلقائياً عبر متغير `ALLOW_INDEXING=false` الموجود في `wrangler.staging.jsonc`).

---

## سير العمل لكل ميزة جديدة (الروتين اليومي)

1. **طوّر** على فرع جديد أو مباشرة على `staging`، ثم push.
2. **انتظر البناء** (تبويب Builds في Worker التجربة، أو علامة ✓ في GitHub) — دقيقة إلى دقيقتين.
3. **جرّب على `staging.zuronix.com`** حتى تطمئن تماماً.
4. **انشر:** اعمل Pull Request من `staging` إلى `main` → Merge → البناء الإنتاجي يبدأ تلقائياً.
5. **إن ظهرت مشكلة على الإنتاج رغم كل شيء:** اعمل **Revert** للـ PR من واجهة GitHub (يرجع الكود ويُنشر تلقائياً)، أو للرجوع الفوري بدون بناء:
   ```bash
   npx wrangler rollback --name zuronix
   ```

**قاعدتان ذهبيتان:**
- الدمج دائماً باتجاه واحد: `staging` → `main`.
- عند دخول تحديثات من `main` إلى `staging` (مثل توثيق جديد) استخدم **Merge**، لا تستبدل فرع `staging` بعد أن بدأ العمل عليه.

### عند تعديل قاعدة البيانات (Migrations)

أي تغيير مستقبلي على `prisma/schema.prisma` يحتاج ملف ترحيل SQL في مجلد `migrations/`. أوامر النشر لكل بيئة **تطبّق الترحيلات تلقائياً** قبل النشر (خيار مقصود في أمر النشر — يمنع نسيانها). الترتيب الطبيعي:

1. أضف ملف الترحيل → push إلى `staging` → يُطبَّق على قاعدة التجربة → تحقق.
2. Merge إلى `main` → يُطبَّق تلقائياً على قاعدة الإنتاج.

ويدوياً عند الحاجة:
```bash
npx wrangler d1 migrations apply zuronix-staging-db --remote   # التجربة
npx wrangler d1 migrations apply zuronix-db --remote           # الإنتاج
```

---

# الجزء الثاني: النسخ الاحتياطي (3 طبقات)

## الطبقة 1 — Time Travel (تلقائية، صفر إعداد، تعمل الآن)

D1 يسجل كل تغيير على قاعدة الإنتاج تلقائياً — يمكنك استعادة القاعدة **إلى أي دقيقة** خلال آخر **7 أيام** (المجانية) أو 30 يوماً (خطة $5/شهر عند الحاجة).

**متى تستخدمها:** حذف خاطئ من `/admin`، بيانات فاسدة، أي عملية لم تقصدها.

```bash
npx wrangler d1 time-travel info zuronix-db     # اعرض نقاط الاستعادة المتاحة
npx wrangler d1 time-travel restore zuronix-db --timestamp "2026-11-13T10:30:00Z"
```

> الاستعادة تكتب فوق القاعدة الحالية (تدمّر ما بعدها من تغييرات) — طبّقها وأنت متأكد من اللحظة المطلوبة.

## الطبقة 2 — تصدير يومي تلقائي إلى مخزن R2 (جاهز في المستودع)

ملف `.github/workflows/backup.yml` موجود في المستودع. كل يوم الساعة 02:23 UTC يصدّر قاعدة الإنتاج كاملة إلى ملف SQL ويخزنه في مخزن `zuronix-backups`. **تفعيله** يتطلب مرة واحدة:

1. **أنشئ مخزن النسخ:** `npx wrangler r2 bucket create zuronix-backups`
2. **أنشئ API Token:** لوحة Cloudflare → أيقونة الملف الشخصي (أعلى اليمين) → **My Profile** → **API Tokens** → **Create Token** → **Custom token**:
   - Permissions: `Account` → `D1` → **Edit**، وسطر آخر `Account` → `Workers R2 Storage` → **Edit**
   - أنشئه وانسخ التوكن (يظهر مرة واحدة فقط).
3. **أضف سرّين في GitHub:** المستودع → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - `CF_ACCOUNT_ID` = معرف حسابك (صفحة Cloudflare الرئيسية، قسم Overview، يمين الصفحة — "Account ID")
   - `CF_API_TOKEN` = التوكن الذي أنشأته
4. **شغّله تجريبياً:** تبويب **Actions** في المستودع → اختر **Backup (D1 + R2)** → **Run workflow**.

ستجد النسخ في لوحة Cloudflare → **R2** → مخزن `zuronix-backups` → مجلد `d1/` — ملف لكل يوم باسم التاريخ.

**الكلفة:** صفر — ملفات بالكيلوبايتات، وحد R2 المجاني 10GB.

## الطبقة 3 — نسخ المرفقات (اختيارية، تتفعّل بإضافة مفتاحين)

نفس الـ Action يزامن مرفقات العملاء (من `zuronix-uploads` إلى `zuronix-backups/attachments`). تفعيلها:

1. لوحة Cloudflare → **R2** → **Manage R2 API Tokens** → **Create API Token** → صلاحية **Object Read & Write** على المخزنين `zuronix-uploads` و`zuronix-backups`.
2. أضف الناتج كسرّين في GitHub: `R2_BACKUP_ACCESS_KEY_ID` و`R2_BACKUP_SECRET_ACCESS_KEY`.

بدون المفتاحين، هذه المهمة تتخطى نفسها بهدوء — لا أخطاء.

## كيف تستعيد عند الكوارث؟

**السيناريو أ — خطأ حديث (خلال آخر 7 أيام):** Time Travel كما في الطبقة 1 — دقائق وتنتهي.

**السيناريو ب — كارثة كاملة (حذف القاعدة كلها):**

```bash
# 1) أنشئ قاعدة جديدة
npx wrangler d1 create zuronix-db-restore
# 2) استورد آخر نسخة احتياطية (نزّلها أولاً من مخزن zuronix-backups في اللوحة، أو):
npx wrangler r2 object get zuronix-backups/d1/d1-2026-11-12.sql --file=restore.sql
npx wrangler d1 execute zuronix-db-restore --remote --file=restore.sql
# 3) حدّث database_id في wrangler.jsonc إلى معرف القاعدة الجديدة → push → يعود الموقع
```

**عادات موصى بها:**
- نزّل آخر نسخة SQL إلى جهازك مرة شهرياً (نسخة خارج Cloudflare تماماً).
- اختبر الاستعادة مرة كل شهر على قاعدة مؤقتة — النسخة الاحتياطية غير المُختبرة ليست نسخة احتياطية.
- بريد التنبيهات (بعد تفعيله) يحمل تفاصيل كل طلب — صندوق بريدك نسخة خامدة إضافية من بيانات العمل.

---

## حدود الخطة المجانية (كل ما في هذا الدليل ضمنها)

| المورد | الحد المجاني | استهلاكنا بعد هذا الدليل |
|---|---|---|
| Workers | 100 | 2 |
| قواعد D1 | 10 | 2 (إنتاج + تجربة) |
| مخازن R2 | 10 | 3–4 (مرفقات ×2 + نسخ) |
| دقائق البناء (Workers Builds) | 3,000 / شهر | ~100–200 (البناء ≈ 3 دقائق) |
| GitHub Actions (مستودع خاص) | 2,000 دقيقة / شهر | ~90 (نسخ يومي ≈ 3 دقائق) — بلا حدود للمستودع العام |
| D1 Time Travel | 7 أيام | يكفي مع النسخ اليومية |

## أسئلة سريعة

- **هل يمكن أن يظهر شيء من التجربة في الإنتاج؟** لا — قاعدتان ومخزنان وأسرار منفصلة تماماً.
- **حذفت فرع staging بالخطأ؟** أنشئه من جديد من `main` — كل إعدادات التجربة تعيش في الكود.
- **أول بناء لبيئة التجربة فشل؟** تأكد أن (1) قاعدة `zuronix-staging-db` موجودة، (2) المعرف الصحيح في `wrangler.staging.jsonc` على **فرع staging**، (3) مخزن `zuronix-staging-uploads` موجود.
- **أريد تغيير رابط التجربة؟** عدّل `APP_URL` في `wrangler.staging.jsonc` ليطابق الدومين الذي ربطته.
- **أريد اختبار ميزة البريد على التجربة؟** انظر الخطوة 7 — مفتاح مؤقت + بريدك الشخصي كمستلم.

---

## ملخص سريع (Checklist)

**مرة واحدة:** إنشاء الموارد (D1 + R2 للتجربة) → إدخال المعرف → إنشاء Worker `zuronix-staging` وربطه بفرع `staging` → إيقاف المعاينات على الـ Workerين → الأسرار → ربط `staging.zuronix.com` → إنشاء `zuronix-backups` + توكن + سرّا GitHub → تشغيل الـ Action يدوياً للتجربة.

**كل ميزة:** push إلى `staging` → تجربة على `staging.zuronix.com` → PR إلى `main` → نشر للإنتاج.

**كل شهر:** تنزيل آخر نسخة SQL إلى جهازك + تجربة استعادة على قاعدة مؤقتة.
