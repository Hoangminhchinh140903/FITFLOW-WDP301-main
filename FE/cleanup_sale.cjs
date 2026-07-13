const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'staff', 'StaffSaleOrders.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Name
content = content.replace(/StaffRentOrders/g, 'StaffSaleOrders');

// Title
content = content.replace(/Qu?n lý don thuê/g, 'Qu?n lý don mua');
content = content.replace(/don thuê/g, 'don mua');

// API Imports
content = content.replace(/import \{ getAllRentOrdersApi, [^\}]+\} from '\.\.\/\.\.\/services\/rent-order\.service'/s, 
  import { getOwnerOrdersApi, updateOwnerOrderStatusApi, getOwnerOrderByIdApi } from '../../services/owner.service');

// Constants
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

// API calls
content = content.replace(/getAllRentOrdersApi/g, 'getOwnerOrdersApi');
content = content.replace(/getRentOrderByIdApi/g, 'getOwnerOrderByIdApi');

// getOwnerOrdersApi takes { type: 'sale' }
content = content.replace(/const res = await getOwnerOrdersApi\(\{/g, const res = await getOwnerOrdersApi({ type: 'sale',);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');
