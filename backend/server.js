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

// Tüm todo'ları getir
app.get("/api/todos", (req, res) => {
    const todos = readData();
    res.json(todos);
});

// Yeni todo ekle (kategori de alır)
app.post("/api/todos", (req, res) => {
    const { text, category } = req.body;
    const todos = readData();
    const newTodo = {
        id: Date.now(),
        text,
        category: category || "Genel",
        createdAt: new Date().toISOString(),
        completed: false
    };
    todos.push(newTodo);
    writeData(todos);
    res.status(201).json(newTodo);
});

// Todo güncelle (text, category veya completed)
app.put("/api/todos/:id", (req, res) => {
    let todos = readData();
    const index = todos.findIndex(todo => todo.id == req.params.id);
    if (index !== -1) {
        todos[index] = { ...todos[index], ...req.body };
        writeData(todos);
        res.status(200).json(todos[index]);
    } else {
        res.status(404).json({ error: "Todo bulunamadı." });
    }
});

// Todo sil
app.delete("/api/todos/:id", (req, res) => {
    let todos = readData();
    todos = todos.filter(todo => todo.id != req.params.id);
    writeData(todos);
    res.status(200).json({ message: "Silindi" });
});

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor.`);
});
