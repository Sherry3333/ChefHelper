import React, { useEffect, useState } from "react";
import SavedRecipes from "../components/SavedRecipes";
import { useAuth } from "../context/AuthContext";
import { getFavorites } from "../services/authService";

export default function MyRecipesPage() {
  const { isLoggedIn, token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    console.log('token in MyRecipesPage:', token);
    getFavorites(token)
      .then(data => setRecipes(data))
      .catch(err => setError(err.message || "Failed to load favorites"))
      .finally(() => setLoading(false));
  }, [isLoggedIn, token]);

  if (!isLoggedIn) {
    return (
      <main>
        <div style={{ textAlign: "center", marginTop: 60, color: "#888" }}>
          Please login to view your favorite recipes.
        </div>
      </main>
    );
  }

  return (
    <main>
      {loading && <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>}
      {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}
      {!loading && !error && <SavedRecipes recipes={recipes} />}
    </main>
  );
}
