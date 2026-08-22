

const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = 5000;
require('dotenv').config();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'], // Next.js Client URL
  credentials: true
}));
app.use(express.json());

// Root Router
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const logger = (req, res, next) => {
  console.log("logger middleware logged", req.params);
  next();
};



 const verifyToken = (req, res, next) => {
  console.log("headers", req.headers);
  
  next();
};


  





const uri = process.env.MONGO_DB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect(() => {
 console.log('connecting to MOngo db')

}).catch(console.dir)
  
// async function run() {
//   try {
//     await client.connect();
    console.log("Successfully connected to MongoDB!");

    const db = client.db("books_db");
    const bookCollection = db.collection("add-book");
    const subscriptionCollection = db.collection("subscriptions");
    const userCollection = db.collection("user");
    const browseEbooksCollection = db.collection("courses");
    const sessionCollection = db.collection("session");

    const bookmarksCollection = db.collection("bookmarks");
    // ==========================================
    // 1. GET ALL BOOKS / FILTER BY QUERY
    // URL: http://localhost:5000/api/books
    // // ==========================================
    app.get("/api/books", logger, verifyToken, async (req, res) => {
      try {
        const { companyId, status } = req.query;
        const query = {};

        if (companyId) query.companyId = companyId;
        if (status) query.status = status;

        const result = await bookCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Fetch Books Error:", error);
        res.status(500).send({ message: "Failed to fetch books", error: error.message });
      }
    });















    // app.post('/api/bookmarks', async (req, res) => {
    //    const bookmark = req.body;
    //    const result = await bookmarksCollection.insertOne(bookmark);
    //    res.send(result);
    // })


      app.post("/bookmarks", async (req, res) => {
  try {
    const bookmark = req.body;

    const newBookmark = {
      ...bookmark,
      createdAt: new Date(),
    };

    const result = await bookmarksCollection.insertOne(newBookmark);

    res.send({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});


app.get("/bookmarks", async (req, res) => {
  const result = await bookmarksCollection.find().toArray();
  res.send(result);
});





    // ==========================================
    // 2. GET SINGLE BOOK BY ID
    // URL: http://localhost:5000/api/books/:id
    // ==========================================
    // app.get("/api/books/:id", async (req, res) => {
    //   try {
    //     const { id } = req.params;
    //     const query = { _id: new ObjectId(id) };
    //     const result = await bookCollection.findOne(query);

    //     if (!result) {
    //       return res.status(404).send({ message: "Book not found" });
    //     }
    //     res.send(result);
    //   } catch (error) {
    //     res.status(500).send({ message: "Error fetching book", error: error.message });
    //   }
    // });



    app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("DELETE BOOK ID:", id);

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const result = await bookCollection.deleteOne({
      _id: new ObjectId(id),
    });

    console.log("DELETE RESULT:", result);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


    // ==========================================
// DELETE BOOK BY ID
// ==========================================



    // ==========================================
// UPDATE BOOK STATUS
// APPROVE / REJECT
// ==========================================



// ==========================================
// UPDATE BOOK STATUS
// APPROVE / REJECT
// ==========================================

  

app.patch("/api/books/:id/status", logger, verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("BOOK ID:", id);
    console.log("STATUS:", status);

    // ID valid কিনা
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    } 
  
    // Status valid কিনা
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Book খুঁজে বের করা
    const book = await bookCollection.findOne({
      _id: new ObjectId(id),
    });

    console.log("FOUND BOOK:", book);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Status update
    const result = await bookCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    console.log("UPDATE RESULT:", result);

    return res.status(200).json({
      success: true,
      message: `Book ${status} successfully`,
      bookId: id,
      status,
    });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
    // ==========================================
    // 3. ADD NEW BOOK
    // ==========================================
    app.post("/api/add-book", async (req, res) => {
      try {
        const book = req.body;
        const newBook = {
          ...book,
          createdAt: new Date(),
        };
        const result = await bookCollection.insertOne(newBook);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to add book", error: error.message });
      }
    });

  

    app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await bookCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

    // ==========================================
    // 5. SUBSCRIPTIONS & EBOOKS APIs
    // ==========================================
    app.post("/subscriptions", async (req, res) => {
      const { sessionId, userId, priceId } = req.body;
        
      const isExist = await subscriptionCollection.findOne({ sessionId });
      if (isExist) {
        return res.json({ msg: "already exist!" });
      }

      if (!sessionId || !userId || !priceId) {
        return res.status(400).json({ error: "Missing required fields: sessionId, userId, or priceId" });
      } 

      try {
        const result = await subscriptionCollection.insertOne({
          sessionId,
          userId,
          priceId,
          createdAt: new Date()
        });

        const updateResult = await userCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { plan: "pro" } }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: "User not found with the provided ID!" });
        }

        res.json({ message: "Subscription created successfully !" });

      } catch (error) {
        console.error("Subscription Error:", error);
        res.status(500).json({ error: "An error occurred on the server." });
      }
    });

    // app.get("/browse-ebooks", async (req, res) => {
    //   try {
    //     const cursor = browseEbooksCollection.find();
    //     const result = await cursor.toArray();
    //     res.send(result);
    //   } catch (error) {
    //     console.error("Browse Ebooks Error:", error);
    //     res.status(500).send("Internal Server Error");
    //   }
    // });


    app.get("/browse-ebooks", async (req, res) => {
  try {
    const { searchTerm } = req.query; // ফ্রন্টএন্ড থেকে পাঠানো searchTerm ধরা হচ্ছে
    let query = {};

    if (searchTerm) {
      // Regex তৈরি করা হচ্ছে যেন ছোট/বড় হাতের অক্ষরের পার্থক্য ছাড়াই মিল পাওয়া যায়
      const searchRegex = new RegExp(searchTerm, "i");
      query = {
        $or: [
          { title: { $regex: searchRegex } },
          { author: { $regex: searchRegex } },
          { category: { $regex: searchRegex } }
        ]
      };
    }

    const cursor = browseEbooksCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error("Browse Ebooks Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
  
 





    app.get("/browse-ebooks/:bookId", async (req, res) => {
      try {
        const { bookId } = req.params;
        const query = { _id: new ObjectId(bookId) };
        const result = await browseEbooksCollection.findOne(query);
        
        if (!result) {
          return res.status(404).send("Book not found");
        }
        res.send(result);
      } catch (error) {
        console.error("Single Ebook Error:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } catch (err) {
//     console.error("Failed to connect to MongoDB:", err);
//   }
// }
// run().catch(console.dir);

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});


module.exports = app;



