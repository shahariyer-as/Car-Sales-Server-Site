const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsk2b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("hero_car");
        const productsCollection = database.collection("Products");
        const buyCollection = database.collection("buy");
        const reviewCollection = database.collection("review");
        const usersCollection = database.collection("users");

        // add product 
        app.post("/addProduct", async (req, res) => {
            const addProduct = req.body;
            const result = await productsCollection.insertOne(addProduct);
            res.json(result)
        });

        // get product 
        app.get("/products", async (req, res) => {
            const result = await productsCollection.find({}).toArray();
            res.send(result);
        });

        // buy product 

        app.post('/buy', async (req, res) => {
            const buy = req.body;
            // console.log('booking', buy);
            const result = await buyCollection.insertOne(buy);
            res.json(result);
        });

        // get buy products 
        app.get('/buying/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id, 'get id');
            const query = { _id: ObjectId(id) }
            const buy = await productsCollection.findOne(query);
            res.json(buy);
        });


        // Get User Booking Api by email
        app.post('/booking/user', async (req, res) => {
            const userEmail = req.body;
            const query = { email: { $in: userEmail } };
            const booked = await buyCollection.find(query).toArray();
            res.json(booked);
        });

        //  add review 
        app.post('/addReviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        // get review 
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
        });

        // add user 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // make admin 
        app.put('/makeAdmin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            // console.log(filter)
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });


        // verify admin 

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // delete product 
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query)
            res.json(result);
        })
        //  total order get 

        app.get('/totalOrders', async (req, res) => {
            const result = await buyCollection.find({}).toArray();
            res.send(result);
        });

        // delete product 
        app.delete('/deleteBuy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await buyCollection.deleteOne(query)
            res.json(result);
        });




    } finally {
        // await client.close(); 
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Hero car')
})

app.listen(port, () => {
    console.log(`Listening at :${port}`)
})