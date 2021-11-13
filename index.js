const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors')

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rnamf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)
async function run() {
    try {
        await client.connect();
        const database = client.db("raster-cars");
        const carCollection = database.collection("car-lists");
        const usersCollection = database.collection('users');
        const addOrderCollection = database.collection('orders');

        // GET API
        app.get('/cars', async (req, res) => {
            const cursor = carCollection.find({});
            const users = await cursor.toArray();
            res.send(users)
        })

        // post 
        app.post('/cars', async (req, res) => {
            const addCar = req.body;
            console.log(addCar)
            const result = await carCollection.insertOne(addCar);
            console.log(result);
            res.json(result)
        })

        // GET SINGLE ITEM
        app.get('/cars/:id', async (req, res) => {
            const itemId = req.params.id;
            const query = { _id: ObjectId(itemId) };
            const singleCar = await carCollection.findOne(query);
            res.json(singleCar);
        })

        // delete order
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await carCollection.deleteOne(query);
            res.json(result);
        })

        // users data post to mongodb
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log('user result', result);
            res.json(result);
        })

        // make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const updateUser = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateUser);
            res.json(result);
        })

        // check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // add orders 
        app.post('/addOrders', async (req, res) => {
            const addOrder = req.body;
            const result = await addOrderCollection.insertOne(addOrder);
            console.log(result);
            res.json(result)
        })

        // get orders
        app.get('/addOrders', async (req, res) => {
            const cursor = addOrderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })

        // update order rating
        app.put('/addOrders', async (req, res) => {
            const data = req.body;
            console.log(data)
            const searchingId = data.selectedId;
            console.log(searchingId)
            const filter = { _id: ObjectId(searchingId) };
            const options = { upsert: true };

            // update
            const updateRating = { $set: data }
            const result = await addOrderCollection.updateOne(filter, updateRating, options);
            console.log(result)
            res.json(result);
        })

        // update order status
        app.put('/addOrders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'approved'
                },

            }
            const result = await addOrderCollection.updateOne(filter, updateDoc, options)
            console.log('updating user', req)
            res.json(result)
        })


        // delete order
        app.delete('/addOrders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await addOrderCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})