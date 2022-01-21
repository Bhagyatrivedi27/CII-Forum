const express = require('express')

const router = express.Router();

const auth = require('../../middleware/auth')

const {check, validationResult} = require('express-validator')

const Profile = require('../../models/Profile')

const User = require('../../models/User');
const { response } = require('express');


// @Route  GET api/profile/me
// @desc   Get current users profile
// @access Private
router.get('/me', auth, async(req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @Route  POST api/profile/
// @desc   Create or Update User profile
// @access Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req,res) =>{

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {
        college,
        contactNo,
        status,
        skills,
        bio,
        website,
        hometown,
        badges,
        clubs,
        experience,
        hostel,
        linkedin,
        githubusername
    } = req.body

    //Build profile
    const profileFields = {}

    //connecting user to his particular profile
    profileFields.user = req.user.id
    if(contactNo) profileFields.contactNo = contactNo
    if(bio) profileFields.bio = bio
    if(hostel) profileFields.hostel = hostel
    if(status) profileFields.status = status
    if(githubusername) profileFields.githubusername = githubusername
    if(linkedin) profileFields.social.linkedin = linkedin
    if(website) profileFields.website = website
    if(hometown) profileFields.hometown = hometown

    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }

    try {
        let profile = await Profile.findOne({user: req.user.id})
        
        if(profile){
            //update
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, { new: true })
            return res.json(profile)
        } else {
            profile = new Profile(profileFields);
        }
        
        await profile.save();
        res.status(200).json(profile);
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @Route  GET api/profile/user/:user_id
// @desc   Get profile by id
// @access Private
router.get('/user/:user_id',auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar'])
        if(!profile)
            return res.status(400).json({msg: 'Profile not Found!'})
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not Found!'})
        }
        res.status(500).send('Server Error')
    }
})

// @Route  DELETE api/profile/
// @desc   delete profile, user & posts
// @access Private
router.delete('/',auth, async (req,res) => {
    try {
        //remove profile
        await Profile.findOneAndRemove({user: req.user.id})
        // await User.findOneAndRemove({_id: req.user.id})
        
        res.json({msg: 'User deleted'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

// @Route  POST api/profile/college
// @desc   create or update college deets
// @access Private
router.put('/college',[auth, [
    check('degree', 'Degree is required').not().isEmpty(),
    check('branch', 'Branch is required').not().isEmpty(),
    check('year', 'Year is required').not().isEmpty(),
    check('rollno', 'Rollno is required').not().isEmpty(),
    check('regno', 'Regno is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
    check('to', 'To date is required').not().isEmpty()
]] , async(req,res)=>{
    //Frontend will have a form to add exp 
    //Hence add some checks
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    const{
        degree,
        branch,
        year,
        rollno,
        regno,
        from,
        to,
    } = req.body

    const newClg = {
      degree,
      branch,
      year,
      rollno,
      regno,
      from,
      to,
    }; 
    
    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.college.unshift(newClg)

        await profile.save()
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @Route  PUT api/profile/experience
// @desc   Add profile experience
// @access Private
router.put('/experience',[auth, [
    check('position', 'Position is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
    check('to', 'To date is required').not().isEmpty()
]] , async(req,res)=>{
    //Frontend will have a form to add exp 
    //Hence add some checks
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    const{
        position,
        company,
        from,
        to,
        description
    }= req.body

    const newExp = {
        position,
        company,
        from, 
        to,
        description
    } 
    
    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.experience.unshift(newExp)

        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @Route  PUT api/profile/clubs
// @desc   Add profile clubs
// @access Private
router.put('/clubs', [auth, [
    check('clubName', 'Club name is required! ').not().isEmpty(),
    check('position', 'Position is required! ').not().isEmpty()
]], async(req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {
        clubName,
        position
    } = req.body;

    const newClub = {
        clubName,
        position
    }

    try {
        const profile = await Profile.findOne({user: req.user.id})
        profile.clubs.unshift(newClub)

        await profile.save()
        res.json(profile);
    } catch (err) {
        console.error(err.message)
        return res.status(500).json('Server Error') 
    }
})

// @Route  PUT api/profile/badges
// @desc   Add profile clubs
// @access Private
router.put('/badges', [auth, [
    check('title', 'Badge title is required! ').not().isEmpty()
]], async(req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const{
        title
    } = req.body;

    const newBadge = {
        title
    }

    try {
        const profile = await Profile.findOne({user: req.user.id})
        profile.badges.unshift(newBadge);

        await profile.save()
        res.json(profile)
        
    } catch (err) {
        console.error(err.message)
        return res.status(500).json('Server Error')
    }
})

// @Route  DELETE api/profile/experience/:exp_id
// @desc   Delete profile experience
// @access Private
router.delete('/experience/:exp_id', auth, async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id})
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)
        await profile.save()

        res.json(profile);
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @Route  DELETE api/profile/clubs/:club_id
// @desc   Delete profile clubs
// @access Private
router.delete('/clubs/:club_id', auth, async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id})
        const removeIndex = profile.clubs.map(item => item.id).indexOf(req.params.club_id)

        profile.clubs.splice(removeIndex, 1)
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @Route  DELETE api/profile/badges/:badge_id
// @desc   Delete profile experience
// @access Private
router.delete('/badges/:badge_id', auth, async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id})
        const removeIndex = profile.badges.map(item => item.id).indexOf(req.params.badge_id)

        profile.badges.splice(removeIndex, 1)
        await profile.save()

        res.json(profile);
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @Route  DELETE api/profile/college/:clg_id
// @desc   Delete college profile
// @access Private
router.delete('/college/:clg_id', auth, async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id})
        const removeIndex = profile.college.map(item => item.id).indexOf(req.params.clg_id)

        profile.college.splice(removeIndex, 1)
        await profile.save()

        res.json(profile);
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router;

// @Route  GET api/profile/
// // @desc   Get all profiles
// // @access Private
// router.get('/', async (req,res) => {
//     try {
//         const profiles = await Profile.find().populate('user', ['name', 'avatar'])
//         res.json(profiles);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error')
//     }
// })
