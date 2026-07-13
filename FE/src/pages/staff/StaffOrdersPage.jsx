import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import StaffRentOrders from './StaffRentOrders'
import StaffSaleOrders from './StaffSaleOrders'

export default function StaffOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'sale' ? 'sale' : 'rent'
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    const tab = searchParams.get('tab') === 'sale' ? 'sale' : 'rent'
    setActiveTab(tab)
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 89px)', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Header Tabs */}
      <div style={{ padding: '0 2rem', paddingTop: '1.5rem', borderBottom: '1px solid #e2e8f0', flexShrink: 0, backgroundColor: 'white' }}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleTabChange('rent')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'rent'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Đơn thuê
          </button>
          <button
            onClick={() => handleTabChange('sale')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'sale'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Đơn mua
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {activeTab === 'rent' ? <StaffRentOrders /> : <StaffSaleOrders />}
      </div>
    </div>
  )
}
