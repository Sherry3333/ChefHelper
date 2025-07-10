import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/Header';
import HomePage from './pages/HomePage';
import FridgeAIPage from './pages/FridgeAIPage';
import MyRecipesPage from './pages/MyRecipesPage';
import LoginPage from './pages/LoginPage';
import CreateRecipePage from './pages/CreateRecipePage';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <FavoriteProvider>
        <GoogleOAuthProvider clientId="GoogleClientId">
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/fridge-ai" element={<FridgeAIPage />} />
              <Route path="/my-recipes" element={<MyRecipesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/create-recipe" element={<CreateRecipePage />} />
              <Route path="/create-recipe/:id" element={<CreateRecipePage />} />
            </Routes>
            <ToastContainer position="top-center" />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </FavoriteProvider>
    </AuthProvider>
  );
}
export default App;
