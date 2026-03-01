'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import NavBar from '@/components/NavBar'
import './globals.css'

export default function RootLayout({ children }) {
  const pathname = usePathname()

  // กำหนดหน้าที่ไม่ต้องแสดง Sidebar (เช่น หน้า Login และ Register)
  const authPages = ['/login', '/register']
  const isAuthPage = authPages.includes(pathname)
  const [showSidebar, setShowSidebar] = React.useState(true)

  const toggleSidebar = () => setShowSidebar(prev => !prev)

  return (
    <html lang="th">
      <body className="bg-gray-50 text-slate-900">
        <div className="flex min-h-screen">
          {/* แสดง Sidebar เฉพาะเมื่อไม่ใช่หน้า Auth */}
          {!isAuthPage && showSidebar && <Sidebar />}

          {/* ถ้าเป็นหน้า Auth ให้ใช้เต็มความกว้าง ถ้าไม่ใช่ให้แบ่งพื้นที่กับ Sidebar */}
          <main className={`flex-1 flex flex-col ${isAuthPage ? 'w-full' : 'overflow-y-auto'}`}>
            {!isAuthPage && <NavBar onToggleSidebar={toggleSidebar} />}
            <div className="p-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}