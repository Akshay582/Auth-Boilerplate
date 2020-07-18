const express = require( 'express' );
const router = express.Router();

const userController = require( '../controllers/userController' );

// REGISTER PAGE
router.get( '/register', function ( req, res ) {
    res.render( 'register' );
} )

// LOGIN PAGE
router.get( '/login', function ( req, res ) {
    res.render( 'login' );
} )

// RESET PASSWORD PAGE
router.get( '/resetpwd', function ( req, res ) {
    res.render( 'reset_password' );
} )

// CHANGE PASSWORD PAGE
router.get( '/changepwd', function ( req, res ) {
    res.render( 'change_password' );
} )

// Register Handle
router.post( '/register', userController.register );

// Reset Password Handle
router.post( '/reset', userController.reset );

// Change Password Handle
router.post( '/change', userController.change );

// Login Handle
router.post( '/login', userController.login );

// Logout Handle
router.get( '/logout', userController.logout );

module.exports = router;
