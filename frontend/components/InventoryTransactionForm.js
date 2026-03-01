'use client'
import { useEffect, useState } from 'react'
import { Download, Upload } from 'lucide-react'

export default function InventoryTransactionForm({ mode }) {
  const isStockIn = mode === 'in'
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    try {
      const parsedUser = JSON.parse(localStorage.getItem('user'))
      setUser(parsedUser)
    } catch {
      setUser(null)
    }

    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setMessage({ type: '', text: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.product_id) {
      setMessage({ type: 'error', text: 'กรุณาเลือกสินค้า' })
      return
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setMessage({ type: 'error', text: 'กรุณากรอกจำนวนที่มากกว่า 0' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: Number(formData.product_id),
          user_id: user?.id || user?.user_id || 1,
          type: isStockIn ? 'Stock-In' : 'Stock-Out',
          quantity: Number(formData.quantity),
          note: formData.notes,
          transaction_date: formData.date
        })
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'เกิดข้อผิดพลาดในการบันทึก')
      }

      const selectedProduct = products.find(p => p.product_id === Number(formData.product_id))
      setMessage({
        type: 'success',
        text: isStockIn
          ? `บันทึกรับเข้าสินค้า "${selectedProduct?.model_name || ''}" สำเร็จ`
          : `บันทึกเบิกจ่ายสินค้า "${selectedProduct?.model_name || ''}" สำเร็จ`
      })

      setFormData({
        product_id: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })

      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(() => {})
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const pageTitle = isStockIn ? 'นำเข้าสินค้า' : 'เบิกจ่ายสินค้า'
  const formTitle = isStockIn ? 'ฟอร์มนำเข้าสินค้า' : 'ฟอร์มเบิกจ่ายสินค้า'
  const quantityLabel = isStockIn ? 'จำนวนที่นำเข้า' : 'จำนวนที่เบิกจ่าย'
  const submitLabel = isStockIn ? 'บันทึกรายการนำเข้า' : 'บันทึกรายการเบิกจ่าย'

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">บันทึกสินค้าเข้าคลัง</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          {isStockIn ? <Download className="w-6 h-6 text-blue-500" /> : <Upload className="w-6 h-6 text-orange-500" />}
          {formTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">สินค้า</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            >
              <option value="">เลือกสินค้า</option>
              {products.map(item => (
                <option key={item.product_id} value={item.product_id}>
                  {item.model_name} ({item.brand}) - คงเหลือ {item.stock_quantity}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{quantityLabel}</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
            <textarea
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="ระบุหมายเหตุ (ถ้ามี)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-white transition ${
              loading
                ? 'bg-slate-400 cursor-not-allowed'
                : isStockIn
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {loading ? 'กำลังบันทึก...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
