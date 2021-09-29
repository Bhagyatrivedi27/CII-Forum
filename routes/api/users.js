const express = require('express')

const router = express.Router();

const config = require('config')

const {check, validationResult} = require('express-validator')

const gravatar = require('gravatar')

const bcrypt = require('bcryptjs')

const User = require('../../models/User')

const jwt = require('jsonwebtoken')

// @Route  POST api/users
// @desc   Register User
// @access Public
router.post('/', [
    check('name','Name is required').not().isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with 6 or more characters').isLength({ min: 6})
],
    async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email,password} = req.body;

    //Check if the email is an institute email ID 
    let subEmail1 = '@student.nitw.ac.in'
    let subEmail2 = '@nitw.ac.in'
    if(!email.includes(subEmail1) && !email.includes(subEmail2))
    {
        res.send('Please enter a valid email')

        //exit
        process.exit(1);
    }

    try{

        //See if user exits 
        let user = await User.findOne({email});
        if(user){
           return res.status(400).json({errors: [{msg:'User Already Exists'}] });
        }

        // Get users gravatar 
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        });

        //Encrypt password 
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt)

        await user.save();

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
