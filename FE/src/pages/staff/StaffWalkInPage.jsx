import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../config/axios'
import { searchCustomersApi, createWalkInOrderApi, createGuestCustomerApi } from '../../services/rent-order.service'
import { createDepositPaymentLinkApi } from '../../services/payment.service'

// Trả về "YYYY-MM-DDThh:mm" theo giờ địa phương để dùng với datetime-local
const nowLocalIso = () => {
  const d = new Date()
  d.setSeconds(0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatMoney = (v) => `${Number(v || 0).toLocaleString('vi-VN')}đ`
const normalizeSizeValue = (value) => String(value || '').trim()
const getProductSizeOptions = (product = {}) => {
  const direct = Array.isArray(product?.sizeOptions) ? product.sizeOptions : []
  const rows = Array.isArray(product?.sizes) ? product.sizes.map((row) => (typeof row === 'object' ? row?.size : row)) : []
  const merged = [...direct, ...rows]
    .map((size) => normalizeSizeValue(size))
    .filter(Boolean)
  return [...new Set(merged)]
}

export default function StaffWalkInPage() {
  const navigate = useNavigate()

  // Step: 1 = chọn khách, 2 = chọn sản phẩm + ngày, 3 = xác nhận thu cọc
  const [step, setStep] = useState(1)
  const [depositMethod, setDepositMethod] = useState('Cash') // 'Cash' | 'PayOS'
  const [createdOrder, setCreatedOrder] = useState(null) // sau khi API thành công

  // Customer
  const [customerMode, setCustomerMode] = useState('search') // 'search' | 'new'
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [customerSearching, setCustomerSearching] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [creatingGuest, setCreatingGuest] = useState(false)

  // Dates (datetime-local: "YYYY-MM-DDThh:mm")
  const [startDate, setStartDate] = useState(nowLocalIso)
  const [endDate, setEndDate] = useState(nowLocalIso)

  // Products
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState([])
  const [productSearching, setProductSearching] = useState(false)
  const [sizeSelectionByProductId, setSizeSelectionByProductId] = useState({})
  const [items, setItems] = useState([]) // { itemKey, productId, name, image, rentPrice, size }
  const [advisorItemKey, setAdvisorItemKey] = useState('')
  const [advisorGender, setAdvisorGender] = useState('female')
  const [advisorHeightCm, setAdvisorHeightCm] = useState('')
  const [advisorWeightKg, setAdvisorWeightKg] = useState('')
  const [advisorResult, setAdvisorResult] = useState(null)
  const [advisorError, setAdvisorError] = useState('')
  const [advisorLoading, setAdvisorLoading] = useState(false)

  // Submission
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const searchTimer = useRef(null)

  useEffect(() => {
    // on mount
  }, [])

  // ---- Computed ----
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1
    const diffMs = new Date(endDate) - new Date(startDate)
    if (diffMs <= 0) return 1
    // Làm tròn lên theo ngày; tính theo giờ để hiển thị chính xác
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }, [startDate, endDate])

  const rentalHours = useMemo(() => {
    if (!startDate || !endDate) return null
    const diffMs = new Date(endDate) - new Date(startDate)
    if (diffMs <= 0) return null
    const h = Math.floor(diffMs / (1000 * 60 * 60))
    const m = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    if (h < 24) return `${h} giờ${m > 0 ? ` ${m} phút` : ''}`
    return `${rentalDays} ngày${h % 24 > 0 ? ` ${h % 24} giờ` : ''}`
  }, [startDate, endDate, rentalDays])

  const total = useMemo(() => items.reduce((s, i) => s + i.rentPrice * rentalDays, 0), [items, rentalDays])
  const deposit = Math.round(total * 0.5)

  // ---- Customer search ----
  const handleCustomerSearch = useCallback((q) => {
    setCustomerQuery(q)
    clearTimeout(searchTimer.current)
    if (!q.trim()) { setCustomerResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setCustomerSearching(true)
      try {
        const res = await searchCustomersApi(q)
        setCustomerResults(res.data || [])
      } catch {
        setCustomerResults([])
      } finally {
        setCustomerSearching(false)
      }
    }, 350)
  }, [])

  const handleCreateGuest = async () => {
    if (!newName.trim()) { setError('Vui lòng nhập tên khách hàng'); return }
    setError('')
    setCreatingGuest(true)
    try {
      const res = await createGuestCustomerApi({ name: newName.trim(), phone: newPhone.trim() || undefined })
      setCustomer(res.data)
      setCustomerMode('search')
      setNewName('')
      setNewPhone('')
    } catch (err) {
      const data = err.response?.data
      if (data?.existingCustomer) {
        setCustomer(data.existingCustomer)
        setCustomerMode('search')
        setNewName('')
        setNewPhone('')
        setError('')
      } else {
        setError(data?.message || 'Có lỗi xảy ra khi tạo khách hàng')
      }
    } finally {
      setCreatingGuest(false)
    }
  }

  // ---- Product search ----
  const handleProductSearch = useCallback((q) => {
    setProductQuery(q)
    clearTimeout(searchTimer.current)
    if (!q.trim()) { setProductResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setProductSearching(true)
      try {
        const res = await axiosClient.get('/products', { params: { search: q, purpose: 'rent', limit: 8 } })
        setProductResults(res.data?.data || [])
      } catch {
        setProductResults([])
      } finally {
        setProductSearching(false)
      }
    }, 350)
  }, [])

  const addProduct = (product) => {
    const rentPrice = Number(product.baseRentPrice || product.commonRentPrice || product.rentPrice || 0)
    if (!rentPrice) return
    const sizeOptions = getProductSizeOptions(product)
    const selectedSize = normalizeSizeValue(sizeSelectionByProductId?.[product._id])
    if (sizeOptions.length > 0 && !selectedSize) {
      setError('Vui lòng chọn size trước khi thêm sản phẩm vào đơn.')
      return
    }

    const resolvedSize = sizeOptions.length > 0 ? selectedSize : 'FREE SIZE'
    const itemKey = `${product._id}::${resolvedSize}`
    setItems((prev) => {
      if (prev.find((i) => i.itemKey === itemKey)) return prev
      return [...prev, {
        itemKey,
        productId: product._id,
        name: typeof product.name === 'object' ? (product.name?.vi || product.name?.en || '') : (product.name || ''),
        image: product.images?.[0] || '',
        rentPrice,
        size: resolvedSize,
      }]
    })
    setError('')
    setSizeSelectionByProductId((prev) => ({ ...prev, [product._id]: '' }))
    setProductQuery('')
    setProductResults([])
  }

  const removeProduct = (itemKey) => setItems((prev) => prev.filter((i) => i.itemKey !== itemKey))

  useEffect(() => {
    if (items.length === 0) {
      setAdvisorItemKey('')
      setAdvisorResult(null)
      setAdvisorError('')
      return
    }

    const hasSelected = items.some((item) => item.itemKey === advisorItemKey)
    if (!hasSelected) {
      setAdvisorItemKey(items[0].itemKey)
      setAdvisorResult(null)
      setAdvisorError('')
    }
  }, [items, advisorItemKey])

  const handleRecommendSizeForStaff = useCallback(async () => {
    if (!advisorItemKey) {
      setAdvisorError('Vui lòng chọn sản phẩm để tư vấn size.')
      setAdvisorResult(null)
      return
    }
    const selectedItem = items.find((item) => item.itemKey === advisorItemKey)
    if (!selectedItem?.productId) {
      setAdvisorError('Sản phẩm tư vấn không hợp lệ.')
      setAdvisorResult(null)
      return
    }

    const heightCm = Number(advisorHeightCm)
    const weightKg = Number(advisorWeightKg)

    if (!Number.isFinite(heightCm) || heightCm <= 0 || !Number.isFinite(weightKg) || weightKg <= 0) {
      setAdvisorError('Vui lòng nhập chiều cao và cân nặng hợp lệ (> 0).')
      setAdvisorResult(null)
      return
    }

    try {
      setAdvisorLoading(true)
      setAdvisorError('')

      const response = await axiosClient.get(`/products/${selectedItem.productId}/size-guide/recommendation`, {
        params: {
          gender: advisorGender,
          heightCm,
          weightKg,
        },
      })

      const data = response?.data?.data || null
      setAdvisorResult({
        recommendedSize: data?.recommendedSize || null,
      })
    } catch (apiError) {
      setAdvisorResult(null)
      setAdvisorError(apiError?.response?.data?.message || 'Không thể tư vấn size lúc này.')
    } finally {
      setAdvisorLoading(false)
    }
  }, [advisorGender, advisorHeightCm, advisorItemKey, advisorWeightKg, items])

  // ---- Validate step 2 → go to step 3 ----
  const goToPayment = () => {
    if (items.length === 0) { setError('Chưa chọn sản phẩm nào'); return }
    if (!startDate || !endDate) { setError('Chưa chọn ngày và giờ thuê'); return }
    if (new Date(endDate) <= new Date(startDate)) { setError('Giờ kết thúc phải sau giờ bắt đầu'); return }
    setError('')
    setStep(3)
  }

  // ---- Submit (called from step 3) ----
  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      // Backend may ignore unknown fields safely; keep this optional to avoid breaking current flow.
      const orderItems = items.map((item) => ({
        productId: item.productId,
        size: item.size || 'FREE SIZE',
        finalPrice: item.rentPrice * rentalDays,
        baseRentPrice: item.rentPrice,
        rentStartDate: new Date(startDate).toISOString(),
        rentEndDate: new Date(endDate).toISOString(),
      }))

      // Bước 1: Tạo đơn
      const res = await createWalkInOrderApi({
        customerId: customer._id,
        rentStartDate: new Date(startDate).toISOString(),
        rentEndDate: new Date(endDate).toISOString(),
        items: orderItems,
        depositMethod: depositMethod === 'PayOS' ? 'Online' : 'Cash',
      })

      const orderId = res.data?._id || res.data?.order?._id || res.order?._id

      // Bước 2: Nếu chọn PayOS → tạo link và mở tab mới
      if (depositMethod === 'PayOS' && orderId) {
        const payRes = await createDepositPaymentLinkApi(orderId)
        const paymentUrl = payRes?.data?.paymentUrl || payRes?.paymentUrl
        if (paymentUrl) {
          window.open(paymentUrl, '_blank')
          setSuccess('Đã mở trang thanh toán QR. Vui lòng hoàn tất thanh toán cọc.')
        } else {
          setSuccess('Đơn đã tạo. Không lấy được link QR — kiểm tra lại hoặc thu tiền mặt.')
        }
      } else {
        setSuccess(res.message || 'Tạo đơn & thu cọc thành công!')
      }

      setCreatedOrder(res.data || res)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/80 pb-12">
      {/* Page header */}
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff/rent-orders')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">FITFLOW Staff</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Tạo đơn tại chỗ</h1>
            <p className="mt-1 text-sm text-slate-500">Khách đến trực tiếp — tạo đơn và thu cọc ngay tại quầy</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-5 flex items-center gap-2">
          {[
            { idx: 1, label: 'Khách hàng' },
            { idx: 2, label: 'Sản phẩm' },
            { idx: 3, label: 'Thu cọc' },
          ].map((s, i) => (
            <div key={s.idx} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px w-8 shrink-0 ${step >= s.idx ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                step === s.idx
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : step > s.idx
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s.idx
                  ? <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  : <span>{s.idx}</span>
                }
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Global Error/Success */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-200 shadow-sm">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">{success}</p>
          </div>
        )}

        {/* ===== STEP 1: Chọn khách hàng ===== */}
        {step === 1 && (
          <div className="p-6 space-y-6 border-b border-slate-100">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCustomerMode('search')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl border transition ${customerMode === 'search' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'}`}
              >
                Tìm khách cũ
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl border transition ${customerMode === 'new' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'}`}
              >
                Khách hàng mới
              </button>
            </div>

            {customerMode === 'search' ? (
              <div className="space-y-4">
                <div className="relative max-w-lg">
                  <input
                    type="text"
                    value={customerQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc số điện thoại..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                  {customerSearching && (
                    <svg className="absolute right-3 top-3 h-5 w-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  )}
                </div>
                {customerResults.length > 0 && (
                  <div className="mt-2 max-w-lg rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    {customerResults.map(c => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          setCustomer(c)
                          setCustomerQuery('')
                          setCustomerResults([])
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition hover:bg-emerald-50 ${customer?._id === c._id ? 'bg-emerald-50' : ''}`}
                      >
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        {c.phone && <p className="text-sm text-slate-500">{c.phone}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-lg">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Tên khách hàng (*)"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Số điện thoại"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={handleCreateGuest}
                  disabled={creatingGuest || !newName.trim()}
                  className="h-11 px-6 rounded-2xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {creatingGuest ? 'Đang tạo...' : 'Tạo nhanh'}
                </button>
              </div>
            )}

            {customer && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 max-w-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Khách đang chọn</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{customer.name}</p>
                    {customer.phone && <p className="text-sm text-slate-600">{customer.phone}</p>}
                  </div>
                  <button type="button" onClick={() => setCustomer(null)} className="text-sm font-semibold text-rose-600 hover:text-rose-700">
                    Bỏ chọn
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 2: Chọn ngày giờ & Sản phẩm ===== */}
        {step === 2 && (
          <div className="p-6 space-y-6 border-b border-slate-100">
            {/* Date time picker */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Thời gian thuê</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      if (new Date(e.target.value) > new Date(endDate)) {
                        setEndDate(e.target.value)
                      }
                    }}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Kết thúc</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    min={startDate || nowLocalIso()}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
              {rentalHours && (
                <p className="mt-2 text-xs text-slate-500">
                  Thời gian thuê: <strong className="text-slate-800">{rentalHours}</strong>
                  {' '}· tính <strong className="text-slate-800">{rentalDays} ngày</strong>
                </p>
              )}
            </div>

            {/* Product search */}
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">Sản phẩm</p>
              <div className="relative max-w-lg">
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                {productSearching && (
                  <svg className="absolute right-3 top-3 h-5 w-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                )}
              </div>

              {productResults.length > 0 && (
                <div className="mt-2 max-w-lg rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  {productResults.map((p) => {
                    const name = typeof p.name === 'object' ? (p.name?.vi || p.name?.en || '') : (p.name || '')
                    const price = Number(p.baseRentPrice || p.commonRentPrice || p.rentPrice || 0)
                    const sizeOptions = getProductSizeOptions(p)
                    const selectedSize = normalizeSizeValue(sizeSelectionByProductId?.[p._id])
                    const itemKey = `${p._id}::${sizeOptions.length > 0 ? selectedSize : 'FREE SIZE'}`
                    const added = items.some((i) => i.itemKey === itemKey)
                    const canAdd = Boolean(price) && (sizeOptions.length === 0 || Boolean(selectedSize)) && !added
                    return (
                      <div
                        key={p._id}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 last:border-0 transition ${
                          added ? 'bg-slate-50 opacity-70' : 'hover:bg-emerald-50'
                        }`}
                      >
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="h-9 w-9 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-slate-200 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                          <p className="text-xs text-emerald-600 font-medium">
                            {price ? `${price.toLocaleString('vi-VN')}đ/ngày` : 'Không có giá thuê'}
                          </p>
                          {sizeOptions.length > 0 ? (
                            <div className="mt-2 w-full max-w-[220px]">
                              <select
                                value={selectedSize}
                                onChange={(event) => setSizeSelectionByProductId((prev) => ({ ...prev, [p._id]: event.target.value }))}
                                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-emerald-400"
                              >
                                <option value="">Chọn size</option>
                                {sizeOptions.map((size) => (
                                  <option key={`${p._id}-${size}`} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <p className="mt-1 text-[11px] text-slate-400">Free size</p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <button
                            type="button"
                            disabled={!canAdd}
                            onClick={() => addProduct(p)}
                            className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {added ? 'Đã thêm' : 'Thêm'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Selected items */}
            {items.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Danh sách đồ thuê ({items.length} sản phẩm)
                </p>
                <div className="space-y-2 max-w-xl">
                  {items.map((item) => (
                    <div key={item.itemKey} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          Size {item.size} · {' '}
                          {item.rentPrice.toLocaleString('vi-VN')}đ/ngày × {rentalDays} ngày ={' '}
                          <strong className="text-slate-700">{(item.rentPrice * rentalDays).toLocaleString('vi-VN')}đ</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(item.itemKey)}
                        className="text-slate-300 hover:text-red-500 transition shrink-0"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Price summary */}
                <div className="max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tổng tiền thuê</span>
                    <span className="font-semibold text-slate-900">{formatMoney(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-emerald-200 pt-2.5">
                    <span className="text-emerald-700 font-semibold">Tiền cọc thu ngay (50%)</span>
                    <span className="font-bold text-emerald-700">{formatMoney(deposit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Còn lại khi lấy đồ</span>
                    <span className="font-semibold text-slate-700">{formatMoney(total - deposit)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Staff size advisor */}
            <div className="max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Tư vấn size nhanh tại quầy</p>
                <p className="mt-0.5 text-xs text-slate-500">Chọn sản phẩm, nhập chiều cao và cân nặng để gợi ý size ngay cho khách mua offline.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Sản phẩm tư vấn</span>
                  <select
                    value={advisorItemKey}
                    onChange={(event) => {
                      setAdvisorItemKey(event.target.value)
                      setAdvisorResult(null)
                      setAdvisorError('')
                    }}
                    disabled={items.length === 0}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
                  >
                    {items.length === 0 ? (
                      <option value="">Chưa có sản phẩm trong đơn</option>
                    ) : null}
                    {items.map((item) => (
                      <option key={item.itemKey} value={item.itemKey}>{item.name} - size {item.size}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Giới tính</span>
                  <select
                    value={advisorGender}
                    onChange={(event) => {
                      setAdvisorGender(event.target.value)
                      setAdvisorResult(null)
                      setAdvisorError('')
                    }}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Chiều cao (cm)</span>
                  <input
                    type="number"
                    min="0"
                    value={advisorHeightCm}
                    onChange={(event) => {
                      setAdvisorHeightCm(event.target.value)
                      setAdvisorResult(null)
                      setAdvisorError('')
                    }}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ví dụ: 165"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Cân nặng (kg)</span>
                  <input
                    type="number"
                    min="0"
                    value={advisorWeightKg}
                    onChange={(event) => {
                      setAdvisorWeightKg(event.target.value)
                      setAdvisorResult(null)
                      setAdvisorError('')
                    }}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ví dụ: 52"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleRecommendSizeForStaff}
                  disabled={advisorLoading || items.length === 0}
                  className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {advisorLoading ? 'Đang tính...' : 'Tính size'}
                </button>
              </div>

              {advisorError ? <p className="text-sm text-rose-600">{advisorError}</p> : null}
              {advisorResult?.recommendedSize ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                  Gợi ý size: {advisorResult.recommendedSize}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ===== STEP 3: Thu tiền cọc ===== */}
        {step === 3 && !createdOrder && (
          <div className="p-6 space-y-5">
            {/* Order summary recap */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Xác nhận đơn thuê</p>
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                <span className="font-semibold text-slate-800">{customer?.name}</span>
                {customer?.phone && <span className="text-slate-500">· {customer.phone}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                <span className="text-slate-700">
                  {new Date(startDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                  {' → '}
                  {new Date(endDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <span className="text-slate-400">({rentalHours || `${rentalDays} ngày`})</span>
              </div>
              <div className="space-y-1 border-t border-slate-200 pt-3">
                {items.map((item) => (
                  <div key={item.itemKey} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.image
                        ? <img src={item.image} alt="" className="h-6 w-6 rounded-lg object-cover shrink-0" />
                        : <div className="h-6 w-6 rounded-lg bg-slate-200 shrink-0" />
                      }
                      <span className="text-slate-700 truncate">{item.name} - size {item.size}</span>
                    </div>
                    <span className="shrink-0 font-medium text-slate-900 ml-2">{formatMoney(item.rentPrice * rentalDays)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                <span>Tổng tiền thuê</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>

            {/* Deposit collection card */}
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 mb-3">Thu tiền cọc từ khách</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-emerald-700">{formatMoney(deposit)}</p>
                  <p className="mt-1 text-xs text-emerald-600">50% tổng tiền thuê · Còn lại {formatMoney(total - deposit)} khi lấy đồ</p>
                </div>
                <span className="text-4xl select-none">💵</span>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Hình thức thu cọc</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'Cash', label: 'Tiền mặt', sub: 'Thu trực tiếp tại quầy', icon: '💵' },
                  { key: 'PayOS', label: 'Thanh toán QR', sub: 'QR / chuyển khoản', icon: '📱' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setDepositMethod(m.key)}
                    className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-all ${
                      depositMethod === m.key
                        ? 'border-emerald-300 bg-white ring-2 ring-emerald-300 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-sm font-semibold text-slate-800">{m.label}</span>
                    <span className="text-xs text-slate-500">{m.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== SUCCESS STATE ===== */}
        {createdOrder && (
          <div className="p-8 text-center space-y-5">
            <div className="flex justify-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${depositMethod === 'PayOS' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                {depositMethod === 'PayOS' ? (
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Đơn thuê đã tạo!</h3>
              {depositMethod === 'PayOS' ? (
                <p className="mt-1 text-sm text-blue-600 font-medium">Trang thanh toán QR đã mở — nhờ khách quét QR để hoàn tất đặt cọc.</p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Đơn thuê đã được ghi nhận. Tiền cọc đã thu.</p>
              )}
            </div>
            {/* Receipt summary */}
            <div className="mx-auto max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Khách hàng</span>
                <span className="font-semibold text-slate-800">{customer?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Bắt đầu</span>
                <span className="font-semibold text-slate-800">{new Date(startDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Kết thúc</span>
                <span className="font-semibold text-slate-800">{new Date(endDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tổng tiền thuê</span>
                <span className="font-semibold text-slate-800">{formatMoney(total)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-emerald-200 pt-2 font-bold text-emerald-700">
                <span>Đã thu cọc</span>
                <span>{formatMoney(deposit)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Còn lại khi lấy đồ</span>
                <span className="font-semibold">{formatMoney(total - deposit)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/staff/rent-orders')}
              className="w-full max-w-sm mx-auto block h-11 rounded-2xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Xem danh sách đơn →
            </button>
          </div>
        )}

        {/* Footer navigation */}
        {!createdOrder && (
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              if (step === 3) { setStep(2); setError('') }
              else if (step === 2) { setStep(1); setError('') }
              else navigate('/staff/rent-orders')
            }}
            disabled={loading}
            className="flex-1 h-11 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none sm:px-6"
          >
            {step > 1 ? '← Quay lại' : 'Hủy'}
          </button>

          {step === 1 && (
            <button
              type="button"
              onClick={() => {
                if (!customer) { setError('Vui lòng chọn khách hàng'); return }
                setError('')
                setStep(2)
              }}
              disabled={loading}
              className="flex-1 h-11 rounded-2xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              Tiếp theo →
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={goToPayment}
              disabled={loading || items.length === 0}
              className="flex-1 h-11 rounded-2xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              Xem lại & Thu cọc →
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-11 rounded-2xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Đang tạo đơn...
                </span>
              ) : `✓ Xác nhận đã thu ${formatMoney(deposit)}`}
            </button>
          )}
        </div>
        )}
      </div>
  )
}
