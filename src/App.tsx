import React from 'react';
import { Layout } from './components/Layout';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { GameDetail } from './pages/GameDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Promotions } from './pages/Promotions';
import { News } from './pages/News';
import { Results } from './pages/Results';
import { Winners } from './pages/Winners';
import { Admin } from './pages/Admin';
import { RaffleDetail } from './pages/RaffleDetail';
import { CustomPage } from './pages/CustomPage';
import ThaiLottery from './pages/ThaiLottery';


export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-account" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/thai-lottery" element={<ThaiLottery />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/raffles/:id" element={<RaffleDetail />} />
        <Route path="/rush/:id" element={<GameDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/news" element={<News />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/winners" element={<Winners />} />
        <Route path="/winners/:id" element={<Winners />} />
        <Route path="/pages/:id" element={<CustomPage />} />

      </Routes>
    </Layout>
  );
}
