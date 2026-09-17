import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Banners from './pages/Banners';
import Statistics from './pages/Statistics';
import Feedbacks from './pages/Feedbacks';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import ShippingSettings from './pages/ShippingSettings';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard Routes wrapped in generic Layout */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="banners" element={<Banners />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="shipping" element={<ShippingSettings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<div className="flex h-screen items-center justify-center font-bold text-gray-500">404 - Not Found. Path: {window.location.pathname}</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
