// src/types/metadata.ts

// 1. خاصية الميتاداتا (مثلاً: المؤلف، تاريخ النشر)
export interface PropertyDto {
  id: string;
  name: string; // مثل "Author"
  label: string; // العرض للمستخدم "المؤلف"
  type: "Literal" | "URI" | "InternalLink"; // حسب ما ذكرت في هندسة الباك اند
  isRequired: boolean;
}

// 2. قالب الموارد (مثلاً: قالب المخطوطات)
export interface TemplateDto {
  id: string;
  name: string;
  description: string;
  properties: PropertyDto[]; // الحقول التي يفرضها هذا القالب
}

// 3. قيمة الميتاداتا (التي ستدخل في جدول Values)
export interface MetadataValueDto {
  propertyId: string;
  value: string;
  language?: string; // لدعم تعدد اللغات كما ذكرت
}
