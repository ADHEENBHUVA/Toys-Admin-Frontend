import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // --- Login State ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    
    // --- Global State ---
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // --- Forgot Password Flow State ---
    // Views: 'login', 'forgot-email', 'forgot-otp', 'forgot-reset'
    const [view, setView] = useState('login');
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resendTimer, setResendTimer] = useState(30);

    useEffect(() => {
        const rememberedUsername = localStorage.getItem('adminRememberedUsername');
        if (rememberedUsername) {
            setUsername(rememberedUsername);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        let timer;
        if (view === 'forgot-otp' && resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [view, resendTimer]);

    const clearMessages = () => {
        if (error) setError('');
        if (successMessage) setSuccessMessage('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password })
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('adminLoginTimestamp', Date.now().toString());
                localStorage.setItem('adminToken', data.token); // Save the JWT token
                if (rememberMe) {
                    localStorage.setItem('adminRemembered', 'true');
                    localStorage.setItem('adminRememberedUsername', username);
                } else {
                    localStorage.removeItem('adminRemembered');
                    localStorage.removeItem('adminRememberedUsername');
                }
                navigate('/');
            } else {
                setError(data.message || 'Invalid username or password');
            }
        } catch (err) {
            setError('Error connecting to the server. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await response.json();

            if (data.success) {
                setView('forgot-otp');
                setResendTimer(30);
                // If backend is using Ethereal, it might send a previewUrl. 
                // We show a simple success message for security, but the email is sent!
                setSuccessMessage('A 6-digit OTP has been sent to your email.');
                
                if(data.previewUrl) {
                    console.log("Email Preview URL (Testing):", data.previewUrl);
                    console.log("Mock OTP (Testing):", data.mockOtp);
                }
            } else {
                setError(data.message || 'Email not found in our system');
            }
        } catch (err) {
            setError('Error connecting to the server. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        clearMessages();
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await response.json();

            if (data.success) {
                setResendTimer(30);
                setSuccessMessage('A new 6-digit OTP has been sent to your email.');
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Error connecting to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp })
            });
            const data = await response.json();

            if (data.success) {
                setView('forgot-reset');
                setSuccessMessage('');
            } else {
                setError(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError('Error connecting to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp, newPassword })
            });
            const data = await response.json();

            if (data.success) {
                // Ensure we clean up any mocked fallback passwords if we were using them
                localStorage.removeItem('adminValidPassword'); 
                
                setView('login');
                setSuccessMessage('Password changed successfully! Please login.');
                setPassword('');
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Error connecting to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-10 border border-slate-100 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]">
                
                {/* Logo and Branding */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4 transform transition-transform hover:scale-105">
                        <span className="text-white font-black text-2xl leading-none">T</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {view === 'login' && 'Toys Admin'}
                        {view === 'forgot-email' && 'Reset Password'}
                        {view === 'forgot-otp' && 'Enter OTP'}
                        {view === 'forgot-reset' && 'New Password'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium text-center">
                        {view === 'login' && 'Please enter your credentials to continue'}
                        {view === 'forgot-email' && 'Enter your registered email to receive an OTP'}
                        {view === 'forgot-otp' && `We've sent a code to ${forgotEmail}`}
                        {view === 'forgot-reset' && 'Create a new strong password'}
                    </p>
                </div>

                {/* Shared Success/Error Messages */}
                {successMessage && (
                    <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium text-center border border-green-200">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium text-center border border-red-200">
                        {error}
                    </div>
                )}

                {/* LOGIN VIEW */}
                {view === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
                                Username (Email)
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="block w-full rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 px-4 py-3.5 text-slate-900 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); clearMessages(); }}
                                placeholder="Enter your username"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="block w-full rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 px-4 py-3.5 pr-12 text-slate-900 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 transition-colors cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-medium select-none cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <button
                                    type="button"
                                    onClick={() => { setView('forgot-email'); clearMessages(); }}
                                    className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-sm shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? "Loading..." : "Sign in to Dashboard"}
                        </button>
                    </form>
                )}

                {/* FORGOT PASSWORD - EMAIL VIEW */}
                {view === 'forgot-email' && (
                    <form onSubmit={handleForgotEmailSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700" htmlFor="forgotEmail">
                                Email Address
                            </label>
                            <input type="email" id="forgotEmail" className="block w-full rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 px-4 py-3.5 text-slate-900 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); clearMessages(); }} pattern="[^@\s]+@[^@\s]+\.[^@\s]+" title="Please enter a valid email address with @ and ." required
                                placeholder="e.g. admin@example.com"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 rounded-2xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70 mt-6"
                        >
                            {isLoading ? "Sending..." : "Send OTP"}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setView('login'); clearMessages(); }}
                            className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                {/* FORGOT PASSWORD - OTP VIEW */}
                {view === 'forgot-otp' && (
                    <form onSubmit={handleOtpSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700" htmlFor="otp">
                                6-Digit OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                maxLength="6"
                                className="block w-full rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 px-4 py-3.5 text-slate-900 tracking-widest text-center text-lg transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4"
                                value={otp}
                                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); clearMessages(); }}
                                placeholder="------"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            className="w-full py-3.5 px-4 rounded-2xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70 mt-6"
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <div className="text-center mt-4 text-sm font-medium text-slate-500">
                            {resendTimer > 0 ? (
                                <span>Resend OTP in <span className="font-bold text-indigo-600">{resendTimer}s</span></span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
                                    className="text-indigo-600 hover:text-indigo-700 font-bold focus:outline-none transition-colors disabled:opacity-50"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => { setView('forgot-email'); clearMessages(); setOtp(''); }}
                            className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Back
                        </button>
                    </form>
                )}

                {/* FORGOT PASSWORD - RESET VIEW */}
                {view === 'forgot-reset' && (
                    <form onSubmit={handleResetSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700" htmlFor="newPassword">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    className="block w-full rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 px-4 py-3.5 pr-12 text-slate-900 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
                                    placeholder="Enter new password"
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 rounded-2xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70 mt-6"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-10 text-center text-xs text-slate-400 font-medium">
                    <p>&copy; {new Date().getFullYear()} Toys. Admin Portal.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
