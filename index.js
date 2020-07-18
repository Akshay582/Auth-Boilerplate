const express = require( 'express' );
const expressLayouts = require( 'express-ejs-layouts' );
const app = express();
const flash = require( 'connect-flash' );
const session = require( 'express-session' );
const MongoStore = require( 'connect-mongo' )( session );
const passport = require( 'passport' );
const mongoose = require( 'mongoose' );

const mongoose_db = require( './config/mongoose' );

const PORT = process.env.PORT || 8000;

// EJS
app.use( expressLayouts );
app.set( 'view engine', 'ejs' );

// Body Parser
app.use( express.urlencoded( { extended: false } ) )

// Express session
app.use( session( {
    secret: 'keyboard cat',
    store: new MongoStore( { mongooseConnection: mongoose.connection } ),
    resave: false,
    saveUninitialized: true
} ) )

// Passport middleware
app.use( passport.initialize() );
app.use( passport.session() );
require( './config/passport' )( passport );

// Connect Flash 
app.use( flash() );

// Global Vars
app.use( ( req, res, next ) => {
    res.locals.success_msg = req.flash( 'success_msg' );
    res.locals.error_msg = req.flash( 'error_msg' );
    res.locals.error = req.flash( 'error' );
    next();
} )

app.use( '/', require( './routes' ) );

app.listen( PORT, function ( error ) {
    if ( error ) { return console.error( "Problem in running the server!" ); }
    console.log( 'Server running at PORT: ', PORT );
} )