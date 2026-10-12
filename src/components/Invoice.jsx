import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// Helper to format currency
const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(val) || 0);
};

// Number to Words for Indian Rupees
const numberToWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
               'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        let str = '';
        if (n > 99) {
            str += a[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
        } else {
            str += a[n];
        }
        return str.trim();
    };

    const n = Math.floor(Math.abs(Number(num) || 0));
    if (n === 0) return 'Zero Rupees Only';

    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;

    let res = '';
    if (crore > 0) res += inWords(crore) + ' Crore ';
    if (lakh > 0) res += inWords(lakh) + ' Lakh ';
    if (thousand > 0) res += inWords(thousand) + ' Thousand ';
    if (remainder > 0) res += inWords(remainder);

    return (res.trim() + ' Rupees Only').replace(/\s+/g, ' ');
};

import { BRAND_LOGO_BASE64 } from './brandLogoBase64';

const COMPANY_LOGO_URL = BRAND_LOGO_BASE64 || "/brand-logo.png";
 
 const Invoice = ({ order, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    if (!order) return null;

    // Normalizing customer information
    const customerObj = order.customer && typeof order.customer === 'object' ? order.customer : {};
    const storedUser = (typeof localStorage !== 'undefined' && localStorage.getItem('user')) 
        ? (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })() 
        : {};

    const customerName = order.shippingAddress?.fullName || 
        order.billingAddress?.fullName || 
        customerObj.name || 
        `${customerObj.firstName || ''} ${customerObj.lastName || ''}`.trim() || 
        storedUser?.name ||
        `${storedUser?.firstName || ''} ${storedUser?.lastName || ''}`.trim() ||
        'Valued Customer';
        
    const customerEmail = customerObj.email || 
        order.shippingAddress?.email || 
        order.billingAddress?.email || 
        storedUser?.email || 
        '';

    const customerPhone = order.shippingAddress?.phone || 
        order.billingAddress?.phone || 
        customerObj.phone || 
        storedUser?.phone || 
        '';

    // Normalizing address
    const shipAddr = order.shippingAddress || order.billingAddress || {};
    const formattedAddress = [
        shipAddr.addressLine1 || shipAddr.street || '',
        shipAddr.addressLine2 || '',
        [shipAddr.city, shipAddr.state].filter(Boolean).join(', '),
        (shipAddr.postalCode || shipAddr.zipCode) ? `PIN: ${shipAddr.postalCode || shipAddr.zipCode}` : '',
        shipAddr.country || ''
    ].filter(Boolean);

    // Normalizing order items
    const rawItems = order.orderItems || order.items || [];

    // Real Order ID and Invoice Number
    const rawId = order._id ? String(order._id) : (order.id ? String(order.id) : '');
    const realOrderCode = rawId 
        ? (rawId.length > 8 ? rawId.slice(-8).toUpperCase() : rawId.toUpperCase()) 
        : (order.orderNumber ? String(order.orderNumber).replace(/^OD-?/i, '') : '');

    const displayOrderId = order.orderNumber 
        ? order.orderNumber 
        : (realOrderCode ? `#OD-${realOrderCode}` : (order.orderId || 'ORD-PENDING'));

    const orderDateObj = order.createdAt ? new Date(order.createdAt) : (order.date ? new Date(order.date) : new Date());
    const invoiceYear = orderDateObj.getFullYear();
    const invoiceMonth = String(orderDateObj.getMonth() + 1).padStart(2, '0');

    const invoiceNumber = order.invoiceNumber || `INV/${invoiceYear}-${invoiceMonth}/${realOrderCode || '001'}`;

    const dateFormatted = orderDateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const subTotal = Number(order.subTotal !== undefined ? order.subTotal : (order.subtotal !== undefined ? order.subtotal : order.totalAmount || 0));
    const shippingCharge = Number(order.shippingCharge !== undefined ? order.shippingCharge : (order.shippingFee !== undefined ? order.shippingFee : 0));
    const discountAmount = Number(order.discountAmount || 0);
    const taxAmount = Number(order.taxAmount !== undefined ? order.taxAmount : (order.tax !== undefined ? order.tax : 0));
    const totalAmount = Number(order.totalAmount || (subTotal + shippingCharge + taxAmount - discountAmount));

    const paymentStatus = order.paymentStatus || (order.orderStatus === 'Cancelled' ? 'Cancelled' : 'Paid');
    const isPaid = paymentStatus.toLowerCase() === 'paid';

    const handleDownload = async () => {
        const loadingToast = toast.loading('Generating PDF...');
        try {
            const element = document.getElementById('invoice-content');
            if (!element) throw new Error("Invoice content not found");

            const dataUrl = await toPng(element, { 
                quality: 0.98,
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${invoiceNumber.replace(/[\/\\]/g, '_')}.pdf`);
            
            toast.success('PDF Downloaded Successfully!', { id: loadingToast });
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error(`Download failed: ${error.message || 'Unknown error'}`, { id: loadingToast });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-3 sm:p-6 py-8 sm:py-12">
                <div className="bg-white w-full max-w-[850px] rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200">
                
                    {/* Top Action Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order ID:</span>
                            <span className="text-sm font-extrabold text-[#1c274c] bg-slate-200/70 px-2.5 py-1 rounded font-mono">
                                {displayOrderId}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center items-center gap-3">
                            <button 
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1c274c] text-white rounded-lg font-semibold hover:bg-[#121c3b] transition-colors shadow-sm text-sm"
                            >
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm text-sm"
                            >
                                <Printer className="w-4 h-4" /> Print
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Exact Styled Printable Document */}
                    <div 
                        className="relative overflow-hidden bg-white p-8 sm:p-12 text-[#1c274c] font-sans print:p-0 print:m-0 selection:bg-blue-100" 
                        id="invoice-content"
                        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                    >
                        {/* Background Triple Slanted Watermarks (3 var Trasu Logo and Name - Mota Akshar ma) */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between items-center z-0 overflow-hidden select-none py-8">
                            {/* 1. Top Slanted Watermark */}
                            <div className="opacity-[0.09] transform -rotate-[22deg] scale-125 sm:scale-135 flex items-center justify-center mt-12">
                                <img 
                                    src={COMPANY_LOGO_URL} 
                                    alt="Little Joys Watermark Top" 
                                    className="w-[450px] sm:w-[580px] max-w-[95vw] object-contain" 
                                />
                            </div>
                            
                            {/* 2. Center Slanted Watermark */}
                            <div className="opacity-[0.10] transform -rotate-[22deg] scale-130 sm:scale-140 flex items-center justify-center my-auto">
                                <img 
                                    src={COMPANY_LOGO_URL} 
                                    alt="Little Joys Watermark Middle" 
                                    className="w-[480px] sm:w-[620px] max-w-[95vw] object-contain" 
                                />
                            </div>

                            {/* 3. Bottom Slanted Watermark */}
                            <div className="opacity-[0.09] transform -rotate-[22deg] scale-125 sm:scale-135 flex items-center justify-center mb-12">
                                <img 
                                    src={COMPANY_LOGO_URL} 
                                    alt="Little Joys Watermark Bottom" 
                                    className="w-[450px] sm:w-[580px] max-w-[95vw] object-contain" 
                                />
                            </div>
                        </div>

                        {/* Content Container (Layered above watermark) */}
                        <div className="relative z-10">
                            {/* 1. Header (Brand Logo, Details & Right Slogan) */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6">
                                {/* Left Brand Details */}
                                <div className="flex flex-col items-start gap-3">
                                    <div className="flex items-center">
                                        <img 
                                            src={COMPANY_LOGO_URL} 
                                            alt="Little Joys - Kids & Baby Store" 
                                            className="h-12 sm:h-14 w-auto object-contain"
                                        />
                                    </div>
                                    
                                    <div className="text-[12px] text-neutral-800 space-y-1 pt-1 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-black font-bold">📍</span>
                                            <span>Tulsi Arcade, Mota Varachha, Surat, Gujarat 394101</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-black font-bold">📞</span>
                                            <span>Telp. +91 8347640423</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-black font-bold">✉</span>
                                            <span>Email: adheenbhuva0007@gmail.com</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side Tagline with subtle vertical border */}
                                <div className="hidden sm:block border-l-2 border-slate-300 pl-4 py-1 text-right self-stretch">
                                    <p className="text-xs italic text-slate-500 font-medium leading-relaxed">
                                        Spreading Smiles,<br />
                                        One Toy at a Time
                                    </p>
                                </div>
                            </div>

                        {/* Top Thick Navy Divider */}
                        <div className="h-1 w-full bg-[#1c274c] mb-6"></div>

                        {/* 2. INVOICE Title & Invoice Info Box */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-[#1c274c] tracking-wider uppercase">
                                    INVOICE
                                </h2>
                            </div>

                            {/* Invoice Meta Table */}
                            <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3 sm:px-5 sm:py-3 w-full sm:w-auto min-w-[270px]">
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="text-slate-500 font-bold pr-3 py-1">Order ID</td>
                                            <td className="text-slate-400 font-bold px-1">:</td>
                                            <td className="text-[#1c274c] font-extrabold text-right py-1 tracking-wider font-mono">
                                                {displayOrderId}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-slate-500 font-bold pr-3 py-1">Invoice No.</td>
                                            <td className="text-slate-400 font-bold px-1">:</td>
                                            <td className="text-[#1c274c] font-semibold text-right py-1 font-mono">
                                                {invoiceNumber}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-slate-500 font-bold pr-3 py-1">Date</td>
                                            <td className="text-slate-400 font-bold px-1">:</td>
                                            <td className="text-[#1c274c] font-semibold text-right py-1">
                                                {dateFormatted}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 3. Billed To */}
                        <div className="mb-6 pt-2 pb-5 border-b border-slate-200">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                                Billed To:
                            </p>
                            <table className="text-xs text-slate-700">
                                <tbody>
                                    <tr>
                                        <td className="font-semibold text-slate-500 py-1 w-24">Name</td>
                                        <td className="text-slate-400 font-bold px-2">:</td>
                                        <td className="font-bold text-slate-900 py-1 text-sm">{customerName}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold text-slate-500 py-1 align-top">Address</td>
                                        <td className="text-slate-400 font-bold px-2 align-top">:</td>
                                        <td className="py-1 leading-relaxed text-slate-800">
                                            {formattedAddress.length > 0 ? formattedAddress.join(', ') : 'Not provided'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold text-slate-500 py-1">Contact</td>
                                        <td className="text-slate-400 font-bold px-2">:</td>
                                        <td className="py-1 text-slate-600">
                                            {[customerPhone, customerEmail].filter(Boolean).join(' | ') || 'Not specified'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 4. Line Items Table */}
                        <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#1c274c] text-white font-bold text-center">
                                        <th className="py-3 px-3 w-12 border-r border-slate-600">No.</th>
                                        <th className="py-3 px-4 text-left border-r border-slate-600">Item Description</th>
                                        <th className="py-3 px-3 w-20 border-r border-slate-600">Qty</th>
                                        <th className="py-3 px-4 text-right w-28 border-r border-slate-600">Price (₹)</th>
                                        <th className="py-3 px-4 text-right w-28">Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {rawItems.map((item, index) => {
                                        const itemName = item.name || item.product?.name || item.title || 'Toy Item';
                                        const qty = Number(item.quantity || 1);
                                        const unitPrice = Number(item.price !== undefined ? item.price : (item.product?.price || 0));
                                        const rowTotal = unitPrice * qty;

                                        return (
                                            <tr key={index} className="text-slate-800 hover:bg-slate-50/50">
                                                <td className="py-3 px-3 text-center border-r border-slate-200 font-medium text-slate-500">
                                                    {index + 1}
                                                </td>
                                                <td className="py-3 px-4 border-r border-slate-200 font-semibold text-slate-900">
                                                    {itemName}
                                                </td>
                                                <td className="py-3 px-3 text-center border-r border-slate-200 font-medium">
                                                    {qty} Unit
                                                </td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 font-medium">
                                                    ₹{formatCurrency(unitPrice)}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-900">
                                                    ₹{formatCurrency(rowTotal)}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* Subtotal, Shipping, Discount & Grand Total block */}
                                    <tr className="border-t-2 border-slate-300">
                                        <td colSpan="3" className="border-r border-slate-200 bg-slate-50/50"></td>
                                        <td className="py-2 px-4 text-right font-bold text-slate-700 border-r border-slate-200 bg-slate-50">
                                            Sub Total
                                        </td>
                                        <td className="py-2 px-4 text-right font-bold text-slate-900 bg-slate-50">
                                            ₹{formatCurrency(subTotal)}
                                        </td>
                                    </tr>

                                    {shippingCharge > 0 && (
                                        <tr>
                                            <td colSpan="3" className="border-r border-slate-200 bg-slate-50/50"></td>
                                            <td className="py-2 px-4 text-right font-bold text-slate-700 border-r border-slate-200 bg-slate-50">
                                                Shipping Fee
                                            </td>
                                            <td className="py-2 px-4 text-right font-bold text-slate-900 bg-slate-50">
                                                ₹{formatCurrency(shippingCharge)}
                                            </td>
                                        </tr>
                                    )}

                                    {discountAmount > 0 && (
                                        <tr>
                                            <td colSpan="3" className="border-r border-slate-200 bg-slate-50/50"></td>
                                            <td className="py-2 px-4 text-right font-bold text-emerald-700 border-r border-slate-200 bg-emerald-50/50">
                                                Discount / Coupon ({order.couponCode || 'Promo'})
                                            </td>
                                            <td className="py-2 px-4 text-right font-bold text-emerald-700 bg-emerald-50/50">
                                                -₹{formatCurrency(discountAmount)}
                                            </td>
                                        </tr>
                                    )}

                                    <tr className="bg-slate-100 font-extrabold text-sm">
                                        <td colSpan="3" className="border-r border-slate-200"></td>
                                        <td className="py-3 px-4 text-right text-[#1c274c] border-r border-slate-200">
                                            Total Amount
                                        </td>
                                        <td className="py-3 px-4 text-right text-[#1c274c]">
                                            ₹{formatCurrency(totalAmount)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 5. Amount in Words Card */}
                        <div className="bg-[#eef4ff] rounded-xl p-3.5 mb-6 flex items-center gap-3 border border-[#d6e3fc]">
                            <div className="w-10 h-10 rounded-full bg-[#1c274c] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                ₹
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Amount in Words:
                                </p>
                                <p className="text-xs sm:text-sm font-bold text-[#1c274c] italic mt-0.5">
                                    {numberToWords(totalAmount)}
                                </p>
                            </div>
                        </div>

                        {/* 6. Footer Section: Payment Method, Status, Terms & Store Info */}
                        <div className="pt-2 space-y-6">
                            {/* Row 1: Payment Method (Left) + Status Badge (Right) */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#1c274c] shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="5" width="20" height="14" rx="2" />
                                            <line x1="2" y1="10" x2="22" y2="10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Payment Method</p>
                                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                                            {order.paymentMethod || 'Razorpay'}
                                        </p>
                                        {order.razorpayPaymentId && (
                                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                Txn ID: {order.razorpayPaymentId}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-center">
                                    <span className="text-xs font-bold text-slate-700">Status:</span>
                                    <div className={`px-5 py-1.5 rounded-md font-extrabold text-xs tracking-wider border shadow-sm ${
                                        isPaid 
                                            ? 'bg-[#182649] text-white border-[#182649]' 
                                            : 'bg-amber-100 text-amber-800 border-amber-300'
                                    }`}>
                                        {isPaid ? 'PAID' : paymentStatus}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Terms & Conditions (Left) + Surat, Date & Store Info (Right) */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-1">
                                <div className="flex items-start gap-3 max-w-xl">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#1c274c] shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                        </svg>
                                    </div>
                                    <div className="text-xs text-slate-600 space-y-1.5">
                                        <p className="font-bold text-slate-900">Terms &amp; Conditions:</p>
                                        <p className="leading-relaxed text-[11px] text-slate-500">
                                            • Goods once sold can be returned or exchanged within 7 days as per store policy.<br />
                                            • Please retain this invoice as official proof of purchase.
                                        </p>
                                        <p className="text-[11px] italic font-semibold text-slate-800 pt-0.5">
                                            Thank you for shopping with Little Joys!
                                        </p>
                                    </div>
                                </div>

                                <div className="text-left sm:text-right shrink-0 self-end">
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Surat, {dateFormatted}
                                    </p>
                                    <p className="text-sm font-black text-[#182649] tracking-tight mt-0.5">
                                        LITTLE JOYS TOYS STORE
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        Computer Generated Invoice
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Subtle watermarked bottom line */}
                        <div className="border-t border-slate-200 mt-8 pt-3 flex justify-between text-[10px] text-slate-400">
                            <span>Little Joys Online Store • https://littlejoys.com</span>
                            <span>Invoice Generated: {new Date().toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                    {/* Bottom Toolbar for easy mobile access */}
                    <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-col justify-center items-center gap-4 print:hidden">
                        <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-8 py-3 bg-[#1c274c] text-white rounded-xl font-bold hover:bg-[#121c3b] transition-colors shadow-lg shadow-blue-900/10 w-full sm:w-auto justify-center text-sm"
                        >
                            <Download className="w-4 h-4" /> Download Invoice PDF
                        </button>
                    </div>

                    {/* Print CSS */}
                    <style>{`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #invoice-content, #invoice-content * {
                                visibility: visible;
                            }
                            #invoice-content {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                padding: 20px;
                            }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
