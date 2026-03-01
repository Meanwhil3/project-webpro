const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// --- ฟังก์ชันสำหรับสร้างข้อมูลจำลอง (Seed Data) ---
async function seedDatabase(db) {
    // 1. ตรวจสอบจำนวนสินค้าก่อน ถ้ามีแล้วจะไม่เพิ่มซ้ำ
    const count = await db.get('SELECT COUNT(*) as total FROM Products');
    
    if (count.total === 0) {
        console.log("🌱 Creating Mock Data...");

        // 2. Mock Categories
        const categories = ['CPU', 'GPU', 'Storage', 'RAM', 'Mainboard', 'PSU', 'Case', 'Monitor', 'Mouse', 'Keyboard', 'Networking'];
        for (const cat of categories) {
            await db.run('INSERT OR IGNORE INTO Categories (category_name) VALUES (?)', [cat]);
        }

        // 3. Mock Products (ตัวอย่าง 20 รายการแรก - คุณสามารถก๊อปปี้เพิ่มให้ครบ 50 ได้ง่ายๆ)
        const products = [
            // [model_name, brand, cat_id, description, price, stock, min_threshold]
            ['Intel Core i9-14900K', 'Intel', 1, '24 Cores up to 6.0GHz', 22500, 10, 3],
            ['AMD Ryzen 9 7950X', 'AMD', 1, '16 Cores 32 Threads', 19900, 5, 2],
            ['Intel Core i5-13400F', 'Intel', 1, '10 Cores (6P+4E)', 7200, 25, 5],
            ['AMD Ryzen 5 7600', 'AMD', 1, '6 Cores 12 Threads', 7900, 15, 5],
            ['NVIDIA RTX 4090 FE', 'NVIDIA', 2, '24GB GDDR6X', 65900, 2, 1],
            ['ASUS RTX 4080 Super', 'ASUS', 2, '16GB GDDR6X', 42500, 4, 2],
            ['MSI RTX 4070 Ti', 'MSI', 2, '12GB GDDR6X', 31000, 8, 3],
            ['Gigabyte RX 7800 XT', 'Gigabyte', 2, '16GB GDDR6', 19500, 12, 4],
            ['Samsung 990 PRO 2TB', 'Samsung', 3, 'NVMe Gen4 7450MB/s', 6800, 40, 10],
            ['WD Black SN850X 1TB', 'WD', 3, 'NVMe Gen4 7300MB/s', 3900, 30, 8],
            ['Seagate IronWolf 4TB', 'Seagate', 3, 'NAS HDD 5400RPM', 4200, 15, 5],
            ['Corsair Vengeance 32GB', 'Corsair', 4, 'DDR5 6000MHz CL36', 4500, 20, 5],
            ['G.Skill Trident Z5 32GB', 'G.Skill', 4, 'DDR5 6000MHz', 4800, 15, 5],
            ['ROG Maximus Z790', 'ASUS', 5, 'Intel Z790 ATX', 24500, 3, 1],
            ['B650 TOMAHAWK', 'MSI', 5, 'AMD B650 ATX', 7900, 10, 3],
            ['RM850e 850W', 'Corsair', 6, '80 Plus Gold Modular', 4900, 15, 5],
            ['H9 Flow Black', 'NZXT', 7, 'Dual-Chamber Mid-Tower', 5900, 6, 2],
            ['Odyssey G7 27"', 'Samsung', 8, '2K 240Hz Curved', 18900, 8, 2],
            ['Logitech G Pro X 2', 'Logitech', 9, 'Wireless Gaming Mouse', 5400, 20, 5],
            ['Keychron K2 V2', 'Keychron', 10, 'Mechanical Keyboard', 3900, 14, 4]
        ];

        for (const p of products) {
            await db.run(`INSERT INTO Products (model_name, brand, category_id, description, price, stock_quantity, min_threshold) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)`, p);
        }
        
        // 4. Mock Users (ถ้ายังไม่มี)
        await db.run(`INSERT OR IGNORE INTO Users (fullname, email, password, role) 
                      VALUES ('Manager Admin', 'admin@warehouse.com', '1234', 'Warehouse Manager')`);

        console.log("✅ Mock Data created successfully!");
    }
}

// --- เชื่อมต่อ Database และสร้าง Tables ---
(async () => {
    db = await open({
        filename: path.join(__dirname, 'warehouse.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('Warehouse Staff', 'Warehouse Manager')) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Products (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_name TEXT NOT NULL,
            brand TEXT NOT NULL,
            category_id INTEGER,
            description TEXT,
            price REAL DEFAULT 0,
            stock_quantity INTEGER DEFAULT 0,
            min_threshold INTEGER DEFAULT 5,
            FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        );

        CREATE TABLE IF NOT EXISTS Inventory_Transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            user_id INTEGER,
            type TEXT CHECK(type IN ('Stock-In', 'Stock-Out')) NOT NULL,
            quantity INTEGER NOT NULL,
            transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES Products(product_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        );
    `);

    // **เรียกใช้ฟังก์ชัน Seed Data ตรงนี้**
    await seedDatabase(db);

    console.log("🚀 Database & Seed Ready!");
})();

// --- API ROUTES ---

// backend/server.js - แก้ไขเฉพาะส่วน Route /api/products

app.get('/api/products', async (req, res) => {
    const { search, category, brand } = req.query;
    let query = `
        SELECT p.*, c.category_name 
        FROM Products p 
        LEFT JOIN Categories c ON p.category_id = c.category_id
        WHERE 1=1
    `;
    const params = [];

    // ระบบค้นหาจากชื่อรุ่น หรือ แบรนด์
    if (search) {
        query += ` AND (p.model_name LIKE ? OR p.brand LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    // ตัวกรองตามหมวดหมู่
    if (category && category !== 'all') {
        query += ` AND c.category_name = ?`;
        params.push(category);
    }

    const products = await db.all(query, params);
    res.json(products);
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await db.get(
            'SELECT user_id, fullname, email, role FROM Users WHERE user_id = ?', 
            [req.params.id]
        );
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
        }
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});
// เพิ่ม Route สำหรับดึงรายการ Categories ทั้งหมดมาทำ Dropdown
app.get('/api/categories', async (req, res) => {
    const categories = await db.all('SELECT * FROM Categories');
    res.json(categories);
});

app.post('/api/transactions', async (req, res) => {
    const { product_id, user_id, type, quantity } = req.body;
    try {
        await db.run('BEGIN TRANSACTION');

        const existingProduct = await db.get('SELECT product_id, stock_quantity FROM Products WHERE product_id = ?', [product_id]);
        if (!existingProduct) {
            throw new Error('ไม่มีสินค้าในคลัง');
        }

        await db.run(
            `INSERT INTO Inventory_Transactions (product_id, user_id, type, quantity) VALUES (?, ?, ?, ?)`,
            [product_id, user_id, type, quantity]
        );

        if (type === 'Stock-In') {
            await db.run('UPDATE Products SET stock_quantity = stock_quantity + ? WHERE product_id = ?', [quantity, product_id]);
        } else if (type === 'Stock-Out') {
            const product = await db.get('SELECT stock_quantity FROM Products WHERE product_id = ?', [product_id]);
            if (product.stock_quantity < quantity) throw new Error("สินค้าในสต็อกไม่เพียงพอ");
            await db.run('UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [quantity, product_id]);
        }

        await db.run('COMMIT');
        res.status(201).json({ message: "บันทึกรายการสำเร็จ" });
    } catch (error) {
        await db.run('ROLLBACK');
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { fullname, email, password, role } = req.body;
    try {
        const result = await db.run(
            `INSERT INTO Users (fullname, email, password, role) VALUES (?, ?, ?, ?)`,
            [fullname, email, password, role]
        );
        res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", userId: result.lastID });
    } catch (error) {
        res.status(400).json({ error: error.message.includes("UNIQUE") ? "อีเมลนี้ถูกใช้งานแล้ว" : "เกิดข้อผิดพลาด" });
    }
});

app.get('/api/reports/inventory-summary', async (req, res) => {
    const summary = await db.all(`
        SELECT p.model_name, p.brand, p.stock_quantity, (p.price * p.stock_quantity) as total_value
        FROM Products p
    `);
    res.json(summary);
});

app.get('/api/notifications/low-stock', async (req, res) => {
    const items = await db.all(`
        SELECT product_id, model_name, stock_quantity, min_threshold
        FROM Products
        WHERE stock_quantity <= min_threshold
    `);
    res.json(items);
});

app.get('/api/notifications/summary', async (req, res) => {
    const totalProducts = await db.get('SELECT COUNT(*) as cnt FROM Products');
    const totalValue = await db.get('SELECT SUM(price * stock_quantity) as val FROM Products');
    const lowCount = await db.get('SELECT COUNT(*) as cnt FROM Products WHERE stock_quantity <= min_threshold');
    const today = new Date().toISOString().slice(0, 10);
    const transactionsToday = await db.get(
        `SELECT COUNT(*) as cnt FROM Inventory_Transactions WHERE DATE(transaction_date) = ?`,
        [today]
    );

    res.json({
        totalProducts: totalProducts.cnt,
        totalValue: totalValue.val || 0,
        lowCount: lowCount.cnt,
        transactionsToday: transactionsToday.cnt
    });
});

app.get('/api/transactions/recent', async (req, res) => {
    const rows = await db.all(`
        SELECT it.transaction_id, it.type, it.quantity, it.transaction_date, p.model_name
        FROM Inventory_Transactions it
        JOIN Products p ON p.product_id = it.product_id
        ORDER BY it.transaction_date DESC
        LIMIT 10
    `);
    res.json(rows);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));