const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Replace the following with your own MongoDB Atlas connection string
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority';
console.log(process.env.MONGO_URI);
// Connect to MongoDB Atlas
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const Schema = mongoose.Schema;

const CheckInResponseSchema = new Schema({
  date: { type: String }, // Stored as YYYY-MM-DD
  response: { type: Map, of: String },
  status: { type: String }
}, { _id: false });

const DischargeDetailsSchema = new Schema({
  dischargeDate: { type: String },
  diagnosis: { type: String },
  dischargeSummary: { type: String },
  medications: [{
    name: { type: String },
    dosage: { type: String },
    frequency: { type: String }
  }],
  activityRestrictions: { type: String },
  dietRecommendations: { type: String },
  redFlagSymptoms: { type: String },
  nextFollowupDue: { type: String },
  contactForEmergency: { type: String },
  dischargeInstructions: { type: String },
  checkInTemplate: {
    questions: [{ type: String }]
  },
  checkInInstances: [{ type: String }],
  expectedCheckIns: { type: Number }
}, { _id: false });

const PatientSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, required: true },
  admissionReason: { type: String, required: true },
  dischargeDetails: DischargeDetailsSchema,
  checkIns: [CheckInResponseSchema]
});

const APatient = mongoose.model('apatient', PatientSchema);

// REST Endpoints

// GET all patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await APatient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET a single patient by id
app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await APatient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST a new patient
app.post('/api/patients', async (req, res) => {
  try {
    const newPatient = new APatient(req.body);
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update an existing patient (e.g., updating discharge details, check-ins, etc.)
app.put('/api/patients/:id', async (req, res) => {
  try {
    const updatedPatient = await APatient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(updatedPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
