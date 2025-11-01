import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const STATS_FILE = path.join(__dirname, 'stats.json');

function getStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading stats:', error);
  }
  return { pageViews: 0, imagesGenerated: 0, lastUpdated: new Date().toISOString() };
}

function saveStats(stats) {
  try {
    stats.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

app.get('/api/stats/view', (req, res) => {
  const stats = getStats();
  stats.pageViews++;
  saveStats(stats);
  res.json({ success: true });
});

app.post('/api/stats/image', (req, res) => {
  const stats = getStats();
  stats.imagesGenerated++;
  saveStats(stats);
  res.json({ success: true });
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const hashedPassword = hashPassword(password);
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminPasswordHash) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  if (hashedPassword === adminPasswordHash) {
    req.session.isAdmin = true;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});

app.get('/api/auth/check', (req, res) => {
  res.json({ isAuthenticated: req.session && req.session.isAdmin === true });
});

app.get('/api/admin/stats', isAuthenticated, (req, res) => {
  const stats = getStats();
  res.json(stats);
});

app.get('/api/admin/settings', isAuthenticated, (req, res) => {
  res.json({
    geminiApiKey: process.env.GEMINI_API_KEY ? '***SET***' : 'Not set'
  });
});

app.post('/api/admin/settings/gemini', isAuthenticated, (req, res) => {
  res.json({ 
    error: 'API key management must be done through Replit Secrets for security',
    message: 'Please set GEMINI_API_KEY in the Secrets tab'
  });
});

app.get('/api/gemini-key', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    res.json({ apiKey });
  } else {
    res.status(404).json({ error: 'Gemini API key not configured' });
  }
});

app.get('/auth', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'brand-primary': '#4f46e5',
            'brand-secondary': '#7c3aed',
            'base-100': '#0f172a',
            'base-200': '#1e293b',
            'base-300': '#334155',
            'content-100': '#e2e8f0',
            'content-200': '#94a3b8',
          }
        }
      }
    }
  </script>
  <style>
    body {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      min-height: 100vh;
    }
  </style>
</head>
<body class="bg-base-100 text-content-100 flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="bg-base-200/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-base-300">
      <h1 class="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Admin Login</h1>
      
      <form id="loginForm" class="space-y-4">
        <div>
          <label for="password" class="block text-sm font-medium text-content-200 mb-2">Mật khẩu</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            required
            class="w-full px-4 py-3 bg-base-100 border-2 border-base-300 rounded-lg focus:outline-none focus:border-brand-primary transition-all text-content-100"
            placeholder="Nhập mật khẩu"
          >
        </div>
        
        <div id="error" class="hidden text-red-400 text-sm"></div>
        
        <button 
          type="submit" 
          class="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          Đăng nhập
        </button>
      </form>
      
      <div class="mt-4 text-center">
        <a href="/" class="text-sm text-content-200 hover:text-brand-primary transition-colors">← Quay lại trang chủ</a>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('error');
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
          window.location.href = '/admin';
        } else {
          errorDiv.textContent = data.error || 'Đăng nhập thất bại';
          errorDiv.classList.remove('hidden');
        }
      } catch (error) {
        errorDiv.textContent = 'Lỗi kết nối';
        errorDiv.classList.remove('hidden');
      }
    });
  </script>
</body>
</html>
  `);
});

app.get('/admin', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'brand-primary': '#4f46e5',
            'brand-secondary': '#7c3aed',
            'base-100': '#0f172a',
            'base-200': '#1e293b',
            'base-300': '#334155',
            'content-100': '#e2e8f0',
            'content-200': '#94a3b8',
          }
        }
      }
    }
  </script>
  <style>
    body {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      min-height: 100vh;
    }
  </style>
</head>
<body class="bg-base-100 text-content-100 p-4 sm:p-6 lg:p-8">
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Admin Dashboard</h1>
      <div class="flex gap-4">
        <a href="/" class="px-4 py-2 bg-base-300 hover:bg-base-200 rounded-lg transition-colors">Trang chủ</a>
        <button onclick="logout()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Đăng xuất</button>
      </div>
    </div>

    <div id="content" class="space-y-6">
      <div class="text-center text-content-200">Đang tải...</div>
    </div>
  </div>

  <script>
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check', { credentials: 'include' });
        const data = await response.json();
        
        if (!data.isAuthenticated) {
          window.location.href = '/auth';
          return false;
        }
        return true;
      } catch (error) {
        window.location.href = '/auth';
        return false;
      }
    }

    async function loadStats() {
      try {
        const response = await fetch('/api/admin/stats', { credentials: 'include' });
        if (!response.ok) throw new Error('Unauthorized');
        
        const stats = await response.json();
        
        document.getElementById('content').innerHTML = \`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-base-200/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-base-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-content-200 text-sm mb-1">Lượt truy cập</p>
                  <p class="text-4xl font-bold text-brand-primary">\${stats.pageViews.toLocaleString()}</p>
                </div>
                <div class="text-brand-primary text-5xl">👥</div>
              </div>
            </div>

            <div class="bg-base-200/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-base-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-content-200 text-sm mb-1">Ảnh đã tạo</p>
                  <p class="text-4xl font-bold text-brand-secondary">\${stats.imagesGenerated.toLocaleString()}</p>
                </div>
                <div class="text-brand-secondary text-5xl">🖼️</div>
              </div>
            </div>
          </div>

          <div class="bg-base-200/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-base-300">
            <h2 class="text-2xl font-bold mb-4">Cài đặt</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-content-200 mb-2">Gemini API Key</label>
                <p class="text-sm text-content-200 bg-base-300 p-3 rounded-lg">
                  Để cài đặt hoặc thay đổi API key, vui lòng sử dụng tab <strong>Secrets</strong> của Replit và thêm biến <code class="bg-base-100 px-2 py-1 rounded">GEMINI_API_KEY</code>
                </p>
                <p class="text-sm mt-2 text-content-200">Trạng thái: <span id="geminiStatus" class="font-semibold">Đang kiểm tra...</span></p>
              </div>
              
              <div class="pt-4 border-t border-base-300">
                <p class="text-sm text-content-200 mb-2">Cập nhật lần cuối: \${new Date(stats.lastUpdated).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        \`;

        fetch('/api/admin/settings', { credentials: 'include' })
          .then(r => r.json())
          .then(settings => {
            const statusEl = document.getElementById('geminiStatus');
            if (settings.geminiApiKey === '***SET***') {
              statusEl.textContent = '✅ Đã cài đặt';
              statusEl.className = 'font-semibold text-green-400';
            } else {
              statusEl.textContent = '❌ Chưa cài đặt';
              statusEl.className = 'font-semibold text-red-400';
            }
          });
          
      } catch (error) {
        window.location.href = '/auth';
      }
    }

    async function logout() {
      try {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include' 
        });
        window.location.href = '/auth';
      } catch (error) {
        window.location.href = '/auth';
      }
    }

    async function init() {
      const isAuth = await checkAuth();
      if (isAuth) {
        await loadStats();
        setInterval(loadStats, 5000);
      }
    }

    init();
  </script>
</body>
</html>
  `);
});

app.listen(PORT, 'localhost', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
