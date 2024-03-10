const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');
function authController() {
    return {
        login(req, res) {
            res.render('auth/login');
        },
        postLogin(req, res, next) {
            const { email, password } = req.body;
                // Validate Request
                if (!email || !password) {
                    req.flash('error', 'All fields are required');
                    return res.redirect('/login');
                }
passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message);
                    return next(err);
                }
                if (!user) {
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }
                req.login(user, (err) => {
                    if (err) {
                        req.flash('error', info.message);
                        return next(err);
                    }
                    return res.redirect('/');
                });
            })(req, res, next);
        },

        register(req, res) {
            res.render('auth/register');
        },

        // Handling user registration
        async postRegister(req, res) {
            const { name, email, password } = req.body;
            try {
                // Validate Request
                if (!name || !email || !password) {
                    req.flash('error', 'All fields are required');
                    req.flash('name', name);
                    req.flash('email', email);
                    return res.redirect('/register');
                }

                // Check if email exists
                const existingUser = await User.findOne({ email: email });
                if (existingUser) {
                    req.flash('error', 'Email Already Taken');
                    req.flash('name', name);
                    req.flash('email', email);
                    return res.redirect('/register');
                }

                // Hash Password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create a new user
                const user = new User({
                    name,
                    email,
                    password: hashedPassword
                });

                // Save the user to the database
                await user.save();
                req.flash('success', 'Registration successful. You can now log in.');
                return res.redirect('/login');
            } catch (err) {
                console.error(err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/register');
            }
        },
        logout(req, res) {
            req.logout((err) => {
                if (err) {
                    console.error(err);
                    return res.redirect('/');
                }
                return res.redirect('/');
            });
        }
        
    };
}

module.exports = authController;
