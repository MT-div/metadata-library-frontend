// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import type {
  ResourceTemplateResponse,
  VocabularyResponse,
} from "../types/metadata";

const mockProperties = [
  {
    id: 101,
    localName: "title",
    label: "العنوان الرئيسي",
    vocabularyPrefix: "dc",
  },
  { id: 102, localName: "author", label: "المؤلف", vocabularyPrefix: "dc" },
  {
    id: 103,
    localName: "publishDate",
    label: "تاريخ النشر",
    vocabularyPrefix: "dc",
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

  // --- Templates API ---
  http.post("/api/templates", async ({ request }) => {
    const body = await request.json();
    console.log("✅ [CQRS] CreateResourceTemplateCommand:", body);
    return HttpResponse.json({ id: 2 }, { status: 201 });
  }),
  // محاكاة GetPropertiesByVocabularyQuery
  http.get('/api/vocabularies/:vocabId/properties', ({ params }) => {
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
];
