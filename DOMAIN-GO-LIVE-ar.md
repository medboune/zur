# الإطلاق على zuronix.com — الدليل التفصيلي خطوة بخطوة

هذا الدليل ينفّذ الخطة المتفق عليها بالكامل: **ربط الموقع بالدومين الرسمي** + **بيئة تجربة معزولة** + **نسخ احتياطي من 3 طبقات**. كل شيء ضمن الخطة المجانية.

> وثيقتان مرافقتان تكملان هذا الدليل:
> - `DEPLOY-ar.md` — الدليل الأصلي للنشر (التفاصيل الكاملة لكل أمر)
> - `STAGING-BACKUP-ar.md` — الدليل الكامل لبيئة التجربة والنسخ الاحتياطي (الموسّع)

---

## ما جهّزناه في الكود في هذا التحديث (جاهز — لا تفعل شيئاً)

1. **توجيه `www` → الدومين الرئيسي:** أي زيارة لـ `www.zuronix.com` تُحوَّل تلقائياً بـ **301** إلى `zuronix.com` مع الحفاظ على المسار والباراميترات (مثل `www.zuronix.com/equipment?page=2` → `zuronix.com/equipment?page=2`). هذا يوحّد عنوان الموقع لدى جوجل ويمنع تكرار المحتوى — بدون أي قاعدة إضافية في لوحة Cloudflare.
2. **شبكة أمان لـ Server Actions:** أضفنا `zuronix.com` و`www.zuronix.com` و`staging.zuronix.com` إلى قائمة السماح، حتى لا تتكرر مشكلة E80 في أي سيناريو.
3. **البناء الإنتاجي مُتحقق منه** بعد التغييرات (نجح بالكامل)، والتوجيه مُختبر فعلياً: `www` يعطي 301، والدومين الرئيسي وlocalhost يعملان بلا توجيه.

---

## الخريطة الكاملة

| المرحلة | النتيجة | الوقت |
|---|---|---|
| **صفر** — فحص حالة الدومين | نعرف أي مسار نسلك | دقيقتان |
| **1** — الإنتاج | الموقع حي على `https://zuronix.com` | ~20 دقيقة |
| **2** — بيئة التجربة | `https://staging.zuronix.com` معزولة تماماً | ~15 دقيقة |
| **3** — النسخ الاحتياطي | 3 طبقات حماية للبيانات | ~10 دقيقة |

---

## المرحلة صفر — فحص حالة الدومين (دقيقتان)

افتح **dash.cloudflare.com** وأجب عن سؤالين:

**س1: هل يظهر `zuronix.com` في الصفحة الرئيسية للوحة (قائمة مواقعك/websites)؟**

**س2: أين مسجَّل الدومين؟** (انظر عند جهة الشراء — Cloudflare Registrar؟ GoDaddy؟ Namecheap؟ Porkbun؟ غيره؟)

- **إذا كان الدومين ظاهراً في لوحة Cloudflare** (سواء مسجلاً لدى Cloudflare نفسها أو منقولاً سابقاً) → **تخطَّ "المسار ب"** وابدأ مباشرة من المرحلة 1.
- **إذا كان مسجلاً خارج Cloudflare ولا يظهر في اللوحة** → نفّذ **المسار ب** أولاً ثم أكمل.

---

## المسار ب — نقل الدومين إلى Cloudflare (فقط إذا لم يكن فيها)

> **لماذا؟** ربط دومين بـ Worker يتطلب أن يكون الدومين "Site" مضافاً في نفس حساب Cloudflare. العملية مجانية ولا تنقل ملكية الدومين — تنقل فقط إدارة سجلات DNS.

1. لوحة Cloudflare → **Add a domain** (أو Add a site) → اكتب `zuronix.com` → اختر **Free** plan → Continue.
2. سيفحص Cloudflare سجلات DNS الحالية ويستوردها تلقائياً. **راجعها في صفحة DNS** وتأكد أن كل السجلات الموجودة ظهرت — خاصة **سجلات MX** (البريد).
3. سيظهر لك Cloudflare **نيم سيرفرين** (مثل `xxx.ns.cloudflare.com`). اذهب إلى جهة تسجيل الدومين → إعدادات DNS/Nameservers → استبدل القديمين بالجديدين.
4. انتظر التفعيل (من دقائق حتى ساعتين كحد أقصى). ستجد في لوحة Cloudflare حالة "Active" أخضر.

> ### ⚠️ تحذير البريد — اقرأه قبل تغيير النيم سيرفرز
> إذا كان بريد `info@zuronix.com` يعمل حالياً (على Google Workspace أو Zoho أو بريد المسجّل أو غيره)، فتغيير النيم سيرفرز **قبل** نسخ سجلات MX يوقف البريد فوراً.
> **القاعدة:** تأكد 100% أن سجلات MX (وTXT الخاصة بـ SPF/DKIM) ظاهرة في صفحة DNS بلوحة Cloudflare **قبل** الخطوة 3. Cloudflare يستوردها تلقائياً في أغلب الحالات، لكن التحقق يدوياً يستغرق 30 ثانية ويوفر انقطاع بريد.

---

## المرحلة 1 — الإنتاج على zuronix.com (~20 دقيقة)

### الخطوة 1 — سجّل الدخول وأنشئ الموارد (على جهازك)

```bash
npx wrangler login          # يفتح صفحة تصديق في المتصفح — مرة واحدة
npx wrangler d1 create zuronix-db
npx wrangler r2 bucket create zuronix-uploads
```

انسخ `database_id` الذي يطبعه الأمر الأول.

### الخطوة 2 — أدخل المعرف وارفع الكود

في ملف `wrangler.jsonc` استبدل `REPLACE_WITH_YOUR_D1_DATABASE_ID` بالمعرف، ثم ارفع المستودع كاملاً إلى GitHub (فرع `main`):

```bash
git add wrangler.jsonc && git commit -m "Add D1 database id" && git push origin main
```

> إن كان المستودع `medboune/zur` يحتوي نسخة قديمة: `git push -f origin main` يستبدلها بالكامل.

### الخطوة 3 — أنشئ Worker الإنتاج واربطه بـ GitHub (من اللوحة)

1. لوحة Cloudflare → **Workers & Pages** → **Create** → **Worker** → سمّه `zuronix` → Deploy.
2. ادخل على الـ Worker → **Settings** → **Builds** → **Connect** → اختر مستودع `medboune/zur`، فرع الإنتاج `main`.
3. في **Build configuration**:
   - **Build command:** `npm run cf:build`
   - **Deploy command:** `npx wrangler d1 migrations apply zuronix-db --remote && npx wrangler deploy`

هذا الأمر يطبّق ترحيلات قاعدة البيانات تلقائياً قبل كل نشر — لا خطوة منفصلة مطلوبة.

> **إن كان لديك Worker قديم يحمل الدومين أصلاً:** بدلاً من إنشاء Worker جديد، يمكنك استخدام القديم — غيّر قيمة `"name"` (و`"service"`) في `wrangler.jsonc` لتحمل اسم الـ Worker القديم، واربط المستودع به كما فوق. أي المسارين يعمل.

### الخطوة 4 — ربط الدومين (القلب)

على Worker `zuronix` → **Settings** → **Domains & Routes** → **Add** → **Custom domain**:

1. اكتب `zuronix.com` → Add domain. ← **هذه هي خطوة الربط الأساسية**
2. كرر وأضف `www.zuronix.com` بنفس الطريقة (نحتاجه حتى يستجيب www قبل أن يحوّله التوجيه إلى الدومين الرئيسي).

ينشئ Cloudflare سجلات DNS وشهادة SSL **تلقائياً** خلال دقائق — لا تلمس DNS يدوياً ولا تحتاج شهادة من أي جهة.

> إن كان الدومين مربوطاً بـ Worker آخر: أزله من القديم أولاً (Worker القديم → Domains → Remove) ثم أضفه للجديد. لا يمكن لاثنين مشاركة نفس الدومين.

### الخطوة 5 — كلمات السر (الأسرار)

```bash
npx wrangler secret put ADMIN_PASSWORD          # قوية! أول حساب مسؤول يُبنى منها
npx wrangler secret put ADMIN_SESSION_SECRET    # الصق نصاً عشوائياً طويلاً
npx wrangler secret put RESEND_API_KEY          # اختياري — بريد التنبيهات (انظر § البريد)
```

**مولّد نص عشوائي لـ SESSION_SECRET:** `openssl rand -hex 32`

> **أول تسجيل دخول:** افتح `zuronix.com/admin/login` وادخل باسم المستخدم `admin` وكلمة المرور التي وضعتها في `ADMIN_PASSWORD` — يُنشأ الحساب تلقائياً عند أول محاولة دخول، وبعدها تعدّل الاسم والبريد وكلمة المرور من **/admin/settings**. (بدون `ADMIN_PASSWORD` يرفض الإنتاج تسجيل الدخول نهائياً — حماية مقصودة.)

### الخطوة 6 — تحقق من الإطلاق

انتظر انتهاء البناء (تبويب Builds، 2-3 دقائق) ثم:

- [ ] `https://zuronix.com` يفتح الموقع بشهادة قفل أخضر 🔒
- [ ] `https://www.zuronix.com` يحوّل إلى `zuronix.com` (شريط العنوان يتغير)
- [ ] أرسل طلباً تجريبياً من نموذج (Request Equipment) — يظهر في `/admin`
- [ ] ادخل `/admin` بـ `admin` + كلمة السر
- [ ] `zuronix.com/robots.txt` يعرض `Sitemap: https://zuronix.com/sitemap.xml` (الفهرسة مفعلة تلقائياً في الإنتاج)
- [ ] `zuronix.com/sitemap.xml` يعمل

**ملاحظات طبيعية (ليست أخطاء):**
- **الكتالوج فارغ** — بالتصميم: الإنتاج يبدأ بوضع "الطلب أولاً" (`SHOW_SAMPLE_LISTINGS=false`). أضف معداتك الحقيقية من تبويب Equipment في الإدارة. (إن أردت العناصر التجريبية الثمانية مؤقتاً: `npx wrangler d1 execute zuronix-db --remote --file=scripts/seed-d1.sql` ثم غيّر المتغير إلى `true`.)
- **البريد معطّل مؤقتاً** — الطلبات تُحفظ دائماً في القاعدة وتظهر في `/admin` فوراً؛ البريد يتفعل بإضافة مفتاح Resend (§ البريد).

---

## المرحلة 2 — بيئة التجربة (~15 دقيقة)

التخطيط الكامل والشرح الموسّع في `STAGING-BACKUP-ar.md`. ملخص التنفيذ:

1. **أنشئ الموارد:** `npx wrangler d1 create zuronix-staging-db` ثم `npx wrangler r2 bucket create zuronix-staging-uploads`
2. **أدخل المعرف** في `wrangler.staging.jsonc` (استبدل `REPLACE_WITH_STAGING_D1_DATABASE_ID`) على GitHub.
3. **أنشئ فرع `staging`** من `main` على GitHub.
4. **أنشئ Worker `zuronix-staging`** وارطه بنفس المستودع مع **Production branch = `staging`**:
   - Build: `npm run cf:build`
   - Deploy: `npx wrangler d1 migrations apply zuronix-staging-db --remote && npx wrangler deploy -c wrangler.staging.jsonc`
5. **أوقف المعاينات** على الـ Workerين (Settings → Build → Branch control → Preview deployments: Disabled) لتوفير دقائق البناء.
6. **أسرار منفصلة** (كلمة مرور مختلفة عن الإنتاج):
   ```bash
   npx wrangler secret put ADMIN_PASSWORD --name zuronix-staging
   npx wrangler secret put ADMIN_SESSION_SECRET --name zuronix-staging
   ```
7. **اربط الدومين:** Worker `zuronix-staging` → Domains → Add Custom domain → `staging.zuronix.com`.
8. **تحقق:** الموقع يعمل على `staging.zuronix.com`، و`robots.txt` فيه `Disallow: /` (حجب الفهرسة تلقائي)، والإدارة تدخل بكلمة مرور التجربة.

**النتيجة:** بيئة كاملة ببيانات منفصلة 100% — كل تجربة تُجرى فيها لا يمكن أن تلامس طلبات عملاء الإنتاج أبداً.

**الروتين لكل ميزة جديدة:** طوّر على `staging` → جرّب على `staging.zuronix.com` → Merge إلى `main` → ينشر تلقائياً على الإنتاج. وإن ظهرت مشكلة على الإنتاج: `npx wrangler rollback --name zuronix` يرجع فوراً، أو Revert للـ PR من GitHub.

---

## المرحلة 3 — النسخ الاحتياطي (3 طبقات)

| الطبقة | ماذا تحمي | الإعداد |
|---|---|---|
| **1. Time Travel** | كل تغيير على قاعدة الإنتاج — استعادة لأي دقيقة خلال 7 أيام | **تلقائية، تعمل الآن، صفر إعداد** |
| **2. تصدير يومي → R2** | نسخة SQL يومية خارج القاعدة (02:23 UTC) | 10 دقائق (أدناه) |
| **3. نسخ المرفقات** | ملفات العملاء في `zuronix-uploads` | اختياري (مفتاحان) |

**تفعيل الطبقة الثانية:**

1. `npx wrangler r2 bucket create zuronix-backups`
2. لوحة Cloudflare → My Profile → **API Tokens** → Create Token (Custom): صلاحيتا `D1 Edit` + `Workers R2 Storage Edit` → انسخ التوكن.
3. GitHub → المستودع → Settings → Secrets and variables → Actions → أضف سرّين:
   - `CF_ACCOUNT_ID` = معرف حسابك (لوحة Cloudflare → Overview → يمين الصفحة)
   - `CF_API_TOKEN` = التوكن
4. تبويب **Actions** في المستودع → **Backup (D1 + R2)** → **Run workflow** (تشغيل تجريبي).

ستجد النسخ في R2 → مخزن `zuronix-backups` → مجلد `d1/` — ملف لكل يوم. ملف `backup.yml` موجود أصلاً في المستودع.

**الطبقة الثالثة (اختيارية):** R2 → Manage R2 API Tokens → توكن بصلاحية Object Read & Write على `zuronix-uploads` و`zuronix-backups` → أضفه كسرّين `R2_BACKUP_ACCESS_KEY_ID` و`R2_BACKUP_SECRET_ACCESS_KEY` في GitHub.

**الاستعادة عند الكوارث:**
- خطأ حديث: `npx wrangler d1 time-travel restore zuronix-db --timestamp "2026-11-13T10:30:00Z"`
- كارثة كاملة: استورد آخر ملف SQL من `zuronix-backups` إلى قاعدة جديدة (التفاصيل في `STAGING-BACKUP-ar.md`).

**عادة شهرية موصى بها:** نزّل آخر ملف SQL إلى جهازك (نسخة خارج Cloudflare) وجرّب استعادته على قاعدة مؤقتة.

---

## بعد الإطلاق — إعدادات موصى بها

1. **البريد (تفعيل تنبيهات الفريق):** أنشئ حساباً مجانياً في resend.com → **وثّق دومين zuronix.com** فيه (يضيف سجلي TXT في DNS) → ضع المفتاح في `RESEND_API_KEY`. غيّر `NOTIFY_EMAIL_FROM` في `wrangler.jsonc` إلى `Zuronix Website <website@zuronix.com>` وادفع. تفاصيل أوفى في `DEPLOY-ar.md` § البريد.
2. **HSTS كامل (بعد أسبوع من الاستقرار):** ملف `src/middleware.ts` يرسل حالياً `Strict-Transport-Security` بـ 180 يوماً بدون includeSubDomains. بعد التأكد أن كل خدمات الدومين (البريد وغيره) تعمل جيداً على HTTPS، ارفعه إلى سنتين مع includeSubDomains.
3. **Google Search Console:** أضف الموقع (تحقق تلقائي عبر DNS لأن الدومين في Cloudflare) واقرأ `sitemap.xml`. افعل الشيء نفسه في Bing Webmaster.
4. **بريد تأكيد العميل:** جاهز ومعطّل (`AUTO_ACK_EMAIL_ENABLED`) — يُفعّل بعد توثيق Resend بتغيير القيمة إلى `true`.

---

## استكشاف الأخطاء الشائعة

| المشكلة | السبب والحل |
|---|---|
| الدومين لا يفتح بعد الربط | انتظر 5-10 دقائق لشهادة SSL؛ تأكد أن الدومين "Active" في اللوحة (المسار ب مكتمل) |
| الموقع يعمل لكن النماذج ترجع خطأ | `database_id` غير صحيح في `wrangler.jsonc` أو البناء لم يطبق الترحيلات — تأكد من أمر Deploy في الخطوة 3 |
| `www` لا يحوّل | الكود القديم قبل هذا التحديث — ادفع آخر نسخة وسيشتغل التوجيه |
| لا أستطيع دخول `/admin` | لم تُضبط `ADMIN_PASSWORD` (الخطوة 5) — الإنتاج يرفض بدونها |
| النشر ذهب لـ Worker جديد | قيمة `name` في `wrangler.jsonc` لا تطابق اسم الـ Worker — صحّحها وادفع |
| فشل تحميل مرفق في `/admin` | مخزن `zuronix-uploads` غير منشأ (الخطوة 1) |
