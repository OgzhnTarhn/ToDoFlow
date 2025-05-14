const express = require("express");
const fs      = require("fs");
const path    = require("path");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");

const app        = express();
const PORT       = 3000;
const DATA_FILE  = path.join(__dirname, "data.json");
const USERS_FILE = path.join(__dirname, "users.json");
const JWT_SECRET = "ÇOK_GİZLİ_SIFRE"; // Gerçekte .env’te tut

/// ——— Todo veri dosyasını oku/yaz ———
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
function readUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    } catch {
        return [];
    }
}
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
// ——— Auth Middleware ———
// Bu fonksiyon, her istekte Authorization header’ını kontrol eder.
// Geçerli bir JWT yoksa 401 döner; varsa req.userId’yi ayarlar.
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token eksik veya yanlış format" });
    }
    const token = auth.split(" ")[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;  // downstream route’larda kullanacağız
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token geçersiz veya süresi dolmuş" });
    }
}
// ——— Kullanıcı Kayıt (Register) ———
app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    // 1) Alan kontrolü
    if (!username || !password) {
        return res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli." });
    }
    // 2) Mevcut kullanıcıyı kontrol et
    const users = readUsers();
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ error: "Bu kullanıcı adı zaten alınmış." });
    }
    // 3) Şifreyi hash’le
    const passwordHash = await bcrypt.hash(password, 10);
    // 4) Yeni kullanıcıyı kaydet
    users.push({ id: Date.now(), username, passwordHash });
    writeUsers(users);
    res.status(201).json({ message: "Kayıt başarılı. Giriş yapabilirsin." });
});
// ——— Kullanıcı Giriş (Login) ———
app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    // 1) Kullanıcıyı bul
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ error: "Kullanıcı bulunamadı." });
    }
    // 2) Parolayı doğrula
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return res.status(403).json({ error: "Şifre yanlış." });
    }
    // 3) JWT oluştur
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
});

// Tüm todo'ları getir
app.get("/api/todos", authMiddleware, (req, res) => {
    const todos = readData().filter(t => t.userId === req.userId);
    res.json(todos);
});


// Yeni todo ekle (kategori de alır)
app.post("/api/todos", authMiddleware, (req, res) => {
    const todos = readData();
    const newTodo = {
        id: Date.now(),
        text     : req.body.text,
        category : req.body.category || "Genel",
        createdAt: new Date().toISOString(),
        completed: false,
        userId   : req.userId     // ← burası eklendi
    };
    todos.push(newTodo);
    writeData(todos);
    res.status(201).json(newTodo);
});

// Todo güncelle (text, category veya completed)
app.put("/api/todos/:id", authMiddleware, (req, res) => {
    let todos = readData();
    const idx = todos.findIndex(t =>
        t.id == req.params.id && t.userId === req.userId
    );
    if (idx === -1) return res.status(404).json({ error: "Todo bulunamadı veya yetkiniz yok." });
    todos[idx] = { ...todos[idx], ...req.body };
    writeData(todos);
    res.json(todos[idx]);
});

// Todo sil
app.delete("/api/todos/:id", authMiddleware, (req, res) => {
    let todos = readData();
    const filtered = todos.filter(t =>
        !(t.id == req.params.id && t.userId === req.userId)
    );
    writeData(filtered);
    res.json({ message: "Silindi" });
});

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor.`);
});
