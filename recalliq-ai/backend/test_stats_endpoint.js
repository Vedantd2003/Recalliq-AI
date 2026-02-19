import { getStats } from './controllers/meetingController.js';
import mongoose from 'mongoose';
import { connect } from 'mongoose';

// Mock request and response objects
const req = {
    user: {
        id: '507f1f77bcf86cd799439011' // Valid dummy ObjectId
    }
};

const res = {
    status: (code) => {
        console.log(`Status: ${code}`);
        return res;
    },
    json: (data) => {
        console.log('Response:', JSON.stringify(data, null, 2));
        return res;
    }
};

const next = (err) => {
    console.error('Error passed to next:', err);
};

// Mock Models to avoid DB connection for unit test of logic flow
// OR connect to DB if integration test. let's try integration with local DB
// Integration approach:

const run = async () => {
    try {
        await connect('mongodb://127.0.0.1:27017/recalliq');
        console.log('Connected to DB');

        await getStats(req, res, next);

        console.log('Test finished');
        process.exit(0);
    } catch (error) {
        console.error('Test failed', error);
        process.exit(1);
    }
};

run();
