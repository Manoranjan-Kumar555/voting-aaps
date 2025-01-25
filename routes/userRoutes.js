const express = require('express');
const router = require('express').Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const { error } = require('console');
require("dotenv").config();


// POST route to add the a Person

router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the person data

        // Create a new Person document using the Mongoose model
        const newUser = new User(data);

        // Save the new person to the database
        const response = await newUser.save();
        console.log(' New user Data is saved successfully.!');

        const payload = {
            id: response.id
            // name: response.name
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error in Sign Up'});
    }
})

// Login Routes

router.post('/login', async (req, res) => {
    try {
        // Extract aadharCardNumber and password from request body
        const { aadharCardNumber, password } = req.body;

        // Find the user by aadharCardNumber 
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // if user dont exist or password is not match, return error message
        if (!user || !(await comparePassword(password))) {
            return res.status(401).json({ error: "Invalid aadharCardNumber and Password" });
        }

        // generate Token
        const payload = {
            id: user.id,
            // aadharCardNumber: user.aadharCardNumber
        }
        const token = generateToken(payload);

        // resturn token as Response
        res.json({ token });

    } catch (err) {
        console.log("userRoutes error", err);
        res.status(500).json({ error: "Invalid server Error Login" });
    }
});

// Profile routes

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.body;
        console.log("User data of Profile :- ", userData);

        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
    }
    catch (err) {
        console.log("Profile Error", err);
        res.status(500).json({ error: "Invalid server Error in Profile" });
    }
})

// GET method for getting the Persn / Users
router.get('/details',  async (req, res) => {
    try {
        const data = await User.find();
        // showing all the users Data which is available in the database
        // console.log("User data of Users Fetching :- ", data);
        res.status(200).json(data);

    } catch (err) {
        console.log("User Error in getting the Person", err);
        res.status(500).json({ error: "Invalid server Error in gettig User" });
    }
});

// GET the WorkType
// router.get('/:workType', async (req, res) => {

//     try {
//         // Get the Work Type from the URL Parameters
//         const workType = req.params.workType;
//         if (workType == "chef" || workType == "manager" || workType == "waiter") {
//             const response = await User.find({ work: workType });
//             console.log("Fatch Work Type Response");
//             res.status(200).json(response);
//         } else {
//             res.status(400).json({ error: "Invalid Work Type Error in gettig Work Type" });
//         }




//     } catch (err) {
//         console.log("User Error in getting the WorkType", err);
//         res.status(500).json({ error: "Invalid Work Type Error" });
//     }

// });

// PUT Method for users Upadata
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        // Extract the id from the Token
        const userId = req.user;

        // extract the the password current and new password from the Body
        const {currentPassword, newPassword} = req.body;

        // Find the user by userID 
        const user = await User.findById(userId);

        // if  password is not match, return error message
        if (!(await comparePassword(currentPassword))) {
            return res.status(401).json({ error: "Invalid aadharCardNumber and Password" });
        }

        // update the user password
        user.password = newPassword;
        await user.save();
      

        console.log("Password Updated Users Change successfully");
        res.status(200).json({message:"Password Updated Successfully"});

    } catch (err) {
        console.log("User Error in Upadata", err);
        res.status(500).json({ error: "Internal Server Error in Upadata Mathod" });
    }
});

// Delete the Person

// router.delete('/:id', async (req, res) => {
//     try {
//         // Extract the person from the Id from the URL parameters
//         const userId = req.params.id;

//         // Assuming you have User Models
//         const response = await User.findByIdAndRemove(userId);
//         if (!response) {
//             res.status(404).json({ error: "User is Not Found" });
//         }
//         console.log("User deleted");

//         res.status(200).json({ error: "User deleted successfully" });
//     } catch (err) {
//         console.log("User Error in deleting the Person", err);
//         res.status(500).json({ error: "Internal Server Error in deleting" });
//     }
// });

module.exports = router; 