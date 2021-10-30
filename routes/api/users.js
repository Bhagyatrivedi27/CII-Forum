const express = require('express')

const router = express.Router();

const config = require('config')

const {check, validationResult} = require('express-validator')

const gravatar = require('gravatar')

const bcrypt = require('bcryptjs')

const User = require('../../models/User')

const jwt = require('jsonwebtoken')

// @Route  POST http://localhost:3000/api/users/register-user
// @desc   Register User
// @access Public
router.post('/register-user', [
    check('name','Name is required').not().isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with 6 or more characters').isLength({ min: 6}),
    check('joiningYear', 'Please enter year of joining').not().isEmpty(),
    check('rollNo', 'Please enter valid roll number').not().isEmpty(),
    check('regNo', 'Please enter valid registration number').not().isEmpty(),

    
],
    async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email,password,joiningYear, rollNo,regNo } = req.body;

    //Check if the email is an institute email ID 
    // TO DO: 
    // 1) Properly validate that the given email is NITW's email from the correct batch
    // 2) We have to check if the particular exists. (No one can create a dummy student email ID)

    // mb812073@stud
    // rm842073
    // bt811879
    // firstNameFirst5Char_rollno 
    //  gupta_roll@

    let subEmail1 = '@student.nitw.ac.in'
    let subEmail2 = '@nitw.ac.in'
    if(!email.includes(subEmail1) && !email.includes(subEmail2))
    {
        return res.status(400).json({errors: [{msg:'Please enter a valid Institute Email'}] });
        
    }
    
    try{

        //See if user exits 
        let user = await User.findOne({email});
        if(user){
           return res.status(400).json({errors: [{msg:'User Already Exists'}] });
        }

        let user = await User.findOne({rollNo})
        if(user){
            return res.status(400).json({errors: [{msg:'User Already Exists'}] });
         }
         let user = await User.findOne({regNo})
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
            password,
            joiningYear,
            rollNo, 
            regNo
        });

        //Encrypt password 
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt)


        //Save user to database 
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

// @Route  POST api/users/delete-user
// @desc   Delete User
// @access Public
router.post('/delete-user',[check('email','Please include a valid email').isEmail()], async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email} = req.body

    try {
        let user = await User.findOne({email})
        if(!user){
            return res.status(400).json({errors: [{msg:'User not found!'}] });
        }

        await User.remove({email})
        return res.status(200).json({msg: 'User Deleted successfully! '})
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }

});


module.exports = router;
