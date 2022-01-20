const express = require("express");

const router = express.Router();

const config = require("config");

const { check, validationResult } = require("express-validator");

const gravatar = require("gravatar");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const User = require("../../models/User");
const Profile = require("../../models/Profile");

// @Route  GET api/users/verify
// @desc   Verify the entered email and account creation
// @access Private
router.get("/verify", async function (req, res) {
  token = req.query.id;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.get("jwtVerify"), {
        expiresIn: 360000,
      });

      const { name, email, password, joiningYear, rollNo, regNo } = decoded;

      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ errors: [{ msg: "Account already verified" }] });
      }

      try {
        const avatar = gravatar.url(email, {
          s: "200",
          r: "pg",
          d: "mm",
        });

        user = new User({
          name,
          email,
          avatar,
          password,
          joiningYear,
          rollNo,
          regNo,
        });

        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        //Save user to database
        await user.save();
        console.log("User Created...");

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 360000 },

          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );

        return res.status(200).json(token);
      } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: [{ msg: "Server Error" }] });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  } else {
    return res.status(403).json({ errors: [{ msg: "Token Does not Exist" }] });
  }
});

// @Route  POST api/users/register-user
// @desc   Register User
// @access Public
router.post(
  "/register-user",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("joiningYear", "Please enter year of joining").not().isEmpty(),
    check("rollNo", "Please enter valid roll number").not().isEmpty(),
    check("regNo", "Please enter valid registration number").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, joiningYear, rollNo, regNo } = req.body;
    const user_detail = req.body;

    if (
      !email.includes("@student.nitw.ac.in") &&
      !email.includes("@nitw.ac.in")
    ) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Please enter a valid Institute Email" }] });
    }

    //See if user exits
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User Already Exists" }] });
      }

      user = await User.findOne({ rollNo });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User Already Exists" }] });
      }

      user = await User.findOne({ regNo });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User Already Exists" }] });
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }

    // Email Verification
    // Token creation
    const token_mail_verification = jwt.sign(
      user_detail,
      config.get("jwtVerify")
    );

    var url =
      config.get("http://localhost:3000/") +
      "api/users/verify?id=" +
      token_mail_verification;

    // Initializing Nodemail Transporter
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "forumigproject@gmail.com", // like : abc@gmail.com , Yoour email u are sending the mail from
          pass: "Hello@12345", // like : pass@123
        },
      });

      let mailOptions = {
        from: "rithiktester@gmail.com",
        to: `${email}`,
        subject: "IG Forum Verification Email",
        text: "Click on the link to veriy your account " + url,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(403).send(error.message);
        } else {
          return res.status(200).send("Email Sent");
        }
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

// @Route  POST api/users/delete-user
// @desc   Delete User
// @access Private
router.post(
  "/delete-user",
  [check("email", "Please include a valid email").isEmail()],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: "User not found!" }] });
      }

      // Removing user
      await User.remove({ email });
      await Profile.remove(user);

      return res.status(200).json({ msg: "User Deleted successfully!" });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

module.exports = router;

// async function accountCreation(user_detail) {
//   const { name, email, password, joiningYear, rollNo, regNo } = user_detail;
//   try {
//     const avatar = gravatar.url(email, {
//       s: "200",
//       r: "pg",
//       d: "mm",
//     });

//     user = new User({
//       name,
//       email,
//       avatar,
//       password,
//       joiningYear,
//       rollNo,
//       regNo,
//     });

//     //Encrypt password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     //Save user to database
//     await user.save();
//     console.log("User Created...");

//     // const payload = {
//     //   user: {
//     //     id: user.id,
//     //   },
//     // };

//     // jwt.sign(
//     //   payload,
//     //   config.get("jwtSecret"),
//     //   { expiresIn: 360000 },

//     //   (err, token) => {
//     //     if (err) throw err;
//     //     res.json({ token });
//     //   }
//     // );
//     return 1;
//   } catch (err) {
//     console.error(err.message);
//     return 0;
//   }
// }
