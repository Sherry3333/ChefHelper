import React from "react"
import chefIcon from '../assets/chef_icon.png';
export default function Header() {
    return (
        <header>
            <img src={chefIcon} alt="Chef Claude" />
            <h1>Chef Claude</h1>
        </header>
    )
}