import { NavLink } from "react-router-dom";
import logoImg from "../assets/logo.png";

export default function Header() {
    return (
        <header className="main-header">
            <div className="logo">
                <img src={logoImg} alt="Logo" />
            </div>
            <nav>
                <NavLink to="/" end>Home</NavLink>
                <NavLink to="/fridge-ai">Fridge AI</NavLink>
                <NavLink to="/my-recipes">My Recipes</NavLink>
                <NavLink to="/login">Login</NavLink>
            </nav>
        </header>
    )
}