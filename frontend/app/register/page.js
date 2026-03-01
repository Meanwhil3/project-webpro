'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: 'Warehouse Staff' // ค่าเริ่มต้น
  })
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await res.json()

    if (res.ok) {
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
      router.push('/login')
    } else {
      alert(data.error)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 text-black">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">สมัครใช้งานระบบ WMS</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อ-นามสกุล</label>
            <input 
              type="text" 
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, fullname: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">อีเมล</label>
            <input 
              type="email" 
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ตำแหน่ง (Role)</label>
            <select 
              className="w-full p-3 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="Warehouse Staff">พนักงานคลังสินค้า (Staff)</option>
              <option value="Warehouse Manager">ผู้จัดการคลังสินค้า (Manager)</option>
            </select>
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg mt-8 font-semibold hover:bg-blue-700 transition shadow-md">
          สร้างบัญชีผู้ใช้
        </button>

        <p className="mt-4 text-center text-gray-600">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-blue-600 hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  )
}