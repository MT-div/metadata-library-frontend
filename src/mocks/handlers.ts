// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import type { ResourceTemplateResponse } from "../types/metadata";

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
];
