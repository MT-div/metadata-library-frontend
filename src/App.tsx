import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { WelcomePage } from "./pages/WelcomePage";
import { CreateItemPage } from "./features/items/CreateItemPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<WelcomePage />} />
          <Route path="items/new" element={<CreateItemPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
