const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5001; // 使用环境变量中的端口，Render 会自动分配端口
const dotenv = require('dotenv'); // 引入 dotenv
dotenv.config(); // 加载环境变量

// 使用 CORS 中间件
const allowedOrigins = [
    'https://ephemeral-biscotti-5b60bd.netlify.app',
    'http://localhost:3000' // 添加本地开发地址
  ]; 
  app.use(cors({
    origin: function(origin, callback){
        // 允许无来源（如 Postman）
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

// 使用 JSON 中间件
app.use(express.json());

// MongoDB 连接
const uri = process.env.MONGODB_URI; // 使用环境变量
const client = new MongoClient(uri);
let databases = {};

// 初始化 MongoDB 连接
async function connectToDatabase() {
    try {
        await client.connect();
        databases.bookDatabase = client.db('bookDatabase');
        databases.creatorDatabase = client.db('creatorDatabase');
        databases.libraryDatabase = client.db('libraryDatabase');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // 如果无法连接数据库，退出进程
    }
}

// 测试 API
app.get('/test', (req, res) => {
    res.send('Server and MongoDB are working fine');
});

// 获取书籍列表
app.get('/books', async (req, res) => {
    try {
        const { title } = req.query;
        const collection = databases.bookDatabase.collection('books');

        // 按标题搜索或返回默认记录
        const query = title ? { title: { $regex: title, $options: "i" } } : {};
        const books = await collection.find(query).limit(title ? 0 : 10).toArray();

        console.log(`Fetched ${books.length} books from database`);

        res.json(books.map(book => ({
            _id: book._id.toString(), // 添加 _id 并转换为字符串
            title: book.title || "Unknown Title",
            isbn: book.isbn || [],
            authors: book.authors || [],
        })));
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).send(err.message);
    }
});

// 添加新书
app.post('/books', async (req, res) => {
    try {
        const { title, isbn, authors } = req.body;
        if (!title || !isbn || !authors) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const collection = databases.bookDatabase.collection('books');
        const result = await collection.insertOne({ title, isbn, authors });
        console.log(`Inserted book with _id: ${result.insertedId}`);
        res.status(201).json({
            _id: result.insertedId, 
            title,
            isbn,
            authors
        });
    } catch (err) {
        console.error("Error adding book:", err);
        res.status(500).send(err.message);
    }
});

// 更新书籍
app.put('/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { title, isbn, authors } = req.body;

        // 验证 ID 是否为有效的 ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        // 校验必需字段
        if (!title || !isbn || !authors) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const collection = databases.bookDatabase.collection('books');

        const updateResult = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, isbn, authors } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        console.log(`Updated book with _id: ${id}`);

        res.status(200).json({ message: "Book updated successfully" });
    } catch (err) {
        console.error("Error updating book:", err);
        res.status(500).send(err.message);
    }
});

// 删除书籍
app.delete('/books/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // 验证 ID 是否为有效的 ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        // 执行删除操作
        const result = await databases.bookDatabase.collection('books').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            console.log(`Deleted book with _id: ${id}`);
            res.status(200).json({ message: "Book deleted successfully" });
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).send(err.message);
    }
});

// 获取图书馆列表
app.get('/libraries', async (req, res) => {
    try {
        const { name } = req.query;
        const collection = databases.libraryDatabase.collection('libraries');

        // 构造查询逻辑
        const query = name ? { title: { $regex: name, $options: "i" } } : {};
        const libraries = await collection.find(query).limit(name ? 0 : 10).toArray();

        console.log(`Fetched ${libraries.length} libraries from database`);

        res.json(libraries.map(library => ({
            _id: library._id.toString(), // 添加 _id 并转换为字符串
            title: library.title || "No Title Available",
            material_type: library.material_type || "Unknown",
            inventory: library.inventory
                ? {
                    total_copies: library.inventory.total_copies || 0,
                    copies_available: library.inventory.copies_available || 0,
                    copies_checked_out: library.inventory.copies_checked_out || 0,
                    copies_lost: library.inventory.copies_lost || 0,
                }
                : null,
        })));
    } catch (err) {
        console.error("Error fetching libraries:", err);
        res.status(500).send(err.message);
    }
});

// 添加新图书馆
app.post('/libraries', async (req, res) => {
    try {
        const { title, material_type, inventory } = req.body;

        // 校验必需字段
        if (!title || !material_type || !inventory) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 确保 `inventory` 包含必要字段
        const processedInventory = {
            total_copies: inventory.total_copies || 0,
            copies_available: inventory.copies_available || 0,
            copies_checked_out: inventory.copies_checked_out || 0,
            copies_lost: inventory.copies_lost || 0,
        };

        // 插入数据到数据库
        const collection = databases.libraryDatabase.collection('libraries');
        const result = await collection.insertOne({
            title,
            material_type,
            inventory: processedInventory,
        });

        console.log(`Inserted library with _id: ${result.insertedId}`);

        // 返回插入的数据
        res.status(201).json({
            _id: result.insertedId,
            title,
            material_type,
            inventory: processedInventory,
        });
    } catch (err) {
        console.error("Error adding library:", err);
        res.status(500).send(err.message);
    }
});

// 更新图书馆
app.put('/libraries/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { title, material_type, inventory } = req.body;

        // 验证 ID 是否为有效的 ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid library ID" });
        }

        // 校验必需字段
        if (!title || !material_type || !inventory) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const collection = databases.libraryDatabase.collection('libraries');

        const updateResult = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, material_type, inventory } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: "Library not found" });
        }

        console.log(`Updated library with _id: ${id}`);

        res.status(200).json({ message: "Library updated successfully" });
    } catch (err) {
        console.error("Error updating library:", err);
        res.status(500).send(err.message);
    }
});

// 删除图书馆
app.delete('/libraries/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // 验证 ID 是否为有效的 ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid library ID" });
        }

        // 执行删除操作
        const result = await databases.libraryDatabase.collection('libraries').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            console.log(`Deleted library with _id: ${id}`);
            res.status(200).json({ message: "Library deleted successfully" });
        } else {
            res.status(404).json({ message: "Library not found" });
        }
    } catch (err) {
        console.error("Error deleting library:", err);
        res.status(500).send(err.message);
    }
});

// 启动服务器
app.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server running on http://localhost:${port}`);
});
