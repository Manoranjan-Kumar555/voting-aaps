const express = require('express');
const router = require('express').Router();
const Candidate = require("../models/candidates");
const User = require("../models/user");
const { jwtAuthMiddleware } = require("../jwt");
require("dotenv").config();

// Helper function to check if the user has the "admin" role
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user && user.role === "admin";
    } catch (error) {
        return false;
    }
};

// POST: Add a new candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "Access denied. Admin role required." });
        }

        const data = req.body; // Candidate data from the request body
        const newCandidate = new Candidate(data); // Create a new candidate document
        const response = await newCandidate.save(); // Save to the database

        console.log('New Candidate Data saved successfully!');
        res.status(200).json({ message: "Candidate added successfully", response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error while adding a candidate.' });
    }
});

// GET method for getting the Participated Candidate with the given Votes Details
router.get('/details',  async (req, res) => {
    try {
        const data = await Candidate.find();
        // showing all the users Data which is available in the database
        // console.log("User data of Users Fetching :- ", data);
        res.status(200).json(data);

    } catch (err) {
        console.log("User Error in getting the Person", err);
        res.status(500).json({ error: "Invalid server Error in gettig User" });
    }
});

// PUT: Update candidate data
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "Access denied. Admin role required." });
        }

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found.' });
        }

        console.log('Candidate data updated successfully.');
        res.status(200).json({ message: "Candidate updated successfully", response });
    } catch (err) {
        console.error("Error updating candidate:", err);
        res.status(500).json({ error: "Internal Server Error while updating candidate data." });
    }
});

// DELETE: Remove candidate data
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "Access denied. Admin role required." });
        }

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found.' });
        }

        console.log('Candidate data deleted successfully.');
        res.status(200).json({ message: "Candidate deleted successfully", response });
    } catch (err) {
        console.error("Error deleting candidate:", err);
        res.status(500).json({ error: "Internal Server Error while deleting candidate data." });
    }
});

// GET: Start voting for a candidate
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.error("Error during voting:", err);
        res.status(500).json({ error: "Internal Server Error while recording the vote." });
    }
});

// GET: Get total vote counts for all candidates
router.get("/vote/count", async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: "desc" });

        // Map candidates to return only name and voteCount
        const voteRecords = candidates.map((candidate) => ({
            Party: candidate.name,
            Total_Vote: candidate.voteCount
        }));

        res.status(200).json(voteRecords);
    } catch (err) {
        console.error("Error fetching vote counts:", err);
        res.status(500).json({ error: "Internal Server Error while fetching vote counts." });
    }
});

module.exports = router;
