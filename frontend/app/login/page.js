'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    // ในระบบจริงต้องยิง API เช็ค แต่เพื่อการทดสอบเราจะจำลองดังนี้:
    if (email === 'manager@test.com') {
      localStorage.setItem('user', JSON.stringify({ id: 2, name: 'Manager Somsri', role: 'Warehouse Manager' }))
      router.push('/dashboard')
    } else {
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Staff Somchai', role: 'Warehouse Staff' }))
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 text-black">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">WMS Login</h2>
        <input type="email" placeholder="Email" className="w-full p-2 border mb-4" onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-2 border mb-6" onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">เข้าสู่ระบบ</button>
      </form>
    </div>
  )
}