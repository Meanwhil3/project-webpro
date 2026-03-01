'use client'
import { useState, useEffect } from 'react'
import { Search, Eye, Edit2, Trash2, Plus } from 'lucide-react'

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('all');

    useEffect(() => {
        // ดึงข้อมูล Categories
        fetch('http://localhost:5000/api/categories')
            .then(res => res.json())
            .then(setCategories);
        
        // ดึงข้อมูล Products
        fetchProducts();
    }, [search, selectedCat]);

    const fetchProducts = () => {
        const query = new URLSearchParams({ search, category: selectedCat }).toString();
        fetch(`http://localhost:5000/api/products?${query}`)
            .then(res => res.json())
            .then(setProducts);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-slate-700">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">สินค้าทั้งหมด</h1>
                    <p className="text-sm text-slate-500">{products.length} รายการ</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm">
                    <Plus className="w-4 h-4" /> เพิ่มสินค้า
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4 items-center border border-slate-100">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400"><Search className="w-4 h-4" /></span>
                    <input 
                        type="text" 
                        placeholder="ค้นหาชื่อ, แบรนด์..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select 
                    className="border border-slate-200 p-2 rounded-lg outline-none bg-white min-w-[150px]"
                    onChange={(e) => setSelectedCat(e.target.value)}
                >
                    <option value="all">ทุกหมวดหมู่</option>
                    {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_name}>{cat.category_name}</option>
                    ))}
                </select>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm font-medium">
                        <tr>
                            <th className="p-4">แบรนด์</th>
                            <th className="p-4">ชื่อสินค้า</th>
                            <th className="p-4 text-center">หมวดหมู่</th>
                            <th className="p-4 text-right">ราคา</th>
                            <th className="p-4 text-center">คงเหลือ</th>
                            <th className="p-4 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {products.map((p) => (
                            <tr key={p.product_id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-semibold text-slate-900">{p.brand}</td>
                                <td className="p-4 text-slate-600">{p.model_name}</td>
                                <td className="p-4 text-center">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                        {p.category_name}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-medium">{p.price.toLocaleString()} ฿</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-lg font-bold ${p.stock_quantity <= p.min_threshold ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                                        {p.stock_quantity}
                                    </span>
                                </td>
                                <td className="p-4 text-center space-x-3 text-slate-400">
                                    <button className="hover:text-blue-600"><Eye className="w-4 h-4 inline" /></button>
                                    <button className="hover:text-amber-600"><Edit2 className="w-4 h-4 inline" /></button>
                                    <button className="hover:text-red-600"><Trash2 className="w-4 h-4 inline" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="p-10 text-center text-slate-400">ไม่พบข้อมูลสินค้า</div>
                )}
            </div>
        </div>
    )
}