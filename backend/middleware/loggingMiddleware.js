const redis = require('redis');

let redisClient;

const initializeLogger = (client) => {
    redisClient = client;
};


const operationLogger = async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        
        logOperation(req, res, data);
        return originalSend.call(this, data);
    };

    next();
};


const logOperation = async (req, res, responseData) => {
    if (!redisClient) return;

    try {
        const timestamp = new Date().toISOString();
        const method = req.method;
        const path = req.originalUrl;
        let operation = 'UNKNOWN';
        let details = {};

        
        if (path.includes('/api/students')) {
            if (method === 'POST') {
                operation = 'CREATE';
                details = {
                    name: req.body.name || 'N/A',
                    email: req.body.email || 'N/A',
                    course: req.body.course || 'N/A'
                };
            } else if (method === 'PUT') {
                operation = 'UPDATE';
                details = {
                    id: req.params.id,
                    name: req.body.name || 'N/A',
                    course: req.body.course || 'N/A'
                };
            } else if (method === 'DELETE') {
                operation = 'DELETE';
                details = { id: req.params.id };
            } else if (method === 'GET' && req.params.id) {
                operation = 'READ';
                details = { id: req.params.id };
            } else if (method === 'GET') {
                operation = 'LIST';
                details = { action: 'Retrieved all students' };
            }
        }

        const logEntry = {
            timestamp,
            operation,
            method,
            statusCode: res.statusCode,
            details: JSON.stringify(details),
            message: typeof responseData === 'string' ? responseData : JSON.stringify(responseData)
        };

        
        const logKey = 'student:operations:log';
        
       
        await redisClient.lPush(logKey, JSON.stringify(logEntry));
        
        
        await redisClient.lTrim(logKey, 0, 99);
    } catch (error) {
        console.error('Logging error:', error.message);
    }
};


const getOperationsLog = async (req, res) => {
    if (!redisClient) {
        return res.status(500).json({ message: 'Logger not initialized' });
    }

    try {
        const logKey = 'student:operations:log';
        const logs = await redisClient.lRange(logKey, 0, -1);
        
        const parsedLogs = logs.map(log => JSON.parse(log));
        
        res.json({
            total: parsedLogs.length,
            operations: parsedLogs
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving logs', error: error.message });
    }
};


const clearOperationsLog = async (req, res) => {
    if (!redisClient) {
        return res.status(500).json({ message: 'Logger not initialized' });
    }

    try {
        const logKey = 'student:operations:log';
        await redisClient.del(logKey);
        res.json({ message: 'Logs cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing logs', error: error.message });
    }
};

module.exports = {
    operationLogger,
    initializeLogger,
    getOperationsLog,
    clearOperationsLog
};
