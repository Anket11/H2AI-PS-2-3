const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  response: { type: Map, of: String },
  status: { type: String, enum: ['pending', 'completed'], required: true }
});

const DischargeDetailSchema = new mongoose.Schema({
  discharge_id: { type: String, required: true },
  dischargeDate: Date,
  diagnosis: String,
  dischargeSummary: String,
  medications: [{ name: String, dosage: String, frequency: String }],
  activityRestrictions: String,
  dietRecommendations: String,
  redFlagSymptoms: String,
  nextFollowupDue: String,
  contactForEmergency: String,
  dischargeInstructions: String,
  checkInInstances: [String],
  expectedCheckIns: Number,
  checkIns: [CheckInSchema],
  checkInTemplate: {
    questions: [String]
  }
});

const PatientSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  status: String,
  admissionReason: String,
  dischargeDetails: [DischargeDetailSchema],
  // Optionally you can also store top-level checkIns here if needed
  checkIns: [CheckInSchema]
});

module.exports = mongoose.model('Patient', PatientSchema);
