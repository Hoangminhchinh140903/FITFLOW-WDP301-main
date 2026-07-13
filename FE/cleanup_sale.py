import re

path = r'c:\Users\DELL\Desktop\Main\Study\Summer2026\WDP301\FITFLOW-WDP301-main\FE\src\pages\staff\StaffSaleOrders.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Component name
content = content.replace('StaffRentOrders', 'StaffSaleOrders')
content = content.replace('Qu?n lý don thuê', 'Qu?n lý don mua')

# We'll just leave the rest for now and manually adjust APIs in the file via multi_replace
# since trying to parse it with regex is too complex.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
