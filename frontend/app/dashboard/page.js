'use client'
import { useState, useEffect } from 'react'
import { Package, DollarSign, AlertTriangle, ArrowRightLeft } from 'lucide-react'

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div>{icon}</div>
    </div>
  )
}

export default function Dashboard() {
  const [lowStock, setLowStock] = useState([])
  const [user, setUser] = useState(null)
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowCount: 0,
    transactionsToday: 0
  })
  const [recentMovements, setRecentMovements] = useState([])
  const [monthlyMovement, setMonthlyMovement] = useState({ stockIn: 0, stockOut: 0 })
  const [categoryBreakdown, setCategoryBreakdown] = useState([])

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('user'))
      setUser(parsed)
    } catch {
      setUser(null)
    }

    fetch('http://localhost:5000/api/notifications/low-stock')
      .then(res => res.json())
      .then(data => setLowStock(data))
      .catch(() => setLowStock([]))

    fetch('http://localhost:5000/api/notifications/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(() => setSummary({ totalProducts: 0, totalValue: 0, lowCount: 0, transactionsToday: 0 }))

    fetch('http://localhost:5000/api/transactions/recent')
      .then(res => res.json())
      .then(data => {
        const mapped = data.slice(0, 5).map(item => ({
          name: item.model_name,
          type: item.type === 'Stock-In' ? 'นำเข้า' : 'เบิกจ่าย',
          qty: item.quantity,
          date: item.transaction_date?.split('T')[0] || '-'
        }))
        setRecentMovements(mapped)
      })
      .catch(() => setRecentMovements([]))

    fetch('http://localhost:5000/api/transactions/monthly-summary?months=1')
      .then(res => res.json())
      .then(data => setMonthlyMovement({
        stockIn: Number(data.stockIn || 0),
        stockOut: Number(data.stockOut || 0)
      }))
      .catch(() => setMonthlyMovement({ stockIn: 0, stockOut: 0 }))

    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        const grouped = data.reduce((acc, item) => {
          const categoryName = item.category_name || 'อื่นๆ'
          const stockQuantity = Number(item.stock_quantity || 0)
          acc[categoryName] = (acc[categoryName] || 0) + stockQuantity
          return acc
        }, {})

        const palette = ['#0062ff', '#f59e0b', '#00cf34', '#e40000', '#ae00ff', '#73ff00', '#ff51e8', '#000000']
        const entries = Object.entries(grouped)
          .map(([name, value], index) => ({
            name,
            value,
            color: palette[index % palette.length]
          }))
          .filter(item => item.value > 0)

        setCategoryBreakdown(entries)
      })
      .catch(() => setCategoryBreakdown([]))
  }, [])

  const maxMovement = Math.max(monthlyMovement.stockIn, monthlyMovement.stockOut, 1)
  const totalCategoryStock = categoryBreakdown.reduce((sum, item) => sum + item.value, 0)

  const pieGradient = totalCategoryStock > 0
    ? (() => {
        let currentPercent = 0
        const segments = categoryBreakdown.map(item => {
          const segmentPercent = (item.value / totalCategoryStock) * 100
          const start = currentPercent
          currentPercent += segmentPercent
          return `${item.color} ${start}% ${currentPercent}%`
        })
        return `conic-gradient(${segments.join(', ')})`
      })()
    : 'conic-gradient(#e5e7eb 0% 100%)'

  return (
    <div className="p-6 bg-gray-50 text-gray-900 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
          <p className="text-sm text-gray-500">ภาพรวมระบบคลังอุปกรณ์คอมพิวเตอร์</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">ยินดีต้อนรับ,</div>
          <div className="font-semibold">{user?.fullname || user?.name || 'ผู้ดูแลระบบ'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="สินค้าทั้งหมด" value={`${summary.totalProducts} รายการ`} icon={<Package className="w-7 h-7 text-blue-500" />} />
        <StatCard title="มูลค่าสินค้าคงเหลือ" value={`${Number(summary.totalValue || 0).toLocaleString()} ฿`} icon={<DollarSign className="w-7 h-7 text-green-500" />} />
        <StatCard title="สินค้าใกล้หมด" value={`${summary.lowCount} รายการ`} icon={<AlertTriangle className="w-7 h-7 text-red-500" />} />
        <StatCard title="เคลื่อนไหววันนี้" value={`${summary.transactionsToday} รายการ`} icon={<ArrowRightLeft className="w-7 h-7 text-yellow-500" />} />
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg shadow p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">สินค้าเข้า-ออกรายเดือน</h2>
            <div className="text-sm text-gray-400">ภายใน 1 เดือน</div>
          </div>
          <div className="w-full h-48 bg-gray-50 rounded p-5 flex flex-col justify-center gap-6">
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-700">สินค้าเข้า</span>
                <span className="font-medium text-blue-600">{monthlyMovement.stockIn}</span>
              </div>
              <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(monthlyMovement.stockIn / maxMovement) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-700">สินค้าออก</span>
                <span className="font-medium text-orange-600">{monthlyMovement.stockOut}</span>
              </div>
              <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(monthlyMovement.stockOut / maxMovement) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
          <h3 className="font-semibold mb-4">สัดส่วนหมวดหมู่</h3>
          <div className="w-full h-56 bg-gray-50 rounded p-4 flex-1 flex items-center gap-4">
            <div className="w-40 h-40 rounded-full shrink-0" style={{ background: pieGradient }} />

            <div className="flex-1 text-sm space-y-2 overflow-auto">
              {categoryBreakdown.length === 0 ? (
                <div className="text-gray-400">ไม่มีข้อมูลหมวดหมู่</div>
              ) : (
                categoryBreakdown.map(item => {
                  const percent = totalCategoryStock > 0 ? ((item.value / totalCategoryStock) * 100).toFixed(1) : '0.0'
                  return (
                    <div key={item.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-700 truncate">{item.name}</span>
                      </div>
                      <span className="text-gray-500 whitespace-nowrap">{percent}%</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">สินค้าใกล้หมด</h4>
              <div className="text-sm text-gray-400">รายการสำคัญ</div>
            </div>
            <div className="flex-1 overflow-auto">
              {lowStock.length === 0 ? (
                <div className="text-sm text-gray-500">ไม่มีสินค้าที่ใกล้หมดในขณะนี้</div>
              ) : (
                <ul className="divide-y">
                  {lowStock.map(item => (
                    <li key={item.product_id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.model_name}</div>
                        <div className="text-sm text-gray-500">รหัส: {item.product_id}</div>
                      </div>
                      <div className="text-sm text-red-600">{item.stock_quantity}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">รายการเคลื่อนไหวล่าสุด</h4>
              <div className="text-sm text-gray-400">กิจกรรมล่าสุด</div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">สินค้า</th>
                    <th className="py-2">ประเภท</th>
                    <th className="py-2">จำนวน</th>
                    <th className="py-2">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((row, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-3">{row.name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${row.type === 'นำเข้า' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3">{row.qty}</td>
                      <td className="py-3 text-gray-500">{row.date}</td>
                    </tr>
                  ))}
                  {recentMovements.length === 0 && (
                    <tr>
                      <td className="py-3 text-gray-500" colSpan={4}>ยังไม่มีประวัติการเคลื่อนไหว</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}