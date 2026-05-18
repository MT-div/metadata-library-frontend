// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import type { TemplateDto } from "../types/metadata";

// هذه البيانات تحاكي ما سيعود من الـ CQRS Queries
const mockTemplates: TemplateDto[] = [
  {
    id: "1",
    name: "Book Template",
    description: "Standard template for printed books",
    properties: [
      {
        id: "p1",
        name: "Title",
        label: "العنوان",
        type: "Literal",
        isRequired: true,
      },
      {
        id: "p2",
        name: "Author",
        label: "المؤلف",
        type: "Literal",
        isRequired: true,
      },
      {
        id: "p3",
        name: "ISBN",
        label: "الرقم التسلسلي",
        type: "Literal",
        isRequired: false,
      },
    ],
  },
  {
    id: "2",
    name: "Manuscript Template",
    description: "Template for ancient manuscripts",
    properties: [
      {
        id: "p1",
        name: "Title",
        label: "العنوان",
        type: "Literal",
        isRequired: true,
      },
      {
        id: "p4",
        name: "Century",
        label: "القرن",
        type: "Literal",
        isRequired: true,
      },
      {
        id: "p5",
        name: "Material",
        label: "نوع الورق",
        type: "Literal",
        isRequired: false,
      },
    ],
  },
];

// هنا نقوم باعتراض الـ API
export const handlers = [
  // محاكاة جلب القوالب (GET /api/templates)
  http.get("/api/templates", () => {
    return HttpResponse.json(mockTemplates);
  }),

  // محاكاة إنشاء عنصر جديد (POST /api/items)
  http.post("/api/items", async ({ request }) => {
    const body = await request.json();
    console.log("Received payload (Like ASP.NET Command):", body);

    // محاكاة نجاح العملية وإرجاع حالة 201 Created
    return HttpResponse.json(
      { success: true, message: "Item created successfully" },
      { status: 201 }
    );
  }),
];
