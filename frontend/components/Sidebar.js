// frontend/components/Sidebar.js

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Monitor, LayoutDashboard, Boxes, Download, Upload, LogOut } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState({ fullname: 'Loading...', email: '', role: '' })

  useEffect(() => {
    // 1. ดึงข้อมูลเบื้องต้นจาก localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      
      // 2. ไปดึงข้อมูลที่อัปเดตที่สุดจาก Database ผ่าน API
      // ใช้ ID ที่ได้จากการ Login/Register
      const userId = parsedUser.id || parsedUser.user_id 
      
      if (userId) {
        fetch(`http://localhost:5000/api/users/${userId}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) {
              setUser(data)
            }
          })
          .catch(err => console.error("Failed to fetch user:", err))
      }
    } else {
      // ถ้าไม่มีข้อมูลใน localStorage เลย ให้เด้งไปหน้า login
      // router.push('/login') // เปิดใช้งานส่วนนี้หากต้องการบังคับ login
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  const menuItems = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'สินค้าทั้งหมด', href: '/products', icon: <Boxes className="w-5 h-5" /> },
    { name: 'นำเข้าสินค้า', href: '/stockin', icon: <Download className="w-5 h-5" /> },
    { name: 'เบิกจ่ายสินค้า', href: '/stockout', icon: <Upload className="w-5 h-5" /> },
  ]

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 shadow-xl">
      <div className="p-6">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <span className="p-2 bg-blue-600 rounded-lg text-lg shadow-lg shadow-blue-500/20"><Monitor className="w-5 h-5" /></span>
          IT Inventory
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">ระบบจัดการคลังอุปกรณ์</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === item.href 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section - Now dynamic from DB */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-slate-800">
            {user.fullname ? user.fullname[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.fullname}</p>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-all hover:scale-110 p-1"
            title="ออกจากระบบ"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}