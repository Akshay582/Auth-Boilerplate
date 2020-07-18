const express = require( 'express' );
const router = express.Router();
const { ensureAuthenticated } = require( '../config/auth' );

// WELCOME PAGE
router.get( '/', function ( req, res ) {
    res.render( 'welcome' );
} )

// Dashboard page
router.get( '/dashboard', ensureAuthenticated, function ( req, res ) {
    res.render( 'dashboard', { user: req.user.name } );
} )

// USER RELATED ROUTES
router.use( '/users', require( './users' ) );

module.exports = router;