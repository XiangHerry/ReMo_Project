const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5001; 
const dotenv = require('dotenv'); 
dotenv.config(); // load environment variable

// Use CORS middleware
const allowedOrigins = [
    'https://ephemeral-biscotti-5b60bd.netlify.app',
    'http://localhost:3000' 
  ]; 
  app.use(cors({
    origin: allowedOrigins
}));

// Use JSON middleware
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI; // Use environment variable
const client = new MongoClient(uri);
let databases = {};

// Initialize MongoDB connection
async function connectToDatabase() {
    try {
        await client.connect();
        databases.bookDatabase = client.db('bookDatabase');
        databases.creatorDatabase = client.db('creatorDatabase');
        databases.libraryDatabase = client.db('libraryDatabase');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit process if unable to connect to the database
    }
}

// Test API
app.get('/test', (req, res) => {
    res.send('Server and MongoDB are working fine');
});

// Get list of books
app.get('/books', async (req, res) => {
    try {
        const { title } = req.query;
        const collection = databases.bookDatabase.collection('books');

        // Search by title or return default records
        const query = title ? { title: { $regex: title, $options: "i" } } : {};
        const books = await collection.find(query).limit(title ? 0 : 10).toArray();

        console.log(`Fetched ${books.length} books from database`);

        res.json(books.map(book => ({
            _id: book._id.toString(), // add _id and convert to string
            title: book.title || "Unknown Title",
            isbn: book.isbn || [],
            authors: book.authors || [],
        })));
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).send(err.message);
    }
});

// Add a new book
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

// update a book
app.put('/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { title, isbn, authors } = req.body;

        // Validate if ID is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        // validate necessary fields
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

// delete books
app.delete('/books/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Validate if ID is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        // Execute delete operation.
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

// Get list of libraries
app.get('/libraries', async (req, res) => {
    try {
        const { name } = req.query;
        const collection = databases.libraryDatabase.collection('libraries');

        // Construct query logic
        const query = name ? { title: { $regex: name, $options: "i" } } : {};
        const libraries = await collection.find(query).limit(name ? 0 : 10).toArray();

        console.log(`Fetched ${libraries.length} libraries from database`);

        res.json(libraries.map(library => ({
            _id: library._id.toString(), // Add _id and convert to string
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

// Add a new library
app.post('/libraries', async (req, res) => {
    try {
        const { title, material_type, inventory } = req.body;

        // Validate required fields
        if (!title || !material_type || !inventory) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure `inventory` contains necessary fields
        const processedInventory = {
            total_copies: inventory.total_copies || 0,
            copies_available: inventory.copies_available || 0,
            copies_checked_out: inventory.copies_checked_out || 0,
            copies_lost: inventory.copies_lost || 0,
        };

        // insert data into database
        const collection = databases.libraryDatabase.collection('libraries');
        const result = await collection.insertOne({
            title,
            material_type,
            inventory: processedInventory,
        });

        console.log(`Inserted library with _id: ${result.insertedId}`);

        // return inserted data
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

// Update a library
app.put('/libraries/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { title, material_type, inventory } = req.body;

        // Validate if ID is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid library ID" });
        }

        // Validate required fields
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

// Delete a library
app.delete('/libraries/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Validate if ID is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid library ID" });
        }

        // Perform delete operation
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

// Start the server
app.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server running on http://localhost:${port}`);
});
