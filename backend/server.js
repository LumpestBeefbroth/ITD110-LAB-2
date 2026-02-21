const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, client } = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const { operationLogger, initializeLogger, getOperationsLog, clearOperationsLog } = require('./middleware/loggingMiddleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(operationLogger);

app.use('/api/students', studentRoutes);

// Logging routes
app.get('/api/logs', getOperationsLog);
app.delete('/api/logs', clearOperationsLog);

app.get('/', (req, res) => {
    res.json({ message: 'Student CRUD API (Redis)' });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
    await connectDB();
    initializeLogger(client);
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
