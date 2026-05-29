# 🤖 AITA - AI Teaching Assistant

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

**AITA - AI Teaching Assistant** là hệ thống trợ giảng thông minh sử dụng AI, được xây dựng nhằm hỗ trợ giảng viên và sinh viên trong quá trình dạy, học, giao bài, nộp bài, chấm điểm và phản hồi học tập.

---

## 🎯 Tổng quan dự án

AITA là viết tắt của **AI-powered Teaching Assistant System for FPT Lecturers**.

Hệ thống được phát triển dưới dạng website với 3 nhóm người dùng chính:

- **Admin**: Quản lý người dùng, phân quyền và theo dõi hệ thống.
- **Lecturer**: Quản lý lớp học, môn học, bài học, bài tập, bài nộp và phản hồi sinh viên.
- **Student**: Xem bài học, nhận bài tập, nộp bài, xem điểm và feedback.

Mục tiêu của dự án là giảm bớt các công việc thủ công cho giảng viên như tạo bài tập, tạo quiz, theo dõi bài nộp và viết phản hồi, đồng thời giúp sinh viên nhận được hỗ trợ học tập nhanh hơn.

---

## ✨ Tính năng chính

### 👤 Admin

- Đăng nhập hệ thống.
- Quản lý tài khoản người dùng.
- Tạo tài khoản giảng viên và sinh viên.
- Phân quyền người dùng theo vai trò.
- Quản lý môn học.
- Theo dõi số lượng người dùng, lớp học, môn học và bài tập.
- Cấu hình trạng thái các chức năng AI.
- Quản lý thiết lập hệ thống cơ bản.

### 👨‍🏫 Lecturer

- Quản lý lớp học.
- Quản lý môn học.
- Quản lý CLO của môn học.
- Tạo và quản lý bài học.
- Tạo và giao bài tập cho sinh viên.
- Xem danh sách bài nộp.
- Chấm điểm bài nộp.
- Nhập feedback cho sinh viên.
- Sử dụng AI để tạo bài tập, tạo quiz và gợi ý feedback.
- Xem báo cáo tiến độ học tập cơ bản.

### 🎓 Student

- Xem các lớp học đang tham gia.
- Xem môn học và bài học.
- Xem bài tập được giao.
- Nộp bài tập.
- Theo dõi trạng thái bài nộp.
- Xem điểm và phản hồi từ giảng viên.
- Xem tiến độ học tập cá nhân.

---

## 🧠 Chức năng AI

### Đã triển khai hoặc nằm trong phạm vi MVP

- **AI Exercise Generator**: Tạo bài tập theo chủ đề, CLO, mức độ khó và số lượng câu hỏi.
- **AI Quiz Generator**: Tạo câu hỏi trắc nghiệm, đáp án đúng và giải thích ngắn.
- **AI Feedback Generator**: Gợi ý feedback cho bài nộp của sinh viên.
- **Lesson Outline Suggestion**: Gợi ý outline bài học ở mức cơ bản.

### Định hướng phát triển

- AI tạo slide hoàn chỉnh.
- AI chấm code nâng cao.
- AI phân tích điểm yếu học tập chuyên sâu.
- AI đề xuất lộ trình học cá nhân hóa.
- Tích hợp LMS.
- Tạo PowerPoint tự động.
- RAG dựa trên tài liệu học tập của FPT.
- Fine-tuning AI bằng dữ liệu học tập nội bộ.

---

## ⚙️ Công nghệ sử dụng

### Frontend

- **ReactJS**
- **Vite**
- **TailwindCSS**
- **React Router DOM**
- **Axios**
- **Context API**

### Backend

- **Node.js**
- **Express.js**
- **Prisma ORM**
- **PostgreSQL**
- **JWT Authentication**
- **Middleware phân quyền**
- **AI Service Layer**

### Database & Deployment

- **Database**: Neon PostgreSQL
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Render
- **Version Control**: GitHub

---

## 📁 Cấu trúc dự án

```bash
aita-project/
│
├── backend/                         # Node.js + Express API
│   ├── prisma/                      # Prisma schema, migrations, seed
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/                  # Cấu hình database, env, AI
│   │   ├── controllers/             # Xử lý request/response
│   │   ├── services/                # Business logic
│   │   ├── routes/                  # API routes
│   │   ├── middlewares/             # Auth, role, validation, error handler
│   │   ├── validations/             # Schema kiểm tra dữ liệu đầu vào
│   │   ├── utils/                   # Helper functions
│   │   ├── app.js                   # Express app
│   │   └── server.js                # Server entry point
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/                        # React + Vite application
│   ├── public/
│   │   └── logo/
│   │
│   ├── src/
│   │   ├── assets/                  # Hình ảnh, icon, tài nguyên giao diện
│   │   ├── components/              # Component dùng chung
│   │   ├── contexts/                # AuthContext, ThemeContext
│   │   ├── features/
│   │   │   ├── admin/               # Giao diện và logic dành cho Admin
│   │   │   ├── lecturer/            # Giao diện và logic dành cho Lecturer
│   │   │   └── student/             # Giao diện và logic dành cho Student
│   │   ├── hooks/                   # Custom hooks
│   │   ├── pages/                   # Public pages
│   │   ├── routes/                  # Protected routes, role routes
│   │   ├── services/                # API services
│   │   ├── utils/                   # Helper functions frontend
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── docs/                            # Tài liệu dự án
│   ├── requirements/
│   ├── design/
│   ├── diagrams/
│   ├── testing/
│   └── deployment/
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🏗️ Kiến trúc hệ thống

```bash
Frontend - ReactJS
        ↓
Backend - Node.js Express
        ↓
Database - PostgreSQL
        ↓
AI Service Layer
        ↓
External AI API
```

### Mô tả ngắn

- **Frontend** hiển thị giao diện cho Admin, Lecturer và Student.
- **Backend** xử lý xác thực, phân quyền, nghiệp vụ và API.
- **Database** lưu dữ liệu người dùng, lớp học, môn học, bài học, bài tập, bài nộp, điểm và feedback.
- **AI Service Layer** kết nối backend với AI API bên ngoài để tạo bài tập, quiz và feedback.

---

## 🚀 Hướng dẫn cài đặt

### 🧰 Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn
- PostgreSQL database
- Prisma CLI
- Git

---

### 1. Clone repository

```bash
git clone <repository-url>
cd aita-project
```

---

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend` dựa trên `.env.example`.

```env
DATABASE_URL="your_neon_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5000
AI_API_KEY="your_ai_api_key"
```

Chạy Prisma:

```bash
npx prisma generate
npx prisma migrate dev
node prisma/seed.js
```

Khởi chạy backend:

```bash
npm run dev
```

Backend mặc định chạy tại:

```bash
http://localhost:5000
```

---

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env` trong thư mục `frontend` dựa trên `.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
```

Khởi chạy frontend:

```bash
npm run dev
```

Frontend mặc định chạy tại:

```bash
http://localhost:5173
```

---

## 🔐 Phân quyền người dùng

Hệ thống sử dụng JWT Authentication và Role-based Authorization.

| Vai trò | Quyền chính |
|---|---|
| Admin | Quản lý người dùng, phân quyền, môn học, thiết lập hệ thống |
| Lecturer | Quản lý lớp học, bài học, bài tập, bài nộp, điểm và feedback |
| Student | Xem bài học, xem bài tập, nộp bài, xem điểm và feedback |

---

## 📌 Các trang chính

### Public Pages

- Landing Page
- Login Page
- Forgot Password Page
- Unauthorized Page
- Not Found Page

### Admin Dashboard

- Admin Overview
- User Management
- Lecturer Management
- Student Management
- Subject Management
- AI Settings
- System Settings

### Lecturer Dashboard

- Lecturer Overview
- Class Management
- Subject Management
- CLO Management
- Lesson Management
- Assignment Management
- Submission Management
- Grading Page
- AI Exercise Generator
- AI Quiz Generator
- AI Feedback Generator
- Lecturer Report

### Student Dashboard

- Student Overview
- My Classes
- My Subjects
- Lessons
- Assignments
- Submit Assignment
- Feedback
- Progress

---

## 🔄 Luồng hoạt động chính

### Lecturer tạo bài tập

1. Lecturer đăng nhập.
2. Lecturer chọn lớp học hoặc môn học.
3. Lecturer tạo bài tập mới.
4. Lecturer nhập yêu cầu, hạn nộp, thang điểm và CLO liên quan.
5. Hệ thống lưu bài tập.
6. Student có thể xem và nộp bài.

### Student nộp bài

1. Student đăng nhập.
2. Student mở trang Assignments.
3. Student chọn bài tập cần làm.
4. Student nhập câu trả lời hoặc upload file.
5. Student gửi bài nộp.
6. Hệ thống lưu bài nộp.
7. Lecturer có thể xem và chấm bài.

### Lecturer dùng AI gợi ý feedback

1. Lecturer mở bài nộp của sinh viên.
2. Lecturer chọn Generate Feedback.
3. Backend gửi dữ liệu đến AI Service.
4. AI trả về feedback gợi ý.
5. Lecturer kiểm tra và chỉnh sửa nếu cần.
6. Feedback chính thức được lưu và hiển thị cho Student.

---

## 🔧 API chính

### Authentication

```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Users

```http
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Classes

```http
GET    /api/classes
POST   /api/classes
PUT    /api/classes/:id
DELETE /api/classes/:id
```

### Subjects

```http
GET    /api/subjects
POST   /api/subjects
PUT    /api/subjects/:id
DELETE /api/subjects/:id
```

### Lessons

```http
GET    /api/lessons
POST   /api/lessons
PUT    /api/lessons/:id
DELETE /api/lessons/:id
```

### Assignments

```http
GET    /api/assignments
POST   /api/assignments
PUT    /api/assignments/:id
DELETE /api/assignments/:id
```

### Submissions

```http
GET  /api/submissions
POST /api/submissions
PUT  /api/submissions/:id/grade
```

### AI

```http
POST /api/ai/generate-exercises
POST /api/ai/generate-quiz
POST /api/ai/generate-feedback
POST /api/ai/generate-lesson-outline
```

---

## 📦 Deployment

### Frontend - Vercel

```bash
cd frontend
npm run build
```

Cấu hình biến môi trường trên Vercel:

```env
VITE_API_URL=https://your-render-backend-url/api
```

---

### Backend - Render

```bash
cd backend
npm install
npm run start
```

Cấu hình biến môi trường trên Render:

```env
DATABASE_URL="your_neon_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5000
AI_API_KEY="your_ai_api_key"
```

Build command:

```bash
npm install && npx prisma generate
```

Start command:

```bash
npm start
```

---

### Database - Neon PostgreSQL

Database production sử dụng **Neon PostgreSQL**.

Các bước chính:

1. Tạo project trên Neon.
2. Tạo PostgreSQL database.
3. Copy connection string.
4. Gán connection string vào `DATABASE_URL`.
5. Chạy Prisma migration trên môi trường backend.

```bash
npx prisma migrate deploy
```

---

## 📚 Tài liệu dự án

Thư mục `docs/` dùng để lưu tài liệu phân tích, thiết kế, kiểm thử và triển khai.

```bash
docs/
├── requirements/
│   ├── user-requirement.md
│   └── software-requirement-specification.md
│
├── design/
│   ├── architecture-design.md
│   ├── database-design.md
│   ├── api-specification.md
│   └── ui-wireframe.md
│
├── diagrams/
│   ├── use-case-diagram.puml
│   ├── activity-diagram.puml
│   ├── sequence-login.puml
│   ├── sequence-submit-assignment.puml
│   └── erd.puml
│
├── testing/
│   ├── test-cases.md
│   └── bug-report.md
│
└── deployment/
    ├── installation-guide.md
    └── deployment-guide.md
```

---

## ✅ Kiểm thử

### Checklist kiểm thử thủ công

- [ ] Đăng nhập đúng vai trò.
- [ ] Chặn truy cập khi người dùng không có quyền.
- [ ] Admin tạo, sửa, xóa người dùng.
- [ ] Lecturer tạo lớp học.
- [ ] Lecturer tạo môn học.
- [ ] Lecturer tạo bài học.
- [ ] Lecturer tạo bài tập.
- [ ] Student xem bài tập.
- [ ] Student nộp bài.
- [ ] Lecturer chấm bài.
- [ ] Lecturer tạo quiz bằng AI.
- [ ] Lecturer tạo feedback bằng AI.
- [ ] Dashboard hiển thị số liệu cơ bản.
- [ ] Giao diện responsive trên laptop và tablet.

---

## 📈 Trạng thái phát triển

### Đã có hoặc đang triển khai

- Cấu trúc backend.
- Cấu hình Prisma.
- Cấu hình PostgreSQL.
- Authentication và phân quyền.
- Admin Dashboard.
- Landing Page.
- Role-based routing.
- Các module controller, service và route chính.
- Module AI cơ bản.
- Cấu trúc frontend theo role.

### Dự kiến phát triển tiếp

- Hoàn thiện Lecturer Dashboard.
- Hoàn thiện Student Dashboard.
- Module thông báo.
- Upload file bài học và bài nộp.
- AI tạo slide.
- AI chấm code nâng cao.
- Báo cáo học tập nâng cao.
- Tích hợp LMS.
- Xuất PowerPoint tự động.

---

## 🔒 Bảo mật

- JWT Authentication.
- Role-based Authorization.
- Password hashing.
- Middleware kiểm tra quyền truy cập.
- Validation dữ liệu đầu vào.
- CORS configuration.
- Environment variables cho thông tin nhạy cảm.
- Không commit file `.env` lên GitHub.

---

## 🧩 Định hướng mở rộng

- Tích hợp RAG để AI hiểu tài liệu học tập nội bộ.
- Cho phép upload syllabus, rubric, CLO và tài liệu mẫu.
- Tạo bài học và bài tập từ tài liệu giảng viên.
- Phân tích bài nộp dựa trên rubric.
- Cá nhân hóa lộ trình học tập cho sinh viên.
- Tích hợp LMS.
- Tạo slide PowerPoint tự động.
- Cải thiện độ chính xác AI bằng dữ liệu học tập đã kiểm duyệt.

---

## 📄 License

**Proprietary Software - All rights reserved.**

Phần mềm này được phát triển cho mục đích học tập, nghiên cứu và trình bày dự án.  
Nghiêm cấm sao chép, phân phối, chỉnh sửa hoặc sử dụng lại mã nguồn khi chưa có sự cho phép bằng văn bản của nhà phát triển.

---

## 👨‍💻 Nhà phát triển

**Nguyễn Thành Tâm**  
**Email**: nguyenthanhtam10062004@gmail.com  
**Dự án**: AITA - AI Teaching Assistant  

---

## 📌 Ghi chú

README này được viết cho môi trường development và demo project.  
Các thông tin cấu hình production có thể thay đổi tùy theo môi trường triển khai thực tế.
