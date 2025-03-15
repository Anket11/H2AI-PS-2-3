const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();
const axios = require('axios');

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


// AI Helper Endpoint for our discharge form use case.
app.post('/api/ai-helper', async (req, res) => {
  const { dischargeDate, diagnosis, dischargeSummary, medications, checkInTemplate, checkInInstances } = req.body;
  
  // Validate required fields.
  if (!dischargeDate || !diagnosis || !dischargeSummary || !medications) {
    return res.status(400).json({ error: 'Missing required discharge details.' });
  }
  const today = new Date().toISOString().split('T')[0];
console.log(today);
  // Build the prompt for ChatGPT.
  const prompt = `
You are an AI assistant helping a nurse complete a patient discharge form. The following details have been provided by the nurse:

- Discharge Date: ${dischargeDate}
- Diagnosis: ${diagnosis}
- Discharge Summary: ${dischargeSummary}
- Medications: ${JSON.stringify(medications)}
- Current Check-In Template Questions: ${JSON.stringify(checkInTemplate.questions)}
- Current Check-In Instance Dates (if any): ${JSON.stringify(checkInInstances)}

Important guidelines:
1. Make nurse's life easier by answering all the questions in the form as accurately and helful for the patient as possible.
2. The nurse would like to collect additional relevant questions that are commonly needed for the patient’s condition (e.g. pain level, wound care, symptoms monitoring, or any condition-specific concerns). Please add more nurse questions that would be beneficial for follow-up, based on the diagnosis and discharge summary.
3. You must ensure that all suggested check-in dates are strictly after the patient’s provided discharge date.
4. The final output should be in strict JSON format with no extra commentary, exactly like this:

{
  "activityRestrictions": "",
  "dietRecommendations": "",
  "redFlagSymptoms": "",
  "nextFollowupDue": "",
  "dischargeInstructions": "",
  "checkInTemplate": { "questions": [] },
  "checkInInstances": [],
  "expectedCheckIns": 0
}

Definitions of each field to fill:
- "activityRestrictions": A short recommendation on patient movement and physical activity.
- "dietRecommendations": Guidance on dietary requirements, foods to avoid, or best eating practices.
- "redFlagSymptoms": Critical symptoms that necessitate immediate medical attention.
- "nextFollowupDue": A suggested date or timeframe for the next formal appointment/visit.
- "dischargeInstructions": Broader instructions for care at home (e.g. wound care, rest, etc.).
- "checkInTemplate": An object containing "questions" — an array of updated or additional questions the nurse should ask the patient during follow-up. Incorporate the nurse’s original questions (e.g. “Medication taken?”, “Symptoms?”, “How are you feeling?”) plus any additional questions recommended for this diagnosis and condition.
- "checkInInstances": An array of date strings for follow-up checks, each strictly after the provided discharge date.
- "expectedCheckIns": The total number of check-ins (the length of "checkInInstances").

Provide only the JSON object described above. Do not include any additional commentary, disclaimers, or text outside the JSON object.
`;

  console.log(process.env.OPENAI_API_KEY)
  try {
    // Call OpenAI's ChatGPT API.
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    // Extract the text from the response.
    const aiResponseText = response.data.choices[0].message.content.trim();
    
    // Attempt to extract the JSON object from the response.
    const jsonStart = aiResponseText.indexOf('{');
    const jsonEnd = aiResponseText.lastIndexOf('}') + 1;
    const jsonResponse = aiResponseText.substring(jsonStart, jsonEnd);
    const analysis = JSON.parse(jsonResponse);
    
    console.log("AI Analysis results:", analysis);
    res.json(analysis);
  } catch (error) {
    console.error("Error calling ChatGPT API:", error.response ? error.response.data : error.message);
    // Optionally, send back a fallback dummy response:
    const fallbackResponse = {
      activityRestrictions: "Avoid strenuous activity for 2 weeks.",
      dietRecommendations: "Maintain a light, balanced diet.",
      redFlagSymptoms: "Seek help if fever >101°F or pain worsens.",
      nextFollowupDue: "2025-03-10",
      dischargeInstructions: "Keep the incision clean and dry; change dressing daily.",
      checkInTemplate: { questions: checkInTemplate.questions },
      checkInInstances: checkInInstances,
      expectedCheckIns: checkInInstances.length
    };
    res.json(fallbackResponse);
  }
});

  
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
