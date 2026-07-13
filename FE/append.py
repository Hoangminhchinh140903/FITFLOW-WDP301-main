with open('c:/Users/DELL/Desktop/Main/Study/Summer2026/WDP301/FITFLOW-WDP301-main/FE/src/services/owner.service.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('axiosClient.get(/owner/orders/)', 'axiosClient.get(/owner/orders/)')

with open('c:/Users/DELL/Desktop/Main/Study/Summer2026/WDP301/FITFLOW-WDP301-main/FE/src/services/owner.service.js', 'w', encoding='utf-8') as f:
    f.write(content)
