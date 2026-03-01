'use client'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export default function RootLayout({ children }) {
  const pathname = usePathname()

  // กำหนดหน้าที่ไม่ต้องแสดง Sidebar (เช่น หน้า Login และ Register)
  const authPages = ['/login', '/register']
  const isAuthPage = authPages.includes(pathname)

  return (
    <html lang="th">
      <body className="bg-gray-50 text-slate-900">
        <div className="flex min-h-screen">
          {/* แสดง Sidebar เฉพาะเมื่อไม่ใช่หน้า Auth */}
          {!isAuthPage && <Sidebar />}

          {/* ถ้าเป็นหน้า Auth ให้ใช้เต็มความกว้าง ถ้าไม่ใช่ให้แบ่งพื้นที่กับ Sidebar */}
          <main className={`flex-1 ${isAuthPage ? 'w-full' : 'overflow-y-auto'}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}