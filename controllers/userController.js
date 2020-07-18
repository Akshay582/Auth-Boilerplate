const bcrypt = require( 'bcryptjs' );
const passport = require( 'passport' );
const nodemailer = require( 'nodemailer' );

const User = require( '../models/user' );

module.exports.register = function ( req, res ) {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    // Check required fields
    if ( !name || !email || !password || !password2 ) {
        errors.push( { msg: "Please fill all the fields." } );
    }

    // Check if passwords match
    if ( password !== password2 ) {
        errors.push( { msg: "Passwords do not match." } )
    }

    // Check the password length
    if ( password.length < 6 ) {
        errors.push( { msg: "Password should be atleast 6 characters." } )
    }

    if ( errors.length > 0 ) {
        res.render( 'register', {
            errors, name, email, password, password2
        } )
    } else {
        // Validation passed
        User.findOne( { email } )
            .then( user => {
                if ( user ) {
                    // User already exists
                    errors.push( { msg: "User already exists! Please try again with a different email." } );
                    res.render( 'register', {
                        errors, name, email, password, password2
                    } )
                } else {
                    const newUser = new User( {
                        name, email, password
                    } );
                    // Hash password
                    bcrypt.genSalt( 10, ( err, salt ) => bcrypt.hash( newUser.password, salt, ( err, hash ) => {
                        if ( err ) throw err;
                        // Set password to hashed password
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                            .then( user => {
                                req.flash( 'success_msg', 'You are now registered and can log in!' );
                                res.redirect( '/users/login' );
                            } )
                            .catch( error => console.log( error ) );
                    } ) )
                }
            } )
    }
}

module.exports.login = function ( req, res, next ) {
    passport.authenticate( 'local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    } )( req, res, next );
}

module.exports.logout = function ( req, res ) {
    req.logout();
    req.flash( 'success_msg', 'You are logged out!' );
    res.redirect( '/users/login' );
}

function generateP() {
    var pass = '';
    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789@#$!%^&*';

    for ( i = 1; i <= 8; i++ ) {
        var char = Math.floor( Math.random()
            * str.length + 1 );

        pass += str.charAt( char )
    }

    return pass;
}

module.exports.reset = async function ( req, res ) {
    const { email } = req.body;
    // generate random password
    const rd_password = generateP();
    bcrypt.genSalt( 10, ( err, salt ) => bcrypt.hash( rd_password, salt, ( err, hash ) => {
        if ( err ) throw err;
        // Update password to hashed password
        User.updateOne( { email }, {
            password: hash
        }, function ( err, affected, resp ) {
            console.log( resp );
        } );
    } ) )

    User.findOne( { email } )
        .then( async function ( user ) {
            if ( user ) {
                const output = `
        <p>As you made a request to reset password</p>
        <h3>User details: </h3>
        <ul>
        <li>Email: ${email}</li>
        </ul>
        <p>Your new password is <strong>${rd_password}</strong></p>
    `;

                let testAccount = await nodemailer.createTestAccount();

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport( {
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: testAccount.user, // generated ethereal user
                        pass: testAccount.pass, // generated ethereal password
                    },
                } );

                // send mail with defined transport object
                let info = await transporter.sendMail( {
                    from: `"Nodemailer" ${testAccount.user}`, // sender address
                    to: `${email}`, // list of receivers
                    subject: "Regarding App Password Reset", // Subject line
                    text: "Hello world?", // plain text body
                    html: output, // html body
                } );

                console.log( "Message sent: %s", info.messageId );

                console.log( "Preview URL: %s", nodemailer.getTestMessageUrl( info ) );

                req.flash( 'success_msg', `Mail successfully sent to ${email}. Please proceed to login with the reset password` );
                res.redirect( '/users/login' );
            } else {
                const { email } = req.body;
                let errors = [];
                errors.push( { msg: "The user doesn't exist. Please try with another email or create a new account!" } );
                res.render( 'reset_password', {
                    errors, email
                } )
            }
        } )
}

module.exports.change = function ( req, res ) {
    const { password, password2 } = req.body;
    if ( password == password2 ) {
        const { email } = req.user;
        bcrypt.genSalt( 10, ( err, salt ) => bcrypt.hash( password, salt, ( err, hash ) => {
            if ( err ) throw err;
            // Update password to hashed password
            User.updateOne( { email }, {
                password: hash
            }, function ( err, affected, resp ) {
                console.log( resp );
            } );
        } ) )
        req.flash( 'success_msg', `Password changed successfully!` );
        res.redirect( '/dashboard' );
    }
    else {
        res.redirect( '/users/changepwd' );
    }
}