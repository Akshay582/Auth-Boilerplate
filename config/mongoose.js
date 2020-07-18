const mongoose = require( 'mongoose' );

mongoose.connect( 'mongodb://localhost:27017/app_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
} );

const db = mongoose.connection;

db.on( 'error', console.error.bind( console, "Error connecting to MongoDB!" ) );

db.once( 'open', function () {
    console.log( "Connected through mongoose:: MongoDB." );
} )

module.exports = db;