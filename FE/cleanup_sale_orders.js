const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'staff', 'StaffSaleOrders.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update component name
content = content.replace(/StaffRentOrders/g, 'StaffSaleOrders');
// 2. Update Qu?n lý don thuê -> Qu?n lý don mua
content = content.replace(/Qu?n lý don thuê/g, 'Qu?n lý don mua');
// 3. Update API imports
content = content.replace(/import \{ getAllRentOrdersApi,.*\} from '\.\.\/\.\.\/services\/rent-order\.service'/s, 
  import { getOwnerOrdersApi as getAllSaleOrdersApi, updateOwnerOrderStatusApi as updateSaleOrderStatusApi, getOwnerOrderByIdApi } from '../../services/owner.service');
// 4. Update order type / API calls
content = content.replace(/getAllRentOrdersApi/g, 'getAllSaleOrdersApi');
content = content.replace(/getRentOrderByIdApi/g, 'getOwnerOrderByIdApi');

// Remove rent-specific states (collateral, return, swap, etc.)
content = content.replace(/\/\/ Collateral modal state[\s\S]*?\/\/ Fetch full order detail/s, '// Fetch full order detail');

// Status labels
content = content.replace(/const statusLabels = \{[\s\S]*?\}/, const statusLabels = {
  PendingConfirmation: 'Ch? xác nh?n',
  Confirmed: 'Ðã xác nh?n',
  Processing: 'Ðang x? lý',
  Shipping: 'Ðang giao',
  Delivered: 'Ðã giao',
  Completed: 'Hoàn t?t',
  Cancelled: 'Ðã h?y',
  Refunded: 'Ðã hoàn ti?n',
  Returned: 'Ðã tr? hàng'
});

content = content.replace(/const statusColors = \{[\s\S]*?\}/, const statusColors = {
  PendingConfirmation: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-indigo-100 text-indigo-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipping: 'bg-violet-100 text-violet-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Completed: 'bg-green-200 text-green-800',
  Cancelled: 'bg-slate-200 text-slate-700',
  Refunded: 'bg-fuchsia-100 text-fuchsia-800',
  Returned: 'bg-rose-100 text-rose-800'
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(" Cleanup basic completed\);
