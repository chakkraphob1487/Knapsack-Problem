# Knapsack Problem Solver

โปรแกรมแก้ปัญหา Knapsack Problem ด้วย 2 อัลกอริทึม:
- **Fractional Knapsack** (Greedy Algorithm) - 3 เกณฑ์การเลือก
- **0/1 Knapsack** (Dynamic Programming) - แสดงตาราง DP

## 🚀 วิธีใช้งาน

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. เปิด server
npm start

# 3. เปิดเบราว์เซอร์ไปที่
http://localhost:3000
```

## 📦 Features

- ✅ Fractional Knapsack พร้อม 3 เกณฑ์ Greedy (Max Ratio, Max Value, Min Weight)
- ✅ 0/1 Knapsack พร้อมตาราง DP และ traceback path
- ✅ UI สวยงาม dark theme พร้อม glassmorphism
- ✅ แชร์ลิงก์พร้อมข้อมูล (Query Parameters)

## 📁 โครงสร้างโปรเจกต์

```
Knapsack Problem/
├── server.js           # Express server + API endpoints
├── package.json        # Dependencies
└── public/
    ├── index.html      # หน้าหลัก
    ├── guide.html      # หน้าคู่มือ
    ├── style.css       # Styling
    └── app.js          # Frontend logic
```

## 🛠️ Technologies

- **Backend:** Node.js + Express
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Styling:** Dark theme, Glassmorphism, CSS animations
