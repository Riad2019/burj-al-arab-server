const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const {MongoClient}  = require('mongodb');
require('dotenv').config()
console.log(process.env.DB_PASS);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vtemd.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 4000
const app = express()


app.use(cors());
app.use(bodyParser.json());


var admin = require("firebase-admin");

var serviceAccount = require("./configs/burj-al-arab-auth-by-riad-firebase-adminsdk-lgak5-b8d62cdc02.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const booking = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  console.log("db connected successfully")
   
  app.post("/addBooking", (req,res) => {
    const newBooking = req.body;

    booking.insertOne(newBooking)
    .then(result => {
      res.send(result.insertedCount>0);
    })

    console.log(newBooking);
  })

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1]
      //console.log(idToken);
      // idToken comes from the client app
          admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
           const tokenEmail = decodedToken.email;
           if (tokenEmail==req.query.email){

            booking.find({email: req.query.email})
            .toArray((err, documents) => {
             res.status(200).send(documents);
            })

           }
           console.log({uid});
           // ...
          })
          .catch((error) => {
           // Handle error
           //res.status(401).send('un authorized access');
          });
    }
   
    else{
      res.status(401).send('un authorized access');
    }
    
  })
});




app.listen(port)