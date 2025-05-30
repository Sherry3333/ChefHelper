
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Header from './components/Header'
import Main from './components/Main'
import SavedRecipes from './components/SavedRecipes'
function App() {
  
  return (
    <BrowserRouter>
      <Header />
      <nav>
        <Link to="/">Home</Link>
        <Link to="/saved">Saved Recipes</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/saved" element={<SavedRecipes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
