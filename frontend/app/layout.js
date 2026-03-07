'use client'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import NavBar from '@/components/NavBar'
// import './globals.css' // ถ้าคุณลบไฟล์นี้ออก หรือไม่ใช้ npm install แล้ว ให้ Comment ไว้ครับ

const AUTH_PAGES = ['/login', '/register']

function getDefaultPathByRole(role) {
  return role === 'Warehouse Manager' ? '/dashboard' : '/products'
}

function canAccessPath(role, pathname) {
  if (!role) return false
  if (role === 'Warehouse Manager') return true

  const staffBlockedPrefixes = [
    '/dashboard',
    '/reports',
    '/low-stock',
    '/products/add',
    '/products/edit',
  ]

  return !staffBlockedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export default function RootLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthPage = AUTH_PAGES.includes(pathname)
  const [showSidebar, setShowSidebar] = React.useState(true)
  const [isRouteReady, setIsRouteReady] = React.useState(false)

  const toggleSidebar = () => setShowSidebar(prev => !prev)

  React.useEffect(() => {
    if (!pathname) return

    let savedUser = null
    try {
      savedUser = JSON.parse(localStorage.getItem('user'))
    } catch {
      savedUser = null
    }

    const role = savedUser?.role

    if (!savedUser && !isAuthPage) {
      setIsRouteReady(false)
      router.replace('/login')
      return
    }

    if (savedUser && isAuthPage) {
      setIsRouteReady(false)
      router.replace(getDefaultPathByRole(role))
      return
    }

    if (savedUser && !isAuthPage && !canAccessPath(role, pathname)) {
      setIsRouteReady(false)
      router.replace(getDefaultPathByRole(role))
      return
    }

    setIsRouteReady(true)
  }, [pathname, isAuthPage, router])

  const shouldRenderLayout = isAuthPage || isRouteReady

  return (
    <html lang="th">
      <head>
        
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        

      </head>
      <body className="bg-gray-50 text-slate-900">
        {shouldRenderLayout ? (
          <div className="flex min-h-screen">
            {!isAuthPage && showSidebar && <Sidebar />}

            <main className={`flex-1 flex flex-col ${isAuthPage ? 'w-full' : 'overflow-y-auto'}`}>
              {!isAuthPage && <NavBar onToggleSidebar={toggleSidebar} />}
              <div className="p-4">{children}</div>
            </main>
          </div>
        ) : (
          <div className="min-h-screen" />
        )}
      </body>
    </html>
  )
}