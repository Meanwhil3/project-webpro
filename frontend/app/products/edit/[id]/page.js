'use client'
import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, ArrowLeft, Save, Hash, PlusCircle, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage({ params }) {
  const router = useRouter()
  const { id } = use(params) 

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const catRef = useRef(null)
  const brandRef = useRef(null)

  const [formData, setFormData] = useState({
    product_code: '',
    model_name: '',
    brand: '',
    category_id: '',
    category_name: '',
    description: '',
    price: '',
    stock_quantity: '',
    min_threshold: 5
  })

  useEffect(() => {
    // ป้องกัน Staff เข้าหน้าแก้ไข
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== 'Warehouse Manager') {
        router.replace('/products');
        return;
    }
    setIsAuthorized(true);

    const fetchData = async () => {
      try {
        const catRes = await fetch('http://localhost:5000/api/categories').then(res => res.json())
        setCategories(catRes)
        const prodAllRes = await fetch('http://localhost:5000/api/products').then(res => res.json())
        setBrands([...new Set(prodAllRes.map(p => p.brand))].filter(b => b))
        const res = await fetch(`http://localhost:5000/api/products-detail/${id}`)
        const data = await res.json()
        setFormData({ ...data, category_name: data.category_name || '' })
      } catch (err) { router.push('/products') }
      finally { setLoading(false) }
    }
    fetchData()

    const handleClickOutside = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setShowCatDropdown(false)
      if (brandRef.current && !brandRef.current.contains(e.target)) setShowBrandDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) { alert('อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว!'); router.push('/products'); }
    } catch { alert('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  if (!isAuthorized || loading) return <div className="p-8 text-center text-slate-500 font-bold">กำลังโหลด...</div>

  const filteredCategories = categories.filter(c => c.category_name.toLowerCase().includes((formData.category_name || '').toLowerCase()))
  const filteredBrands = brands.filter(b => b.toLowerCase().includes((formData.brand || '').toLowerCase()))

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div><h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><Edit2 className="text-amber-600" /> แก้ไขข้อมูลสินค้า</h1></div>
          <Link href="/products" className="text-blue-600 hover:underline flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> กลับคลังสินค้า</Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-blue-600 flex items-center gap-1"><Hash className="w-3 h-3" /> SKU *</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-500 font-mono" value={formData.product_code} readOnly />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">ชื่อโมเดลสินค้า *</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border bg-white" value={formData.model_name} onChange={(e) => setFormData({...formData, model_name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 relative" ref={brandRef}>
                <label className="text-xs font-bold text-slate-500 uppercase">แบรนด์ *</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border bg-white" value={formData.brand} onFocus={() => setShowBrandDropdown(true)} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
                {showBrandDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {filteredBrands.map((b, i) => (<div key={i} className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => { setFormData({...formData, brand: b}); setShowBrandDropdown(false); }}>{b}</div>))}
                  </div>
                )}
              </div>
              <div className="space-y-2 relative" ref={catRef}>
                <label className="text-xs font-bold text-slate-500 uppercase">หมวดหมู่ *</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border bg-white" value={formData.category_name} onFocus={() => setShowCatDropdown(true)} onChange={(e) => setFormData({...formData, category_name: e.target.value, category_id: ''})} />
                {showCatDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {filteredCategories.map((c) => (<div key={c.category_id} className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => { setFormData({...formData, category_id: c.category_id, category_name: c.category_name}); setShowCatDropdown(false); }}>{c.category_name}</div>))}
                  </div>
                )}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2"><label className="text-xs font-bold text-slate-500">ราคา (฿)</label><input type="number" className="w-full px-4 py-3 rounded-xl border" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-500">สต็อก / จุดเตือน</label>
                <div className="flex gap-4">
                  <input type="number" className="w-1/2 px-4 py-3 rounded-xl border bg-slate-50" value={formData.stock_quantity} readOnly />
                  <input type="number" className="w-1/2 px-4 py-3 rounded-xl border bg-white" value={formData.min_threshold} onChange={(e) => setFormData({...formData, min_threshold: e.target.value})} />
                </div>
              </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-6 flex justify-end gap-4 border-t">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-200">ยกเลิก</button>
            <button disabled={saving} type="submit" className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700"><Save className="w-4 h-4 mr-2 inline" /> {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}