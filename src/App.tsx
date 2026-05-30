import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// التخطيطات (Layouts)
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout"; // التخطيط الجديد

// الصفحات العامة
import { WelcomePage } from "./pages/WelcomePage";
import { BrowseItemsPage } from "./features/items/BrowseItemsPage";
import { BrowseItemSetsPage } from "./features/itemSets/BrowseItemSetsPage";
import { ItemDetailsPage } from "./features/items/ItemDetailsPage";

// صفحات الإنشاء والإدارة (Admin)
import { ManageMetadataPage } from "./features/admin/ManageMetadataPage";
import { ManageTemplatesPage } from "./features/admin/ManageTemplatesPage";
import { ManageItemSetsPage } from "./features/admin/ManageItemSetsPage";
import { CreateItemPage } from "./features/items/CreateItemPage";
import { CreateMediaPage } from "./features/media/CreateMediaPage";

// صفحات فرعية تم دمجها لاحقاً في لوحة الإدارة ولكن نحتفظ بروابطها
import { CreateVocabularyPage } from "./features/vocabularies/CreateVocabularyPage";
import { CreatePropertyPage } from "./features/properties/CreatePropertyPage";
import { CreateTemplatePage } from "./features/templates/CreateTemplatePage";
import { CreateItemSetPage } from "./features/itemSets/CreateItemSetPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===================================== */}
        {/* 1. القسم العام (زوار الموقع) */}
        {/* ===================================== */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<WelcomePage />} />
          <Route path="browse" element={<BrowseItemsPage />} />
          <Route path="items/:id" element={<ItemDetailsPage />} />
          <Route path="itemsets" element={<BrowseItemSetsPage />} />
        </Route>

        {/* ===================================== */}
        {/* 2. القسم الإداري (لوحة التحكم - Admin) */}
        {/* ===================================== */}
        <Route element={<AdminLayout />}>
          {/* تحويل مسار /admin مباشرة إلى إدارة الميتاداتا */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/metadata" replace />}
          />

          <Route path="admin/metadata" element={<ManageMetadataPage />} />
          <Route path="admin/templates" element={<ManageTemplatesPage />} />
          <Route path="admin/itemsets" element={<ManageItemSetsPage />} />

          {/* نقلنا صفحات الإنشاء إلى داخل الـ AdminLayout */}
          <Route path="items/new" element={<CreateItemPage />} />
          <Route path="media/new" element={<CreateMediaPage />} />

          {/* الصفحات الإضافية */}
          <Route path="vocabularies/new" element={<CreateVocabularyPage />} />
          <Route path="properties/new" element={<CreatePropertyPage />} />
          <Route path="templates/new" element={<CreateTemplatePage />} />
          <Route path="itemsets/new" element={<CreateItemSetPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
