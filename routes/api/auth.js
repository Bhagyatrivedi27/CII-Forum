const express = require('express')

const router = express.Router();

const auth = require('../../middleware/auth');

const User = require('../../models/User')

const {check, validationResult} = require('express-validator')

const config = require('config')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')

// @Route  GET api/auth
// @desc   Test route
// @access Public
router.get('/', auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sever Error');
    }
});

// @Route  POST api/auth/user-login
// @desc   Authenticate User & get Token
// @access Public
router.post('/user-login', [
    check('email','Please include a valid email').isEmail(),
    check('password','Password is required').exists()
],
    async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email,password} = req.body;

    // //Check if the email is an institute email ID 
    // let subEmail1 = '@student.nitw.ac.in'
    // let subEmail2 = '@nitw.ac.in'
    // if(!email.includes(subEmail1) && !email.includes(subEmail2))
    // {
    //     return res.status(400).json({errors: [{msg:'Please enter a valid Institute Email'}] });

    //     //exit
    //     process.exit(1);
    // }

    try{

        //See if user exits 
        let user = await User.findOne({email});
        if(!user){
           return res.status(400).json({errors: [{msg:'Invalid Credentials'}] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({errors: [{msg:'Invalid Credentials'}] });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000},
        (err, token)=>{
            if(err)
            throw err;
            res.json({token});
        })        
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }

});

module.exports = router;
