import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import PromoMediaManager from './pages/PromoMediaManager';
import Statistics from './pages/Statistics';
import Feedbacks from './pages/Feedbacks';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import ShippingSettings from './pages/ShippingSettings';
import SocialSettings from './pages/SocialSettings';
import DiscountSettings from './pages/DiscountSettings';
import Profile from './pages/Profile';
import Subscribers from './pages/Subscribers';
import Testimonials from './pages/Testimonials';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'backdrop-blur-xl bg-white/90 border border-slate-100 shadow-2xl',
          style: {
            padding: '16px 24px',
            color: '#1e293b',
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '15px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
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
          <Route path="promomedia" element={<PromoMediaManager />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="shipping" element={<ShippingSettings />} />
          <Route path="subscribers" element={<Subscribers />} />
          <Route path="social" element={<SocialSettings />} />
          <Route path="discount-settings" element={<DiscountSettings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<div className="flex h-screen items-center justify-center font-bold text-gray-500">404 - Not Found. Path: {window.location.pathname}</div>} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
