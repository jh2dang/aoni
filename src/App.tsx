import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import CharacterDetailPage from "./pages/CharacterDetailPage";
import DaevanionDetailPage from "./pages/DaevanionDetailPage";
import DaevanionOptimizationPage from "./pages/DaevanionOptimizationPage";
import RankingPage from "./pages/RankingPage";
import CharacterComparePage from "./pages/CharacterComparePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="character/:id" element={<CharacterDetailPage />} />
          <Route
            path="character/:id/compare"
            element={<CharacterComparePage />}
          />
          <Route
            path="character/:characterId/daevanion"
            element={<DaevanionDetailPage />}
          />
          <Route
            path="character/:characterId/daevanion/optimization"
            element={<DaevanionOptimizationPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
