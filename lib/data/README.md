# Connecting a backend · توصيل خادم خلفي

## English

All content on this site is served through this folder. No component reads a
JSON file directly, and no component calls `fetch`. To point the site at a real
API you edit **one file**: `endpoints.ts`.

### What each file does

| File | Role |
| --- | --- |
| `endpoints.ts` | The URLs. Empty string = use local JSON. **This is the file you edit.** |
| `client.ts` | The swap point. Decides local-vs-network and does the fetching. |
| `index.ts` | The typed getters components call, and form validation. You should not need to touch this. |
| `types.ts` | The shape the API must return. |
| `limits.ts` | Field length limits, shared by the form and the server. |

All of this runs on the server. The contact form posts through a Server Action
(`app/[locale]/actions.ts`), so endpoint URLs — and any API key you add to the
request in `client.ts` — never reach the browser.

### Before

`endpoints.ts` ships like this, so the site reads `/content/ar.json` and
`/content/en.json`:

```ts
export const endpoints = {
  siteContent: "",
  contactForm: "",
  media: "",
} as const;
```

### After

Give the names real URLs:

```ts
export const endpoints = {
  siteContent: "https://api.yourcompany.com/v1/content/:locale",
  contactForm: "https://api.yourcompany.com/v1/leads",
  media: "https://api.yourcompany.com/v1/media",
} as const;
```

That is the whole change. `:locale` is replaced with `ar` or `en` at request
time. No component changes, no rebuild of any section.

### What the API must return

`GET /v1/content/ar` must return one JSON object matching `SiteContent` in
`types.ts` — the same shape as `/content/ar.json`. The safest way to build it is
to serve that file's contents as your first response, then change it gradually.

`POST /v1/leads` receives `{ name, company, phone, machineType, message }` as
JSON, already validated, and should answer `2xx` on success. Anything else shows
the form's error message.

`GET /v1/media/hero` (likewise `sensors`, `installation`, `closing`) returns one
`MediaAsset` from `types.ts`, or `404` for a slot with no footage.

> **Today the contact form sends nothing.** With `contactForm` empty it
> validates, then reports success without passing the request anywhere. Connect
> it before the site is public.

### If the API is down

Content falls back to the local JSON and the site keeps working. A missing clip
simply isn't shown. A section whose data is missing renders nothing instead of
throwing.

### Video clips

Without a backend, footage is listed in `content/media.json` (files go in
`public/media/`). A slot with no entry renders its drawn graphics alone. See the
root `README.md` for an example entry.

---

## العربية

كل محتوى الموقع يمر عبر هذا المجلد. لا يقرأ أي مكوّن ملف JSON مباشرة، ولا يستدعي
أي مكوّن `fetch`. لتوصيل الموقع بواجهة برمجية حقيقية تعدّل **ملفًا واحدًا**:
`endpoints.ts`.

### وظيفة كل ملف

| الملف | الدور |
| --- | --- |
| `endpoints.ts` | العناوين. النص الفارغ يعني: استخدم ملفات JSON المحلية. **هذا هو الملف الذي تعدّله.** |
| `client.ts` | نقطة التبديل. تقرر محلي أم شبكة، وتنفذ الجلب. |
| `index.ts` | الدوال المصنّفة التي تستدعيها المكوّنات، والتحقق من النموذج. لا حاجة لتعديلها. |
| `types.ts` | الشكل الذي يجب أن ترجعه الواجهة البرمجية. |
| `limits.ts` | الحد الأقصى لطول كل حقل، مشترك بين النموذج والخادم. |

كل ما سبق يعمل على الخادم. نموذج التواصل يُرسَل عبر Server Action
(`app/[locale]/actions.ts`)، فلا تصل عناوين الواجهة — ولا أي مفتاح API تضيفه في
`client.ts` — إلى المتصفح.

### قبل

يأتي `endpoints.ts` هكذا، فيقرأ الموقع `/content/ar.json` و `/content/en.json`:

```ts
export const endpoints = {
  siteContent: "",
  contactForm: "",
  media: "",
} as const;
```

### بعد

ضع عناوين حقيقية:

```ts
export const endpoints = {
  siteContent: "https://api.yourcompany.com/v1/content/:locale",
  contactForm: "https://api.yourcompany.com/v1/leads",
  media: "https://api.yourcompany.com/v1/media",
} as const;
```

هذا هو التعديل كله. تُستبدل `:locale` بـ `ar` أو `en` عند الطلب. لا تعديل على أي
مكوّن، ولا إعادة بناء لأي قسم.

### ما يجب أن ترجعه الواجهة

`GET /v1/content/ar` يجب أن يرجع كائن JSON واحدًا مطابقًا لـ `SiteContent` في
`types.ts` — نفس شكل `/content/ar.json`. أسهل طريقة: اجعل أول استجابة هي محتوى
ذلك الملف نفسه، ثم غيّره تدريجيًا.

`POST /v1/leads` يستقبل `{ name, company, phone, machineType, message }` بصيغة
JSON بعد التحقق منها، ويجب أن يرد بـ `2xx` عند النجاح. أي رد آخر يُظهر رسالة
الخطأ في النموذج.

`GET /v1/media/hero` (وكذلك `sensors` و `installation` و `closing`) يرجع
`MediaAsset` واحدًا من `types.ts`، أو `404` إن لم يكن للموضع مقطع.

> **نموذج التواصل لا يرسل شيئًا اليوم.** ما دام `contactForm` فارغًا، يتحقق
> النموذج من الحقول ثم يعرض رسالة النجاح دون إرسال الطلب إلى أي مكان. يجب توصيله
> قبل نشر الموقع.

### إذا تعطّلت الواجهة

يعود المحتوى إلى ملفات JSON المحلية ويستمر الموقع بالعمل. المقطع المفقود لا يُعرض
ببساطة. أي قسم تنقصه بياناته لا يُعرض أصلًا بدل أن يتسبب بخطأ.

### مقاطع الفيديو

دون خادم خلفي، تُدرج اللقطات في `content/media.json` (والملفات في
`public/media/`). الموضع الذي لا مقطع له يُعرض برسومه وحدها. راجع `README.md` في
جذر المشروع لمثال.
