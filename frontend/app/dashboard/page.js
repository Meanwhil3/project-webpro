'use client'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [lowStock, setLowStock] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')))
    fetch('http://localhost:5000/api/notifications/low-stock')
      .then(res => res.json())
      .then(data => setLowStock(data))
  }, [])

  return (
    <div className="p-8 text-black">
      <h1 className="text-3xl font-bold mb-4">ยินดีต้อนรับ, {user?.name}</h1>
      <p className="mb-8 font-semibold">สิทธิ์การใช้งาน: <span className="text-blue-600">{user?.role}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 shadow-sm">
          <h2 className="text-xl font-bold text-red-700 mb-2">⚠️ สินค้าสต็อกต่ำ ({lowStock.length})</h2>
          <ul className="list-disc pl-5 text-red-600">
            {lowStock.map(item => (
              <li key={item.product_id}>{item.model_name} - เหลือเพียง {item.stock_quantity} ชิ้น</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}