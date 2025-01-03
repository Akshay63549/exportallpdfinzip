const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

// Create (POST) - Add a new student
router.post('/', async (req, res) => {
  const { StudentId, Name, Roll, Birthday, Address } = req.body;

  // Check if all required fields are provided
  if (!StudentId || !Name || !Roll || !Birthday || !Address) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'All fields (StudentId, Name, Roll, Birthday, Address) are required.'
    });
  }

  try {
    // Create and save the student if all fields are valid
    const student = new Student({ StudentId, Name, Roll, Birthday, Address });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    // Handle other errors, e.g., database-related issues
    res.status(400).json({ error: 'Failed to create student', message: err.message });
  }
});

// Read (GET) - Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch students', message: err.message });
  }
});

// Read (GET) - Get a student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.status(200).json(student);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch student', message: err.message });
  }
});

// Update (PUT) - Update a student's data
router.put('/:id', async (req, res) => {
  const { Name, Roll, Birthday, Address } = req.body;
  try {
    const student = await Student.findByIdAndUpdate(

      
      req.params.id,
      { Name, Roll, Birthday, Address },
      { new: true } // Returns the updated document
    );
    console.log("studentstudent", student)
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.status(200).json({message: "Student Update successfully" ,student});
  } catch (err) {
    res.status(400).json({ error: 'Failed to update student', message: err.message });
  }
});

// Delete (DELETE) - Delete a student by ID
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete student', message: err.message });
  }
});

module.exports = router;
