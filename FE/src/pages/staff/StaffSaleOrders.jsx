import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOwnerOrdersApi, updateOwnerOrderStatusApi, getOwnerOrderByIdApi } from '../../services/owner.service'


const statusLabels = {
  PendingConfirmation: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Shipping: 'Đang giao',
  Completed: 'Hoàn tất',
  Cancelled: 'Đã hủy',
  ReturnRequested: 'Yêu cầu trả hàng',
  Refunded: 'Đã hoàn tiền',
  Returned: 'Đã trả hàng'
}

const statusColors = {
  PendingConfirmation: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-indigo-100 text-indigo-800',
  Shipping: 'bg-violet-100 text-violet-800',
  Completed: 'bg-green-200 text-green-800',
  Cancelled: 'bg-slate-200 text-slate-700',
  ReturnRequested: 'bg-orange-100 text-orange-800',
  Refunded: 'bg-fuchsia-100 text-fuchsia-800',
  Returned: 'bg-rose-100 text-rose-800'
}

const getCustomerText = (order) => {
  if (!order) return 'N/A'
  const customer = order.customerId
  if (customer && typeof customer === 'object') {
    const name = customer.name || ''
    const phone = customer.phone || ''
    const email = customer.email || ''
    if (name && phone) return `${name} - ${phone}`
    if (name && email) return `${name} - ${email}`
    if (name) return name
    if (phone) return phone
    if (email) return email
  }
  
  // Fallback for guest orders
  const guestName = order.guestName || order.shippingName || ''
  const guestPhone = order.shippingPhone || ''
  const guestEmail = order.guestEmail || ''
  if (guestName && guestPhone) return `${guestName} - ${guestPhone} (Khách lẻ)`
  if (guestName && guestEmail) return `${guestName} - ${guestEmail} (Khách lẻ)`
  if (guestName) return `${guestName} (Khách lẻ)`
  
  if (customer && typeof customer === 'string') return customer
  if (customer && customer._id) return customer._id
  
  return 'N/A'
}

const getCustomerDetail = (customer) => {
  if (!customer) return null
  if (typeof customer !== 'object') {
    return { id: String(customer || '') }
  }
  return {
    id: customer._id || '',
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    gender: customer.gender || '',
    dateOfBirth: customer.dateOfBirth || null,
  }
}



const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : 'N/A')
const displayOrderCode = (order) => order?.orderCode || `#${String(order?._id || '').slice(-8).toUpperCase()}`

const getProductName = (product) => {
  if (!product) return 'Sản phẩm'
  if (typeof product.name === 'string') return product.name || 'Sản phẩm'
  if (product.name && typeof product.name === 'object') {
    return product.name.vi || product.name.en || 'Sản phẩm'
  }
  return 'Sản phẩm'
}



export default function StaffSaleOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  const customerDetail = useMemo(() => getCustomerDetail(selectedOrder?.customerId), [selectedOrder])

  const showSuccess = (msg) => {
    setActionSuccess(msg)
    setError('')
    setTimeout(() => setActionSuccess(''), 4000)
  }



  // Fetch full order detail (có collaterals, deposits, payments) khi click vào đơn
  const selectOrder = useCallback(async (order) => {
    setSelectedOrder(order)
    setDetailLoading(true)
    try {
      const res = await getOwnerOrderByIdApi(order._id)
      if (res?.data) setSelectedOrder(res.data)
    } catch {
      // giữ nguyên data cũ nếu fetch thất bại
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getOwnerOrdersApi({
        type: 'sale',
        ...(filterStatus ? { status: filterStatus } : {}),
        page,
        limit,
      })
      setOrders(response.data || [])
      setPagination(response.pagination || { page, limit, total: (response.data || []).length, pages: 1 })
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err?.response?.data?.message || 'Không thể tải danh sách đơn thuê')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, page, limit])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    setPage(1)
  }, [filterStatus, limit])

  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null, reasonType: 'not_as_expected', reasonText: '' })

  const handleUpdateStatus = async (orderId, newStatus, payload = {}) => {
    try {
      setActionLoading(true)
      const res = await updateOwnerOrderStatusApi(orderId, newStatus, payload)
      if (res?.data) {
        showSuccess('Cập nhật trạng thái thành công')
        fetchOrders()
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.data)
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi cập nhật')
    } finally {
      setActionLoading(false)
    }
  }

  const confirmCancelOrder = () => {
    const finalReason = cancelModal.reasonText;
      
    if (!finalReason.trim()) {
      setError('Vui lòng nhập lý do hủy đơn')
      return
    }
    handleUpdateStatus(cancelModal.orderId, 'Cancelled', { reason: finalReason }).then(() => {
      setCancelModal({ show: false, orderId: null, reasonType: 'other', reasonText: '' })
    })
  }

  const statusSummary = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})
  }, [orders])

  return (
    <div className="min-h-screen bg-slate-100/80">
      {/* Notification Toast */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-6 py-4 shadow-xl flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
          <span className="font-medium">{actionSuccess}</span>
        </div>
      )}
      
      {/* Cancel Order Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Hủy đơn hàng</h3>
            <p className="mt-2 mb-4 text-sm text-slate-500">Vui lòng nhập lý do hủy đơn hàng này.</p>
            <div className="space-y-3">
              <textarea
                className="w-full rounded-xl border border-slate-200 p-3 text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                rows="4"
                placeholder="Nhập lý do chi tiết..."
                value={cancelModal.reasonText}
                onChange={(e) => setCancelModal({ ...cancelModal, reasonText: e.target.value })}
              ></textarea>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelModal({ show: false, orderId: null, reasonType: 'not_as_expected', reasonText: '' })}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                disabled={actionLoading}
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
      {/* Bộ lọc */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">FITFLOW Staff</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">Quản lý đơn mua</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Theo dõi trạng thái đơn mua, cập nhật hành trình đơn hàng nhanh.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[300px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tổng đơn</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{pagination.total || 0}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Hoàn tất</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{statusSummary.Completed || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
              <div className="min-w-0 flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">Lọc theo trạng thái</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">Tất cả</option>
                  <option value="PendingConfirmation">Chờ xác nhận</option>
                  <option value="Confirmed">Đã xác nhận</option>
                  <option value="Shipping">Đang giao</option>
                  <option value="Completed">Hoàn tất</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="min-w-[180px]">
                <label className="mb-2 block text-sm font-medium text-slate-700">Số dòng / trang</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value || '10', 10))}
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <button
                onClick={fetchOrders}
                className="h-12 rounded-2xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Làm mới
              </button>
              <button
                onClick={() => navigate('/staff/walk-in')}
                className="h-12 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tạo đơn tại chỗ
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        {/* Danh sách đơn */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Danh sách đơn</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Đơn mua hàng</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                {pagination.total || 0} đơn
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center px-6 py-10">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-[420px] items-center justify-center px-6 py-10 text-center text-sm text-slate-500">Không có đơn mua nào</div>
          ) : (
            <div className="max-h-[calc(100vh-240px)] space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {orders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => selectOrder(order)}
                  className={`w-full rounded-[24px] border p-5 text-left transition ${selectedOrder?._id === order._id ? 'border-indigo-200 bg-indigo-50/80 shadow-[0_16px_36px_rgba(79,70,229,0.14)]' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-md'}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-950">
                        {displayOrderCode(order)}
                      </p>
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Khách hàng: {getCustomerText(order)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Tạo lúc: {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[order.status] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:text-right col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tổng tiền</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{formatMoney(order.totalAmount || 0)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chi tiết đơn */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          {detailLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          )}
          {!detailLoading && selectedOrder && (
            <div>
              <div className="rounded-[24px] bg-[linear-gradient(135deg,#eef2ff,#ffffff)] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Chi tiết đơn</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{displayOrderCode(selectedOrder)}</h3>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[selectedOrder.status] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>

              {selectedOrder.cancelReason && (
                <div className="mt-4 rounded-2xl bg-red-50 p-4 border border-red-100">
                  <p className="text-sm font-semibold text-red-800">Lý do hủy / trả hàng:</p>
                  <p className="mt-1 text-sm text-red-600">{selectedOrder.cancelReason}</p>
                </div>
              )}

              <div className="mt-5 space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Khách hàng</p>
                    <button
                      type="button"
                      onClick={() => setShowCustomerModal(true)}
                      className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                  <p className="mt-1 font-medium text-slate-900">{getCustomerText(selectedOrder)}</p>
                </div>

                {/* Sản phẩm trong đơn */}
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Sản phẩm mua</p>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                        {selectedOrder.items.length} món
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {selectedOrder.items.map((item, idx) => {
                        const product = item?.productInstanceId?.productId || item?.productId || {}
                        const productName = getProductName(product)
                        const categoryName = product?.category?.name?.vi || product?.category?.name?.en || ''
                        const isRacket = categoryName.toLowerCase().includes('vợt') || categoryName.toLowerCase().includes('racket')

                        return (
                          <div key={item._id || idx} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-semibold text-slate-900">{productName}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                {item.size && !isRacket && <span>Size: {item.size}</span>}
                                <span>Số lượng: {item.quantity || 1}</span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-indigo-600">{formatMoney(item.price || 0)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
                  {selectedOrder.status === 'PendingConfirmation' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'Confirmed')}
                      disabled={actionLoading}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Xác nhận đơn
                    </button>
                  )}
                  {selectedOrder.status === 'Confirmed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'Shipping')}
                        disabled={actionLoading}
                        className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
                      >
                        Đang giao
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'Shipping' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'Completed')}
                      disabled={actionLoading}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Giao hàng thành công
                    </button>
                  )}
                  {['PendingConfirmation', 'Confirmed'].includes(selectedOrder.status) && (
                    <button
                      onClick={() => setCancelModal({ show: true, orderId: selectedOrder._id, reasonType: 'not_as_expected', reasonText: '' })}
                      disabled={actionLoading}
                      className="rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                    >
                      Hủy đơn
                    </button>
                  )}
                  {selectedOrder.status === 'ReturnRequested' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'Returned')}
                      disabled={actionLoading}
                      className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
                    >
                      Xác nhận trả hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {!detailLoading && !selectedOrder && (
            <div className="text-center text-gray-500 py-8">
              Chọn một đơn để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-sm px-4 pb-4 sm:items-center sm:pb-0">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#eff6ff,#ffffff)] px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Khách hàng</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">Thông tin chi tiết</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-3 px-6 py-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Họ và tên</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{customerDetail?.name || 'Chưa cập nhật'}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Số điện thoại</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{customerDetail?.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Email</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{customerDetail?.email || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Địa chỉ</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{customerDetail?.address || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="h-11 w-full rounded-2xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  )
}
