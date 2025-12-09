import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import CharacterDetailPage from "./pages/CharacterDetailPage";
import DaevanionDetailPage from "./pages/DaevanionDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route path="character/:id" element={<CharacterDetailPage />} />
          <Route
            path="character/:characterId/daevanion"
            element={<DaevanionDetailPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
