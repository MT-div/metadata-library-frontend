import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// التخطيطات وحارس الأمن
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute"; // <-- الحارس

// الصفحات
import { WelcomePage } from "./pages/WelcomePage";
import { BrowseItemsPage } from "./features/items/BrowseItemsPage";
import { BrowseItemSetsPage } from "./features/itemSets/BrowseItemSetsPage";
import { ItemDetailsPage } from "./features/items/ItemDetailsPage";
import { LoginPage } from "./features/auth/LoginPage"; // <-- صفحة الدخول

// صفحات الإدارة
import { ManageMetadataPage } from "./features/admin/ManageMetadataPage";
import { ManageTemplatesPage } from "./features/admin/ManageTemplatesPage";
import { ManageItemSetsPage } from "./features/admin/ManageItemSetsPage";
import { CreateItemPage } from "./features/items/CreateItemPage";
import { CreateMediaPage } from "./features/media/CreateMediaPage";
import { CreateVocabularyPage } from "./features/vocabularies/CreateVocabularyPage";
import { CreatePropertyPage } from "./features/properties/CreatePropertyPage";
import { CreateTemplatePage } from "./features/templates/CreateTemplatePage";
import { CreateItemSetPage } from "./features/itemSets/CreateItemSetPage";
import { ManageMediaPage } from "./features/admin/ManageMediaPage";
import { ManageItemsPage } from "./features/admin/ManageItemsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===================================== */}
        {/* 1. القسم العام (لا يحتاج تسجيل دخول) */}
        {/* ===================================== */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<WelcomePage />} />
          <Route path="browse" element={<BrowseItemsPage />} />
          <Route path="items/:id" element={<ItemDetailsPage />} />
          <Route path="itemsets" element={<BrowseItemSetsPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* صفحة تسجيل الدخول (مستقلة بدون Layout أو يمكن وضعها في MainLayout) */}

        {/* ===================================== */}
        {/* 2. القسم الإداري (محمي بحارس الأمن!) */}
        {/* ===================================== */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/metadata" replace />}
            />
            <Route path="admin/media" element={<ManageMediaPage />} />
            <Route path="admin/metadata" element={<ManageMetadataPage />} />
            <Route path="admin/templates" element={<ManageTemplatesPage />} />
            <Route path="admin/itemsets" element={<ManageItemSetsPage />} />
            <Route path="admin/items" element={<ManageItemsPage />} />

            <Route path="items/new" element={<CreateItemPage />} />
            <Route path="media/new" element={<CreateMediaPage />} />
            <Route path="vocabularies/new" element={<CreateVocabularyPage />} />
            <Route path="properties/new" element={<CreatePropertyPage />} />
            <Route path="templates/new" element={<CreateTemplatePage />} />
            <Route path="itemsets/new" element={<CreateItemSetPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
