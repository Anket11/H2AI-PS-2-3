
const express = require('express');
const mongoose = require('mongoose');

const Patient = require('./models/Patient');

const app = express();

// Enable CORS to allow requests from your frontend


// Parse JSON request bodies
app.use(express.json());

// Connect to local MongoDB (or use MONGO_URI from your .env file)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/patientManagement', {
  
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

/**
 * GET /api/patients/:id
 * Retrieve patient details by patient id.
 */
app.get('/api/patients/:id', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/patients/:patientId/discharge/:dischargeId/checkin/:checkInIndex
 * Update a pending check-in for a patient's discharge detail.
 * Expects a JSON body with a "response" object.
 */
app.put('/api/patients/:patientId/discharge/:dischargeId/checkin/:checkInIndex', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const dischargeId = req.params.dischargeId;
    const checkInIndex = parseInt(req.params.checkInIndex);
    const { response } = req.body; // For example: { "Medication taken?": "Yes", "Symptoms": "Mild", "How are you feeling?": "Good" }

    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find the matching discharge detail by discharge_id
    const dischargeDetail = patient.dischargeDetails.find(d => d.discharge_id === dischargeId);
    if (!dischargeDetail) {
      return res.status(404).json({ message: 'Discharge detail not found' });
    }

    if (!dischargeDetail.checkIns || dischargeDetail.checkIns.length <= checkInIndex) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    // Update the check-in response and mark it as completed
    dischargeDetail.checkIns[checkInIndex].response = response;
    dischargeDetail.checkIns[checkInIndex].status = 'completed';

    await patient.save();
    res.json({ message: 'Check-in updated successfully', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
