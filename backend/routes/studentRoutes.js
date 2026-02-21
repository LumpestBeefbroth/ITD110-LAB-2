const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');


const validateStudent = (req, res, next) => {
    const { name, email, course, phoneNumber, gpa, enrollmentDate } = req.body;

    
    if (!name || !email || !course || !phoneNumber || !gpa || !enrollmentDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    
    const gpaValue = parseFloat(gpa);
    if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 5.0) {
        return res.status(400).json({ message: 'GPA must be between 0.0 and 5.0 (MSU-IIT Standard)' });
    }

    
    const phoneRegex = /^(09|\+639)[0-9]{9}$|^09[0-9]{2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        return res.status(400).json({ message: 'Invalid Philippine phone number format. Use format: 09xxxxxxxxx or +639xxxxxxxxx' });
    }

    
    req.body.name = name.trim();
    req.body.email = email.toLowerCase().trim();
    req.body.course = course.trim();
    req.body.phoneNumber = phoneNumber.trim();
    req.body.gpa = gpaValue;
    req.body.enrollmentDate = enrollmentDate.trim();

    next();
};

router.route('/')
    .get(getStudents)
    .post(validateStudent, createStudent);

router.route('/:id')
    .get(getStudent)
    .put(validateStudent, updateStudent)
    .delete(deleteStudent);

module.exports = router;
