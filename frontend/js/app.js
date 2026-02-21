const API_URL = 'http://localhost:3000/api/students';

const form = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const studentIdInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneNumberInput = document.getElementById('phoneNumber');
const courseInput = document.getElementById('course');
const gpaInput = document.getElementById('gpa');
const enrollmentDateInput = document.getElementById('enrollmentDate');
const tbody = document.getElementById('students-tbody');
const noStudentsMsg = document.getElementById('no-students');
const searchInput = document.getElementById('search-input');

let allStudents = [];
let isEditing = false;

document.addEventListener('DOMContentLoaded', fetchStudents);

form.addEventListener('submit', handleSubmit);
cancelBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', handleSearch);

async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        allStudents = await response.json();
        renderStudents(allStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allStudents.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query) ||
        (student.phoneNumber && student.phoneNumber.includes(query))
    );
    renderStudents(filtered);
}

function renderStudents(students) {
    tbody.innerHTML = '';

    if (students.length === 0) {
        noStudentsMsg.classList.remove('hidden');
        return;
    }

    noStudentsMsg.classList.add('hidden');

    students.forEach(student => {
        const row = document.createElement('tr');
        
        
        let enrollmentDate = 'N/A';
        if (student.enrollmentDate) {
            
            const dateStr = student.enrollmentDate.split('T')[0] || student.enrollmentDate;
            const dateObj = new Date(dateStr + 'T00:00:00Z');
            if (!isNaN(dateObj)) {
                enrollmentDate = dateObj.toLocaleDateString();
            }
        }
        
        let gpaDisplay = 'N/A';
        if (student.gpa !== undefined && student.gpa !== null && student.gpa !== '') {
            const gpaValue = parseFloat(student.gpa);
            if (!isNaN(gpaValue)) {
                gpaDisplay = gpaValue.toFixed(2);
            }
        }
        
        row.innerHTML = `
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.phoneNumber || 'N/A')}</td>
            <td>${escapeHtml(student.course)}</td>
            <td><span class="gpa-badge">${gpaDisplay}</span></td>
            <td>${enrollmentDate}</td>
            <td>
                <button class="btn-edit" onclick="editStudent('${student.id}')">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteStudent('${student.id}')">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function handleSubmit(e) {
    e.preventDefault();

    const studentData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phoneNumber: phoneNumberInput.value.trim(),
        course: courseInput.value.trim(),
        gpa: gpaInput.value,
        enrollmentDate: enrollmentDateInput.value
    };

    try {
        if (isEditing) {
            await fetch(`${API_URL}/${studentIdInput.value}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        }

        resetForm();
        fetchStudents();
    } catch (error) {
        console.error('Error saving student:', error);
        alert('Error saving student. Please try again.');
    }
}

async function editStudent(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const student = await response.json();

        studentIdInput.value = student.id || '';
        nameInput.value = student.name || '';
        emailInput.value = student.email || '';
        phoneNumberInput.value = student.phoneNumber || '';
        courseInput.value = student.course || '';
        
       
        if (student.gpa !== undefined && student.gpa !== null) {
            const gpaVal = parseFloat(student.gpa);
            gpaInput.value = isNaN(gpaVal) ? '' : gpaVal.toString();
        } else {
            gpaInput.value = '';
        }
        
        
        if (student.enrollmentDate) {
            const dateStr = student.enrollmentDate.split('T')[0] || student.enrollmentDate;
            enrollmentDateInput.value = dateStr || '';
        } else {
            enrollmentDateInput.value = '';
        }

        isEditing = true;
        formTitle.textContent = '✏️ Edit Student';
        submitBtn.textContent = '💾 Update Student';
        cancelBtn.classList.remove('hidden');

        nameInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching student:', error);
        alert('Error loading student data. Please try again.');
    }
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
    }
}

function resetForm() {
    form.reset();
    studentIdInput.value = '';
    isEditing = false;
    formTitle.textContent = '➕ Add New Student';
    submitBtn.textContent = '➕ Add Student';
    cancelBtn.classList.add('hidden');
}
