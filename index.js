const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhjeumo.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        
        // create mongodb database and collection
        const servicesCollection = client.db("carDoctor").collection("services");
        const bookingsCollection = client.db("carDoctor").collection("bookings");
        
        // get all services data
        app.get("/services", async(req, res)=> {
            const cursor = servicesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });
        
        // get single service data
        app.get("/services/:id", async(req, res)=> {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await servicesCollection.findOne(query);
            res.send(result)
        });

        // get single service data for checkout
        app.get("/checkout/:id", async(req, res)=> {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const options = {
                // kuno property lagle tar name and value hisebe just 1 dite hobe
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
              };
            const result = await servicesCollection.findOne(query, options);
            res.send(result)
        })
        
        // Bookings related data
        // get login user's booking data
        app.get("/bookings", async(req, res)=> {
            // console.log(req.query)
            let query = {};
            if(req.query?.email){
                query = {email: req.query.email}
            }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result)
        })
        // Post Single Customer bookings data
        app.post("/bookings", async(req, res)=> {
            const newBookings = req.body;
            const result = await bookingsCollection.insertOne(newBookings);
            res.send(result);
        });

        app.patch("/bookings/:id", async(req, res)=> {
            const id = req.params.id;
            const updatedBooking = req.body;
            // console.log(id, updatedBooking)
            const filter = {_id: new ObjectId(id)};
            // aikhane option create korte hbe na karon aikhne amra PATCH bebohar koreche just suto kicu update korar jonno,,notun kuno kichu add korar jonno na,,option ta muloto kaj kore notun kuno kichu update korar jonno abong kichu na paile notun create kore,,,amra jehetu notun kichu create korbo na tai option create korbo na,, bistarito MODULE-70 er 9 number video te 
            // const options = {upsert: true};
            const updatedBookingStatus = {
                $set: {
                  status : updatedBooking.status,
                }
              };

              const result = await bookingsCollection.updateOne(filter, updatedBookingStatus);
              res.send(result);
        });

        app.delete("/bookings/:id", async(req, res)=> {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        });



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get("/", (req, res) => {
    res.send("car doctor server is running with nodemon")
});

app.listen(port, () => {
    console.log("Car doctor running on port", port)
});