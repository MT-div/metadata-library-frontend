import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { WelcomePage } from "./pages/WelcomePage";
import { CreateItemPage } from "./features/items/CreateItemPage";
import { CreatePropertyPage } from "./features/properties/CreatePropertyPage";
import { CreateVocabularyPage } from "./features/vocabularies/CreateVocabularyPage";
import { CreateTemplatePage } from "./features/templates/CreateTemplatePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<WelcomePage />} />
          <Route path="items/new" element={<CreateItemPage />} />
          <Route path="vocabularies/new" element={<CreateVocabularyPage />} />
          <Route path="properties/new" element={<CreatePropertyPage />} />
          <Route path="templates/new" element={<CreateTemplatePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
