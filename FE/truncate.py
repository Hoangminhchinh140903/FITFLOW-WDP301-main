with open('c:/Users/DELL/Desktop/Main/Study/Summer2026/WDP301/FITFLOW-WDP301-main/FE/src/pages/staff/StaffSaleOrders.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = lines[:551] + ['          </div>\n', '        </div>\n', '      )}\n', '    </div>\n', '  </div>\n', '  )\n', '}\n']

with open('c:/Users/DELL/Desktop/Main/Study/Summer2026/WDP301/FITFLOW-WDP301-main/FE/src/pages/staff/StaffSaleOrders.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
