// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import type {
  ResourceTemplateResponse,
  VocabularyResponse,
} from "../types/metadata";
// أضف هذه المصفوفات الوهمية في أعلى الملف
const mockItems = [
  {
    id: 1,
    type: "Item",
    templateId: 1,
    ownerId: 1,
    ownerName: "Admin",
    metadataValues: [
      {
        propertyId: 101,
        propertyLabel: "العنوان",
        valueText: "تاريخ الأمم والملوك (تاريخ الطبري)",
      },
      { propertyId: 102, propertyLabel: "المؤلف", valueText: "الإمام الطبري" },
      { propertyId: 103, propertyLabel: "سنة النشر", valueText: "310 هـ" },
    ],
  },
  {
    id: 2,
    type: "Item",
    templateId: 2,
    ownerId: 1,
    ownerName: "Admin",
    metadataValues: [
      {
        propertyId: 101,
        propertyLabel: "العنوان",
        valueText: "خريطة دمشق القديمة",
      },
      { propertyId: 104, propertyLabel: "النوع", valueText: "صورة جغرافية" },
      { propertyId: 105, propertyLabel: "التاريخ", valueText: "1920 م" },
    ],
  },
];

const mockItemSets = [
  {
    id: 1,
    type: "ItemSet",
    title: "المكتبة التاريخية",
    description:
      "مجموعة تضم أندر الكتب والمخطوطات التي تتحدث عن التاريخ الإسلامي والأموي.",
    isPublic: true,
    ownerName: "Admin",
    items: [{ id: 1 }, { id: 3 }, { id: 5 }], // محاكاة أن بداخلها 3 عناصر
  },
  {
    id: 2,
    type: "ItemSet",
    title: "الخرائط والوثائق العثمانية",
    description: "أرشيف كامل للخرائط الجغرافية القديمة لبلاد الشام.",
    isPublic: false, // مجموعة خاصة
    ownerName: "Librarian",
    items: [{ id: 2 }],
  },
  {
    id: 3,
    type: "ItemSet",
    title: "مجموعة الصور الفوتوغرافية",
    description:
      "صور نادرة بالأبيض والأسود لمدينة دمشق في أوائل القرن العشرين.",
    isPublic: true,
    ownerName: "Admin",
    items: [], // مجموعة فارغة
  },
];

const mockProperties = [
  {
    id: 101,
    vocabularyId: 1,
    localName: "title",
    label: "العنوان الرئيسي",
    vocabularyPrefix: "dc",
    termUri: "http://purl.org/dc/elements/1.1/title",
  },
  {
    id: 102,
    vocabularyId: 1,
    localName: "creator",
    label: "المؤلف",
    vocabularyPrefix: "dc",
    termUri: "http://purl.org/dc/elements/1.1/creator",
  },
  {
    id: 103,
    vocabularyId: 1,
    localName: "date",
    label: "تاريخ النشر",
    vocabularyPrefix: "dc",
    termUri: "http://purl.org/dc/elements/1.1/date",
  },
  {
    id: 104,
    vocabularyId: 2,
    localName: "shelfMark",
    label: "رقم الرف",
    vocabularyPrefix: "lib",
    termUri: "http://library.local/terms/shelfMark",
  },
];
// محاكاة استجابة قالب "كتاب" بناءً على DTO الخاص بك
const mockTemplates: ResourceTemplateResponse[] = [
  {
    id: 1,
    label: "كتاب مطبوع",
    description: "قالب أساسي للكتب المطبوعة والمنشورة",
    properties: [
      {
        propertyId: 101,
        propertyLabel: "العنوان الرئيسي",
        isRequired: true,
        displayOrder: 1,
      },
      {
        propertyId: 102,
        propertyLabel: "المؤلف",
        isRequired: true,
        displayOrder: 2,
      },
      {
        propertyId: 103,
        propertyLabel: "سنة النشر",
        isRequired: false,
        displayOrder: 3,
      },
      {
        propertyId: 104,
        propertyLabel: "الرقم المعياري (ISBN)",
        isRequired: false,
        displayOrder: 4,
      },
    ],
  },
];
const mockVocabularies: VocabularyResponse[] = [
  {
    id: 1,
    prefix: "dc",
    namespaceUri: "http://purl.org/dc/elements/1.1/",
    label: "Dublin Core",
  },
  {
    id: 2,
    prefix: "lib",
    namespaceUri: "http://library.local/terms/",
    label: "المكتبة المحلية",
  },
];

export const handlers = [
  // 1. جلب القوالب
  http.get("/api/templates", () => {
    return HttpResponse.json(mockTemplates);
  }),

  // 2. جلب قالب محدد بواسطة الـ ID
  http.get("/api/templates/:id", ({ params }) => {
    const template = mockTemplates.find((t) => t.id === Number(params.id));
    if (!template) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(template);
  }),

  // 3. محاكاة الـ Command الخاص بإنشاء العنصر
  http.post("/api/items", async ({ request }) => {
    // هذا سيلتقط الـ CreateItemCommand الذي أرسلته لي
    const body = await request.json();
    console.log("✅ [CQRS Command Received] CreateItemCommand:", body);

    // محاكاة نجاح العملية وإرجاع ID العنصر الجديد (كما يفعل الـ C# Handler)
    return HttpResponse.json({ id: 999 }, { status: 201 });
  }),

  // --- Vocabularies API ---
  http.get("/api/vocabularies", () => {
    return HttpResponse.json(mockVocabularies);
  }),

  http.post("/api/vocabularies", async ({ request }) => {
    const body = await request.json();
    console.log("✅ [CQRS] CreateVocabularyCommand:", body);
    return HttpResponse.json({ id: 2 }, { status: 201 });
  }),

  // --- Properties API ---
  http.post("/api/properties", async ({ request }) => {
    const body = await request.json();
    console.log("✅ [CQRS] CreatePropertyCommand:", body);
    return HttpResponse.json({ id: 105 }, { status: 201 });
  }),

  // 3. جلب كل الخصائص المتاحة في النظام
  http.get("/api/properties", () => {
    return HttpResponse.json(mockProperties);
  }),

  // --- Templates API ---
  http.post("/api/templates", async ({ request }) => {
    const body = await request.json();
    console.log("✅ [CQRS] CreateResourceTemplateCommand:", body);
    return HttpResponse.json({ id: 2 }, { status: 201 });
  }),
  // محاكاة GetPropertiesByVocabularyQuery
  http.get("/api/vocabularies/:vocabId/properties", ({ params }) => {
    const vocabId = Number(params.vocabId);
    // سنفترض هنا أن كل الخصائص الوهمية تابعة للقاموس رقم 1 للتجربة
    const filteredProps = vocabId === 1 ? mockProperties : [];
    return HttpResponse.json(filteredProps);
  }),

  // 2. محاكاة تحديث خصائص القالب (الـ Command الجديد الخاص بك)
  http.put("/api/templates/:id/properties", async ({ request, params }) => {
    const body = await request.json();
    console.log(
      `✅ [CQRS] UpdateTemplatePropertiesCommand (Template ID: ${params.id}):`,
      body
    );
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // --- Item Sets API ---
  http.post("/api/itemsets", async ({ request }) => {
    const body = await request.json();
    console.log("✅ [CQRS] CreateItemSetCommand Received:", body);
    // محاكاة إرجاع ID المجموعة الجديدة
    return HttpResponse.json({ id: 1 }, { status: 201 });
  }),

  // --- Media API ---
  http.post("/api/media", async ({ request }) => {
    const body = await request.json();
    console.log("✅ [CQRS] CreateMediaCommand Received:", body);
    return HttpResponse.json({ id: 55 }, { status: 201 });
  }),

  // --- File Upload API (المحاكاة للكونترولر الجديد) ---
  http.post("/api/files/upload", async () => {
    // محاكاة تأخير بسيط للشبكة لكي نرى تأثير "جاري الرفع..."
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("✅ [File Upload] Received file form data.");

    // إعادة الرد تماماً كما كتبته أنت في الـ C#
    return HttpResponse.json(
      {
        storagePath: `/uploads/${crypto.randomUUID()}_mockfile.jpg`,
        fileName: "mockfile.jpg",
        mimeType: "image/jpeg",
        fileSize: 204800,
      },
      { status: 200 }
    );
  }),

  // جلب كل العناصر (GetAllItemsQuery)
  http.get("/api/items", () => {
    return HttpResponse.json(mockItems);
  }),

  // جلب كل المجموعات (GetAllItemSetsQuery)
  http.get("/api/itemsets", () => {
    return HttpResponse.json(mockItemSets);
  }),
  // جلب عنصر محدد بواسطة ID
  http.get("/api/items/:id", ({ params }) => {
    const item = mockItems.find((i) => i.id === Number(params.id));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  // محاكاة جلب الميديا التابعة لعنصر (GetMediaByItemQuery)
  http.get("/api/media", ({ request }) => {
    const url = new URL(request.url);
    const itemId = url.searchParams.get("itemId");

    // بيانات وهمية لملفات مرفوعة
    const mockMedia = [
      {
        id: 1,
        itemId: Number(itemId),
        storagePath: "/uploads/mock_image.jpg",
        fileName: "cover.jpg",
        metadataValues: [],
      },
    ];
    return HttpResponse.json(mockMedia);
  }),

  // محاكاة إضافة عنصر إلى مجموعة (AddItemToItemSetCommand)
  http.post("/api/itemsets/:setId/items", async ({ request, params }) => {
    const body = await request.json();
    console.log(
      `✅ [CQRS] AddItemToItemSetCommand (Set: ${params.setId}):`,
      body
    );
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // محاكاة إزالة عنصر من مجموعة (RemoveItemFromItemSetCommand)
  http.delete("/api/itemsets/:setId/items/:itemId", ({ params }) => {
    console.log(
      `✅ [CQRS] RemoveItemFromItemSetCommand (Set: ${params.setId}, Item: ${params.itemId})`
    );
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // --- Auth API ---
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    console.log("✅ [Auth] Login attempt for:", body.email);

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // إذا كان الإيميل خطأ (للتجربة)
    if (body.email === "wrong@test.com") {
      return new HttpResponse("Invalid email or password.", { status: 401 });
    }

    // الرد الناجح يطابق AuthResponse الخاص بك
    return HttpResponse.json({
      userName: "Admin 1",
      email: body.email,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_token_for_testing",
    });
  }),
];
