import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/Header';
import HomePage from './pages/HomePage';
import FridgeAIPage from './pages/FridgeAIPage';
import MyRecipesPage from './pages/MyRecipesPage';
import LoginPage from './pages/LoginPage';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="GoogleClientId">
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fridge-ai" element={<FridgeAIPage />} />
            <Route path="/my-recipes" element={<MyRecipesPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}
export default App;
