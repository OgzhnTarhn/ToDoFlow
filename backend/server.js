const express = require("express");
const cors = require('cors');
const fs      = require("fs").promises;
const path    = require("path");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

const app        = express();
const PORT       = process.env.PORT || 3001;
const DATA_FILE  = path.join(__dirname, "data.json");
const USERS_FILE = path.join(__dirname, "users.json");
const JWT_SECRET = "ÇOK_GİZLİ_SIFRE"; // Prod ortamında ENV değişkeni ile saklayın

app.use(cors());
app.use(express.json());

// JSON parsing ve static dosyalar
app.use("/static", express.static(path.join(__dirname, "../public")));

// ——— Todo veri dosyasını oku/yaz ———
function readData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {
        return [];
    }
}
function writeData(todos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// ——— Kullanıcı veri dosyasını oku/yaz ———
async function loadUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}
async function saveUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// ——— Auth Middleware ———
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token eksik veya yanlış format' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Geçersiz token' });
        }
        req.user = user;
        next();
    });
};

// ——— Kullanıcı Kayıt (Register) ———
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Gerekli alanların kontrolü
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
        }

        const users = await loadUsers();

        // Email kontrolü
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword
        };

        users.push(newUser);
        await saveUsers(users);

        res.status(201).json({ message: 'Kayıt başarılı' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// ——— Kullanıcı Giriş (Login) ———
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Gerekli alanların kontrolü
        if (!email || !password) {
            return res.status(400).json({ error: 'Email ve şifre zorunludur' });
        }

        const users = await loadUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Şifre kontrolü
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Geçersiz şifre' });
        }

        // Token oluştur
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Kullanıcı bilgilerini getir
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const users = await loadUsers();
        const user = users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Hassas bilgileri çıkar
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// ——— Todo CRUD (Auth korumalı) ———

// GET tüm todolar kullanıcıya özel
app.get("/api/todos", authenticateToken, (req, res) => {
    const todos = readData().filter(t => t.userId === req.user.id);
    res.json(todos);
});

// POST yeni todo oluştur, userId ata
app.post("/api/todos", authenticateToken, (req, res) => {
    const todos = readData();
    const newTodo = {
        id       : Date.now(),
        text     : req.body.text,
        category : req.body.category  || "Genel",
        createdAt: new Date().toISOString(),
        completed: false,
        userId   : req.user.id
    };
    todos.push(newTodo);
    writeData(todos);
    res.status(201).json(newTodo);
});

// PUT ile todo güncelle (ID ve userId kontrolü)
app.put("/api/todos/:id", authenticateToken, (req, res) => {
    let todos = readData();
    const idx = todos.findIndex(t =>
        t.id == req.params.id && t.userId === req.user.id
    );
    if (idx === -1) {
        return res.status(404).json({ error: "Todo bulunamadı veya yetkiniz yok." });
    }
    todos[idx] = { ...todos[idx], ...req.body };
    writeData(todos);
    res.json(todos[idx]);
});

// DELETE ile todo sil (ID ve userId kontrolü)
app.delete("/api/todos/:id", authenticateToken, (req, res) => {
    const todos = readData();
    const filtered = todos.filter(t =>
        !(t.id == req.params.id && t.userId === req.user.id)
    );
    writeData(filtered);
    res.json({ message: "Silindi" });
});

// ——— Frontend Sayfa Yönlendirmeleri ———

// Giriş sayfası
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Root -> login yönlendir
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Korunan uygulama sayfası
app.get("/app", authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/app.html"));
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor.`);
});
