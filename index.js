



const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = 5000;
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Root Router
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Successfully connected to MongoDB!");

  
    const db = client.db("booksdb");

    // 2. Define collections after initializing the database
    const subscriptionCollection = db.collection("subscriptions");
    const userCollection = db.collection("user");
    const browseEbooksCollection = db.collection("courses");

    // -------------------------------------------------------------
    // API to create subscription and update user role to 'pro' (POST)
    // -------------------------------------------------------------
    app.post("/subscriptions", async (req, res) => {
      const { sessionId, userId, priceId } = req.body;
       
       const isExist = await subscriptionCollection.findOne({ sessionId });
        if(isExist){
          return res.json({msg: "already exist!"})
        }

      // Validate incoming data from the client
      if (!sessionId || !userId || !priceId) {
        return res.status(400).json({ error: "Missing required fields: sessionId, userId, or priceId" });
      } 

      try {
        // Insert subscription data
        const result = await subscriptionCollection.insertOne({
          sessionId,
          userId,
          priceId,
          createdAt: new Date()
        });

        // Update user role to 'pro' using 'new ObjectId'
        const updateResult = await userCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { plan: "pro" } }
        );

        // Handle case where user is not found in the database
        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: "User not found with the provided ID!" });
        }

        res.json({ message: "Subscription created successfully !" });

      } catch (error) {
        console.error("Subscription Error:", error);
        res.status(500).json({ error: "An error occurred on the server." });
      }
    });

    // -------------------------------------------------------------
    // API to fetch all ebooks (GET)
    // -------------------------------------------------------------
    app.get("/browse-ebooks", async (req, res) => {
      try {
        const cursor = browseEbooksCollection.find();
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});