const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Job = require('./models/Job');
const Notification = require('./models/Notification');
const Complaint = require('./models/Complaint');
const Scheme = require('./models/Scheme');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: true, credentials: true })); // Allow all origins for dev/demo purposes

// Serve Static Frontend Files (Same Port)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'Nyaya Saathi Backend is Running', port: process.env.PORT || 5001 }));

// Dashboard Stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB disconnected');
        
        const counts = {
            clients: await User.countDocuments({ role: 'client' }),
            employees: await User.countDocuments({ role: { $in: ['employee', 'worker'] } }),
            jobs: await Job.countDocuments(),
            complaints: await Complaint.countDocuments(),
            resolvedComplaints: await Complaint.countDocuments({ status: 'Resolved' })
        };
        
        res.status(200).json({ 
            realTime: true,
            ...counts 
        });
    } catch (error) {
        // Mock fallback if DB is not reachable for the demo
        res.status(200).json({
            realTime: false,
            clients: 1240, 
            employees: 45, 
            jobs: 12, 
            complaints: 84, 
            resolvedComplaints: 22
        });
    }
});

// Demo Secret key for development
const JWT_SECRET = process.env.JWT_SECRET || 'nyaya-saathi-secret-key';

const MongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/nyaya-saathi';

mongoose.connect(MongoURI, {
  serverSelectionTimeoutMS: 5000 // Fast fail if DB is unreachable
})
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => {
    console.error('❌ MongoDB Connection ERROR:', err.message);
    console.error('Make sure your IP is whitelisted on MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/');
  });


// Standard login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User account does not exist. Please sign up first!' });
        }

        // Optional: Check password if it exists (for demo, we allow simple check)
        if (password && user.password && user.password !== password) {
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }

        if (!user.isApproved) {
            return res.status(403).json({ error: 'Your account is pending administrator approval. Please wait for the admin to grant permission.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        
        res.status(200).json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('🛑 Auth Login Error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});
 
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({
            name,
            email,
            password, // In a real app, hash this! For demo, we store as requested.
            role: role || 'client',
            isApproved: (role !== 'employee'), // Employees need admin approval
            picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role, email: newUser.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        
        res.status(201).json({ 
            token, 
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                picture: newUser.picture,
                role: newUser.role,
                isApproved: newUser.isApproved
            }
        });
    } catch (error) {
        console.error('🛑 Auth Signup Error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

// Real-time user fetching endpoint for Admin
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-googleId').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.warn('⚠️ Fetching users (Mock fallback triggered):', error.message);
        res.status(200).json([
            { _id: 'm1', name: 'Saathi Admin', email: 'admin@nyayasaathi.in', role: 'admin', picture: 'https://ui-avatars.com/api/?name=Admin' },
            { _id: 'm2', name: 'Saathi Employee', email: 'employee@nyayasaathi.in', role: 'employee', picture: 'https://ui-avatars.com/api/?name=Employee' },
            { _id: 'm3', name: 'Saathi Client', email: 'client@nyayasaathi.in', role: 'client', picture: 'https://ui-avatars.com/api/?name=Client' }
        ]);
    }
});

// Admin: Approve user (employee)
app.patch('/api/users/:id/approve', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const user = await (mongoose.model('User').findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }));
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.status(200).json(user);
        } else {
            res.status(501).json({ error: 'Not available in mock mode' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Approval failed' });
    }
});

// Job management endpoints
let mockJobs = [];

let mockNotifications = [
    { _id: 'n1', recipient: '707f1f77bcf86cd799439012', message: 'Welcome to Nyaya Saathi Employee Portal.', type: 'info', createdAt: new Date(Date.now() - 3600000) }
];

let mockComplaints = [
    { _id: 'c1', trackId: 'REF-DEMO-1234', user: { name: 'Ritesh Kumar' }, subject: 'Land Dispute Issue', description: 'Sample issue', status: 'Pending', createdAt: new Date() },
    { _id: 'c2', trackId: 'REF-DEMO-5678', user: { name: 'Sneha Gupta' }, subject: 'Awas Yojana Eligibility', description: 'Sample issue', status: 'In Process', createdAt: new Date() }
];

// Schemes APIs
app.get('/api/schemes', async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        res.json(schemes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schemes' });
    }
});

app.post('/api/schemes', async (req, res) => {
    try {
        const { title, description, eligibility, photo, postedBy } = req.body;
        const newScheme = new Scheme({ title, description, eligibility, photo, postedBy });
        await newScheme.save();
        console.log(`✅ New Scheme Posted: ${title}`);
        res.status(201).json(newScheme);
    } catch (err) {
        console.error('❌ Scheme Post Error:', err.message);
        res.status(400).json({ error: 'Failed to post scheme: ' + err.message });
    }
});

app.delete('/api/schemes/:id', async (req, res) => {
    try {
        await Scheme.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Deletion failed' });
    }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
    try {
        const { userId } = req.query;
        let dbNotifs = [];
        
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
            dbNotifs = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
        }
        
        const mockFiltered = mockNotifications.filter(n => {
            const recipientId = n.recipient?._id || n.recipient;
            return String(recipientId) === String(userId);
        });

        // Combine and sort by createdAt
        const combined = [...dbNotifs, ...mockFiltered].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        res.status(200).json(combined);
    } catch (error) {
        console.error('Notification fetch error', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.delete('/api/notifications', async (req, res) => {
    const { userId } = req.query;
    try {
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
            await Notification.deleteMany({ recipient: userId });
        }
        mockNotifications = mockNotifications.filter(n => {
            const recipientId = n.recipient?._id || n.recipient;
            return String(recipientId) !== String(userId);
        });
        res.status(200).json({ message: 'All notifications cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

app.delete('/api/notifications/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        mockNotifications = mockNotifications.filter(n => n._id !== req.params.id);
        res.status(200).json({ message: 'Deleted (Mock)' });
    }
});

// Complaints endpoints
app.post('/api/complaints', async (req, res) => {
    try {
        const { subject, description, userId, photo } = req.body;
        const trackId = 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            // Force mock fallback if the user is a demo static user without a valid Mongo ID
            throw new Error('Mock Fallback');
        }
        
        const newComplaint = new Complaint({
            user: userId,
            subject,
            description,
            photo,
            trackId
        });
        await newComplaint.save();
        res.status(201).json({ message: 'Complaint registered', trackId, complaint: newComplaint });
    } catch (error) {
        if (mongoose.connection.readyState === 1 && error.message !== 'DB not connected' && error.message !== 'Mock Fallback') {
            console.error('Database Error in POST /api/complaints:', error);
            return res.status(500).json({ error: 'Failed to save complaint: ' + error.message });
        }
        
        console.warn('⚠️ Mock POST activated for complaints:', error.message);
        const trackId = 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const { subject, description, userId, photo } = req.body;
        const newComplaint = {
            _id: 'mock-comp-' + Date.now(),
            trackId,
            user: { _id: userId, name: 'Demo User' },
            subject,
            description,
            photo,
            status: 'Pending',
            createdAt: new Date()
        };
        mockComplaints.unshift(newComplaint);
        res.status(201).json({ message: 'Complaint registered (Mock)', trackId, complaint: newComplaint });
    }
});

app.get('/api/complaints', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        const complaints = await Complaint.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (error) {
        res.status(200).json(mockComplaints);
    }
});

// Get single complaint by tracking ID
app.get('/api/complaints', async (req, res) => {
    try {
        let dbComplaints = [];
        if (mongoose.connection.readyState === 1) {
            dbComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(50);
        }
        const combined = [...dbComplaints, ...mockComplaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json(combined);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

app.get('/api/complaints/track/:trackId', async (req, res) => {
    try {
        const { trackId } = req.params;
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        
        const complaint = await Complaint.findOne({ trackId }).populate('user', 'name email');
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
        
        res.status(200).json(complaint);
    } catch (error) {
        console.warn('⚠️ Tracking (Mock fallback triggered):', error.message);
        const complaint = mockComplaints.find(c => c.trackId === req.params.trackId);
        if (!complaint) return res.status(404).json({ error: 'Tracking ID not found' });
        res.status(200).json(complaint);
    }
});

// Update complaint status (Employee/Admin)
app.patch('/api/complaints/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
        
        // Notify the user who filed the complaint
        try {
            const notif = new Notification({
                recipient: complaint.user,
                message: `Your complaint (${complaint.trackId}) status has been updated to ${status}.`,
                type: 'info'
            });
            await notif.save();
        } catch (nErr) { console.error('Notification error:', nErr); }
        
        res.status(200).json({ message: 'Status updated', complaint });
    } catch (error) {
        console.warn('⚠️ Mock Status Update for complaint:', error.message);
        const { status } = req.body;
        const complaint = mockComplaints.find(c => c._id === req.params.id);
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
        
        complaint.status = status;
        
        // Mock notification
        mockNotifications.push({
            _id: 'mock-notif-' + Date.now(),
            recipient: complaint.user._id || complaint.user,
            message: `Your complaint (${complaint.trackId}) status has been updated to ${status}. (Mock)`,
            type: 'info',
            createdAt: new Date()
        });
        
        res.status(200).json({ message: 'Status updated (Mock)', complaint });
    }
});

app.delete('/api/jobs/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

app.post('/api/jobs', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        const { title, location, pay, type, targetRole, description, postedBy, limit } = req.body;
        const newJob = new Job({ title, location, pay, type, targetRole, description, postedBy, limit });
        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully!', job: newJob });
    } catch (error) {
        // If it's a cast error, it means we are likely using a mock/dummy ID for postedBy
        const isCastError = error.name === 'CastError' || error.message.includes('Cast to ObjectId failed');

        if (mongoose.connection.readyState === 1 && !isCastError) {
            console.error('Database Error in POST /api/jobs:', error);
            return res.status(500).json({ error: 'Failed to post job to database', details: error.message });
        }
        
        console.warn('⚠️ Mock POST activated (either DB down or demo ID used):', error.message);
        const { title, location, pay, type, targetRole, description, postedBy, limit } = req.body;
        const newJob = { 
            _id: 'mock-' + Date.now(), 
            title, location, pay, type, targetRole, description, limit,
            postedBy: { _id: postedBy, name: 'Saathi Demo User' }, // mock populate
            applicants: [], 
            createdAt: new Date() 
        };
        mockJobs.unshift(newJob);
        res.status(201).json({ message: 'Job posted successfully (Mock Mode)!', job: newJob });
    }
});

app.get('/api/jobs/my', async (req, res) => {
    const { userId } = req.query;
    try {
        if (mongoose.connection.readyState !== 1 || !mongoose.Types.ObjectId.isValid(userId)) {
             return res.status(200).json([]);
        }
        const jobs = await Job.find({ postedBy: userId }).populate('applicants.user', 'name email picture role').sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your jobs' });
    }
});

app.get('/api/jobs', async (req, res) => {
    const { role } = req.query; 
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        const query = role && role !== 'All' ? { targetRole: role } : {};
        const jobs = await Job.find(query)
            .populate({ path: 'applicants.user', select: 'name email picture role' })
            .populate({ path: 'postedBy', select: 'name email' })
            .sort({ createdAt: -1 });
        
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Fetching jobs error:', error.message);
        res.status(200).json([]);
    }
});

// Job application (First-come-first-served)
app.post('/api/jobs/:id/apply', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        const { userId, phone } = req.body;
        console.log('📝 Application Body:', { userId, phone, jobId: req.params.id });
        
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Valid User ID is required to apply' });
        }

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required to apply' });
        }

        const job = await Job.findById(req.params.id);
        
        if (!job) return res.status(404).json({ error: 'Job not found' });
        
        // Check if approved limit is reached
        const approvedCount = job.applicants.filter(a => a.status === 'approved').length;
        if (approvedCount >= job.limit) {
            return res.status(400).json({ error: 'Sorry, this job vacancy is already full (all slots approved)!' });
        }
        
        // Already applied?
        const alreadyApplied = job.applicants.some(a => {
            if (!a || !a.user) return false;
            const appId = a.user._id || a.user || a;
            return appId.toString() === userId.toString();
        });
        if (alreadyApplied) {
            return res.status(400).json({ error: 'You have already applied for this job!' });
        }

        job.applicants.push({ user: userId, phone, status: 'pending' });
        await job.save();
        
        // Notify employee
        try {
            if (job.postedBy && mongoose.Types.ObjectId.isValid(job.postedBy._id || job.postedBy)) {
                 const notif = new Notification({
                    recipient: job.postedBy._id || job.postedBy,
                    message: `New application for "${job.title}"`,
                    type: 'job_application',
                    meta: { jobId: job._id.toString(), applicantId: userId }
                });
                await notif.save();
            }
        } catch (err) { console.error('Notification save error', err); }
        
        res.status(200).json({ message: 'Applied! Waiting for employee approval.', job });
    } catch (error) {
        console.warn('⚠️ Job application (Unified mode):', error.message);
        const { userId, phone } = req.body;
        
        // Find job in either database or mockJobs
        let job = mockJobs.find(j => j._id === req.params.id);
        if (!job && mongoose.connection.readyState === 1) {
            try {
               job = await Job.findById(req.params.id);
            } catch(e) {}
        }
        
        if (!job) return res.status(404).json({ error: 'Job not found' });
        
        const approvedCount = job.applicants?.filter(a => a.status === 'approved').length || 0;
        if (approvedCount >= job.limit) return res.status(400).json({ error: 'Sorry, this job vacancy is already full!' });
        
        const alreadyApplied = job.applicants?.some(a => {
            const bidderId = a.user?._id || a.user || a._id || a;
            return String(bidderId) === String(userId);
        });
        if (alreadyApplied) return res.status(400).json({ error: 'You have already applied' });
        
        const applicantObj = { 
            user: { _id: userId, name: 'Demo Client', email: 'demo@nyayasaathi.in', role: 'client', picture: 'https://ui-avatars.com/api/?name=Demo Client&background=random' }, 
            phone: phone || '9999999999', 
            status: 'pending', 
            appliedAt: new Date() 
        };

        if (job.save) {
            job.applicants.push(applicantObj);
            await job.save();
        } else {
            job.applicants.push(applicantObj);
        }
        
        const recipient = job.postedBy?._id || job.postedBy;
        mockNotifications.push({
            _id: 'mock-notif-' + Date.now(),
            recipient: String(recipient),
            message: `New application for "${job.title}" by Demo Client.`,
            type: 'job_application',
            meta: { jobId: job._id.toString(), applicantId: userId },
            createdAt: new Date()
        });

        res.status(200).json({ message: 'Applied successfully (Unified Mode)!', job });
    }
});

// Approve/Reject applicant (Employee only)
app.patch('/api/jobs/:id/applicants/:userId/status', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        const { status } = req.body; // 'approved' or 'rejected'
        const job = await Job.findById(req.params.id);
        
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const applicant = job.applicants.find(a => {
            if (!a) return false;
            const appId = a.user || a._id || a;
            return appId.toString() === req.params.userId;
        });
        if (!applicant) return res.status(404).json({ error: 'Applicant not found' });

        // If approving, check limit again
        if (status === 'approved') {
            const approvedCount = job.applicants.filter(a => a.status === 'approved').length;
            if (approvedCount >= job.limit) {
                return res.status(400).json({ error: 'Cannot approve more. Limit reached!' });
            }
        }

        applicant.status = status;
        await job.save();
        
        // Notify applicant
        try {
            const notif = new Notification({
                recipient: applicant.user._id || applicant.user,
                message: `Your application for "${job.title}" has been ${status}.`,
                type: 'info'
            });
            await notif.save();
        } catch (err) { console.error('Notification applicant save error', err); }
        
        res.status(200).json({ message: `Applicant ${status} successfully!`, job });
    } catch (error) {
        if (mongoose.connection.readyState === 1) {
            console.error('Database Error in status update:', error);
            return res.status(500).json({ error: 'Failed to update status in database' });
        }
        console.warn('⚠️ Mock Status Update:', error.message);
        const { status } = req.body;
        const job = mockJobs.find(j => j._id === req.params.id);
        if(!job) return res.status(404).json({ error: 'Job not found' });
        
        const applicant = job.applicants.find(a => (a.user._id || a.user) === req.params.userId);
        if(!applicant) return res.status(404).json({ error: 'Applicant not found' });
        
        if (status === 'approved') {
            const approvedCount = job.applicants.filter(a => a.status === 'approved').length;
            if (approvedCount >= job.limit) return res.status(400).json({ error: 'Cannot approve more. Limit reached!' });
        }
        
        applicant.status = status;

        mockNotifications.push({
            _id: 'mock-notif-' + Date.now(),
            recipient: applicant.user._id || applicant.user,
            message: `Your application for "${job.title}" has been ${status}.`,
            type: 'info',
            createdAt: new Date()
        });

        res.status(200).json({ message: `Applicant ${status} successfully!`, job });
    }
});

// Delete job posting
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const job = await Job.findByIdAndDelete(req.params.id);
            if (!job) {
                // If it's a mock jobId, try deleting from mockJobs
                const index = mockJobs.findIndex(j => j._id === req.params.id);
                if (index !== -1) {
                    mockJobs.splice(index, 1);
                    return res.status(200).json({ message: 'Job deleted successfully (Mock)!' });
                }
                return res.status(404).json({ error: 'Job not found in database or mock storage' });
            }
            res.status(200).json({ message: 'Job deleted successfully!' });
        } else {
            const index = mockJobs.findIndex(j => j._id === req.params.id);
            if (index !== -1) {
                mockJobs.splice(index, 1);
                res.status(200).json({ message: 'Job deleted successfully (Mock)!' });
            } else {
                res.status(404).json({ error: 'Job not found in mock storage' });
            }
        }
    } catch (error) {
        console.error('Job deletion error', error);
        res.status(500).json({ error: 'Failed to delete job', details: error.message });
    }
});

app.get('/api/stats', async (req, res) => {
    const { userId } = req.query;
    try {
        let complaints = 0;
        let tasks = 0;
        
        if (mongoose.connection.readyState === 1 && (mongoose.Types.ObjectId.isValid(userId) || typeof userId === 'string')) {
            complaints = await (mongoose.model('Complaint').countDocuments({ user: userId }));
            tasks = await (mongoose.model('Job').countDocuments({ 'applicants.user': userId, 'applicants.status': 'approved' }));
        } else {
            complaints = 2;
            tasks = 5;
        }

        res.status(200).json({ 
            activeComplaints: complaints || 2, 
            newSchemes: 15, 
            pendingTasks: tasks || 5 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Catch-all to serve Frontend index.html for SPA support (Express 5 compatible)
app.use((req, res) => {
    // Only serve index.html for non-API routes
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found', path: req.path });
    }

    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // More descriptive error during development if dist is missing
        res.status(404).json({ 
            error: 'Frontend not found', 
            details: 'The frontend build (dist folder) is missing. If you are in development, please access via port 5000 (Vite). If in production, run npm run build in the frontend directory.',
            path: req.path
        });
    }
});

// Explicit Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('🛑 GLOBAL SERVER ERROR:', err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        details: err.message,
        path: req.path
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
