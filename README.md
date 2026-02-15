# 📧 PulseMail

A modern, full-stack email campaign management platform that enables users to send personalized bulk emails efficiently. Built with Next.js, Django REST Framework, and Supabase.

![PulseMail Banner](https://img.shields.io/badge/PulseMail-Email_Campaign_Platform-blue?style=for-the-badge)

## ✨ Features

- **📊 CSV Import**: Upload CSV files with recipient data and map columns to email fields
- **📝 Campaign Management**: Create and manage email campaigns with custom subjects and messages
- **🔐 Secure Authentication**: User authentication powered by Supabase Auth
- **🔗 Connection Management**: Store and manage multiple email server connections securely
- **📈 Campaign History**: Track all sent campaigns with detailed logs
- **🎨 Modern UI**: Beautiful, responsive interface with glassmorphism design
- **⚡ Real-time Updates**: Live synchronization across browser tabs using Supabase Realtime
- **📧 Personalized Emails**: Support for per-recipient customization using CSV columns
- **🚀 Production Ready**: Deployed on Vercel (frontend) and Railway (backend)

## 🏗️ Architecture

PulseMail follows a modern client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │   Campaign   │  │   History    │      │
│  │     Page     │  │   Dashboard  │  │     Page     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                           │                                  │
│                    Supabase Client                           │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Supabase   │    │    Django    │    │   Railway    │
│   Database   │    │  REST API    │    │  Deployment  │
│              │    │              │    │              │
│ - Auth       │    │ - Email      │    │ - Backend    │
│ - Connections│    │   Sending    │    │   Hosting    │
│ - Campaigns  │    │ - Validation │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Authentication**: Supabase Auth
- **Database Client**: Supabase JS Client
- **Notifications**: React Hot Toast
- **Icons**: React Icons
- **Deployment**: Vercel

### Backend

- **Framework**: Django 5.2.5
- **API**: Django REST Framework 3.14
- **Language**: Python 3.x
- **Email**: Django SMTP Backend (Gmail)
- **CORS**: django-cors-headers
- **Server**: Gunicorn
- **Deployment**: Railway

### Database

- **Platform**: Supabase (PostgreSQL)
- **Features**: Real-time subscriptions, Row Level Security (RLS)

## 📁 Project Structure

```
pulsemail/
├── client/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   │   ├── auth/         # Authentication page
│   │   │   ├── home/         # Campaign dashboard
│   │   │   ├── history/      # Campaign history
│   │   │   └── page.tsx      # Landing page
│   │   ├── components/       # Reusable React components
│   │   │   ├── AboutUs.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── ContactUs.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── Nav.tsx
│   │   ├── lib/              # API client functions
│   │   │   ├── COnnection.ts # Connection CRUD operations
│   │   │   └── History.ts    # Campaign logging
│   │   └── utils/            # Utilities
│   │       └── supabase.ts   # Supabase client setup
│   ├── package.json
│   └── tsconfig.json
│
└── server/                    # Django backend application
    └── mailserver/
        ├── mailapi/          # Django app for email API
        │   ├── views.py      # Email sending endpoint
        │   ├── urls.py       # API routes
        │   └── serializers.py
        ├── mailserver/       # Django project settings
        │   ├── settings.py   # Main settings
        │   └── urls.py       # URL configuration
        ├── manage.py
        └── requirements.txt  # Python dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Supabase Account** (free tier works)
- **Gmail Account** with App Password enabled

### Environment Variables

#### Client (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Server (`.env`)

```env
DJANGO_SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com
CSRF_TRUSTED_ORIGINS=http://localhost:3000
```

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Hridayansh018/pulsemail.git
cd pulsemail
```

#### 2. Setup Frontend

```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

#### 3. Setup Backend

```bash
cd server/mailserver
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

#### 4. Setup Supabase Database

Create the following tables in your Supabase project:

**`connections` table:**

```sql
CREATE TABLE connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_name TEXT NOT NULL,
  host_email TEXT NOT NULL,
  host_app_password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own connections
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON connections
  FOR DELETE USING (auth.uid() = user_id);
```

**`campaigns` table:**

```sql
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE SET NULL,
  connection_name TEXT,
  campaign_name TEXT NOT NULL,
  email_list TEXT[] NOT NULL,
  subject TEXT[],
  message TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 📖 Usage

### 1. **Sign Up / Sign In**

- Navigate to the authentication page
- Create an account or sign in with existing credentials

### 2. **Create a Connection**

- Go to the campaign dashboard
- Click "Create connection" in the connection dropdown
- Enter connection details:
  - **Connection Name**: A friendly name (e.g., "Primary Gmail")
  - **Host Email**: Your Gmail address
  - **App Password**: Gmail app-specific password ([How to generate](https://support.google.com/accounts/answer/185833))

### 3. **Upload CSV**

- Prepare a CSV file with headers (e.g., `email`, `name`, `subject`, `message`)
- Click "Choose CSV" and upload your file
- Select the column containing email addresses
- Optionally select columns for subject and message (for personalization)

### 4. **Create Campaign**

- Enter a campaign name
- Select a connection
- Write subject and message (or use CSV columns)
- Click "Create Campaign" to send emails

### 5. **View History**

- Navigate to the History page
- View all past campaigns with details
- Real-time updates across all browser tabs

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Secure Authentication**: Supabase Auth with JWT tokens
- **CSRF Protection**: Django CSRF middleware enabled
- **HTTPS Enforcement**: Production deployments use HTTPS
- **Environment Variables**: Sensitive data stored in environment variables
- **Password Encryption**: App passwords stored securely in Supabase

## 🌐 API Endpoints

### Backend (Django)

#### `POST /api/send-mails/`

Send bulk emails to a list of recipients.

**Request Body:**

```json
{
  "email_list": ["user1@example.com", "user2@example.com"],
  "HOST_EMAIL": "sender@gmail.com",
  "HOST_APP_PASSWORD": "app_password",
  "subject": ["Subject 1", "Subject 2"],
  "message": ["Message 1", "Message 2"]
}
```

**Response:**

```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "total": 2,
  "results": [
    { "to": "user1@example.com", "status": "sent" },
    { "to": "user2@example.com", "status": "sent" }
  ]
}
```

## 🚢 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

**Live URL**: `https://pulsemail.vercel.app`

### Backend (Railway)

1. Create a new project in Railway
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

**Live URL**: `https://pulsemail-production.up.railway.app`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Hridayansh Awasthi**

- GitHub: [@Hridayansh018](https://github.com/Hridayansh018)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Django](https://www.djangoproject.com/) - Python web framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Frontend hosting
- [Railway](https://railway.app/) - Backend hosting
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📞 Support

For support, email [your-email@example.com] or open an issue in the GitHub repository.

---

<div align="center">
  <p>Made with ❤️ by Hridayansh Awasthi</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
