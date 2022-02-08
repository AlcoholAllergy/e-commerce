require('dotenv').config();
//this package will have the try&catch to all controller functions
require('express-async-errors');
const express = require('express');
const app = express();

//rest of the packages
//morgan for logger monitor
const morgan = require('morgan')

//image file upload
const fileUpload = require('express-fileupload')

//cookie parser
const cookieParser = require('cookie-parser')

//connect DB
const connectDB = require('./db/connect');

//auth routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

//product routes
const productRoutes = require('./routes/productRoutes')

//error handler and not found middleware
const notFound = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');


//to obtain the access to the req.body
app.use(express.json());
app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))
app.use(fileUpload())

app.get('/pai/v1',(req, res)=>{
    //req.signedCookie needs the cookie-parser which imported above
    //to get the cookie from front end
    //!!notice that the req.singedCookie.token is name when the cookie been set as res.cookie('token',token,{...}), the 1st string 'token' is the name property when it comes back from front end
    console.log(req.signedCookies.token)
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reviews', reviewRoutes);


app.use(notFound);
app.use(errorHandlerMiddleware);


//set up the server and connect to DB
port = process.env.PORT || 3000;

const start = async ()=>{
    //connect to DB
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port,()=>{
            console.log(`Server is listening on PORT ${port}...`);
        })
        
    } catch (error) {
        console.log(error);
    }
};

start();