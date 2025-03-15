// Dummy data based on the provided schema
const userData = {
    patient_id: "P12345",
    first_name: "John",
    last_name: "Doe",
    date_of_birth: "1985-05-15",
    contact_info: {
        phone: "202-555-1234",
        email: "john.doe@example.com",
        address: "123 Main St, Washington, DC"
    },
    insurance_id: "INS001",
    preferred_communication_channel: "SMS",
    mobility_issues_flag: false,
    social_determinants_info: "No transportation issues"
};

const insuranceData = {
    insurance_id: "INS001",
    policy_number: "POL987654321",
    provider_name: "Blue Cross Blue Shield",
    coverage_details: {
        copay: "$20",
        deductible: "$500",
        coverage_level: "Gold"
    },
    valid_through: "2025-12-31",
    status: "active" // active or inactive
};

const providersData = [
    {
        provider_id: "DR001",
        name: "Dr. Emily Hoang",
        specialty: "Primary Care",
        contact_info: {
            office_phone: "202-555-6789",
            email: "emily.hoang@clinic.com"
        },
        schedule_configuration: {
            days: ["Monday", "Wednesday", "Friday"],
            locations: ["Washington DC Clinic"],
            telehealth: true
        }
    },
    {
        provider_id: "DR002",
        name: "Dr. Michael Chen",
        specialty: "Primary Care",
        contact_info: {
            office_phone: "202-555-7890",
            email: "michael.chen@clinic.com"
        },
        schedule_configuration: {
            days: ["Tuesday", "Thursday"],
            locations: ["Washington DC Clinic"],
            telehealth: true
        }
    }
];

const upcomingAppointments = [
    {
        appointment_id: "APT001",
        patient_id: "P12345",
        provider_id: "DR001",
        scheduled_dt: "2025-03-20T10:30:00",
        appointment_type: "in-person",
        status: "scheduled",
        reason_for_visit: "Annual check-up",
        location: "Washington DC Clinic, Room 302"
    }
];

// Form options data
const formOptions = {
    reasonForVisit: [
        { value: "", text: "Select a reason" },
        { value: "illness", text: "Illness or Injury" },
        { value: "followup", text: "Follow-up Visit" },
        { value: "wellness", text: "Annual Wellness Exam" },
        { value: "consultation", text: "Consultation" }
    ],
    symptomDuration: [
        { value: "lessThan24", text: "Less than 24 hours" },
        { value: "1to3days", text: "1-3 days" },
        { value: "3to7days", text: "3-7 days" },
        { value: "1to2weeks", text: "1-2 weeks" },
        { value: "moreThan2weeks", text: "More than 2 weeks" }
    ],
    severity: [
        { value: "mild", text: "Mild" },
        { value: "moderate", text: "Moderate" },
        { value: "severe", text: "Severe" }
    ],
    visitType: [
        { value: "inperson", text: "In-Person" },
        { value: "virtual", text: "Virtual (Telehealth)" }
    ],
    mobilityOptions: [
        { value: "yes", text: "Yes" },
        { value: "no", text: "No" }
    ],
    priorityBooking: [
        { value: "yes", text: "Yes (additional fee may apply)" },
        { value: "no", text: "No" }
    ]
};

// Available time slots will be generated based on selected date
const generateTimeSlots = (date) => {
    // Logic to generate available time slots
    // In a real app, this would come from an API call
    
    // For demo purposes, return fixed slots
    return [
        { id: "slot1", time: "09:00", formatted: "9:00 AM", available: true },
        { id: "slot2", time: "10:00", formatted: "10:00 AM", available: true },
        { id: "slot3", time: "11:00", formatted: "11:00 AM", available: false },
        { id: "slot4", time: "13:30", formatted: "1:30 PM", available: true },
        { id: "slot5", time: "14:30", formatted: "2:30 PM", available: true },
        { id: "slot6", time: "15:30", formatted: "3:30 PM", available: true }
    ];
};

// Simulated triage rules
const triageRules = {
    // Based on symptoms, severity, and duration, recommend visit type and urgency
    determineVisitType: (symptoms, severity, duration) => {
        const symptomsLower = symptoms.toLowerCase();
        
        // Emergency symptoms that require immediate attention
        const emergencySymptoms = [
            'chest pain', 'difficulty breathing', 'severe pain',
            'head injury', 'stroke', 'heart attack', 'unconscious'
        ];
        
        // Symptoms that typically require in-person assessment
        const inPersonSymptoms = [
            'fever', 'cough', 'shortness of breath', 'pain',
            'rash', 'swelling', 'injury', 'wound', 'bleeding',
            'ear pain', 'stomach pain', 'joint pain'
        ];
        
        // Symptoms suitable for virtual visits
        const virtualSymptoms = [
            'headache', 'sore throat', 'runny nose', 'allergies',
            'minor cold', 'follow up', 'medication refill', 'anxiety',
            'depression', 'insomnia', 'consultation'
        ];

        // Check for emergency symptoms first
        if (emergencySymptoms.some(symptom => symptomsLower.includes(symptom)) || 
            severity === "severe") {
            return {
                type: "emergency",
                urgency: "immediate",
                message: "Based on your symptoms, please seek immediate emergency care or call 911."
            };
        }

        // For moderate severity with concerning duration
        if (severity === "moderate" && 
            (duration === "moreThan2weeks" || duration === "1to2weeks")) {
            return {
                type: "inperson",
                urgency: "urgent",
                message: "Based on your symptoms and their duration, we recommend an urgent in-person visit."
            };
        }

        // Check for symptoms requiring in-person visit
        if (inPersonSymptoms.some(symptom => symptomsLower.includes(symptom))) {
            return {
                type: "inperson",
                urgency: "standard",
                message: "Based on your symptoms, we recommend an in-person visit for proper evaluation."
            };
        }

        // Check for virtual-suitable symptoms
        if (virtualSymptoms.some(symptom => symptomsLower.includes(symptom)) && 
            severity !== "moderate") {
            return {
                type: "virtual",
                urgency: "standard",
                message: "Your symptoms are suitable for a virtual visit, which offers convenient care from home."
            };
        }

        // Default to in-person for any unclear cases
        return {
            type: "inperson",
            urgency: "standard",
            message: "We recommend an in-person visit to better evaluate your condition."
        };
    },
    
    // Get detailed recommendation message
    getRecommendation: (result) => {
        let message = result.message;
        
        if (result.type === "emergency") {
            message += " This is not the appropriate channel for emergency care.";
        } else if (result.type === "inperson" && result.urgency === "urgent") {
            message += " We will prioritize your appointment scheduling.";
        } else if (result.type === "virtual") {
            message += " Virtual visits offer quick access to care while saving travel time.";
        }
        
        return message;
    },
    
    // Determine if priority booking is needed
    shouldPrioritizeBooking: (symptoms, severity, duration, mobilityIssues) => {
        return severity === "moderate" || 
               duration === "moreThan2weeks" || 
               mobilityIssues === "yes";
    }
};

// Verify insurance function (simulation)
const verifyInsurance = () => {
    // In a real app, this would make an API call to verify insurance
    // For demo purposes, return a promise that simulates API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (insuranceData.status === "active") {
                resolve({
                    valid: true,
                    message: "Your insurance is active and verified. You can proceed with booking."
                });
            } else {
                resolve({
                    valid: false,
                    message: "There appears to be an issue with your insurance. You may continue booking, but additional costs may apply."
                });
            }
        }, 1000); // Simulate network delay
    });
};

// Appointment booking function (simulation)
const bookAppointment = (appointmentData) => {
    // In a real app, this would make an API call to book appointment
    // For demo purposes, return a promise that simulates API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const newAppointment = {
                appointment_id: "APT" + Math.floor(Math.random() * 10000),
                patient_id: userData.patient_id,
                provider_id: appointmentData.provider_id || "DR001",
                scheduled_dt: appointmentData.date + "T" + appointmentData.time + ":00",
                appointment_type: appointmentData.type,
                status: "scheduled",
                reason_for_visit: appointmentData.reason,
                location: appointmentData.type === "inperson" ? "Washington DC Clinic, Room 302" : "Telehealth"
            };
            
            resolve(newAppointment);
        }, 1500); // Simulate network delay
    });
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user info
    const userInfoElement = document.getElementById('user-info');
    userInfoElement.innerHTML = `
        <span>Welcome, ${userData.first_name} ${userData.last_name}</span>
        <img src="https://via.placeholder.com/40" alt="Profile" class="avatar">
    `;
    
    // Initialize navigation
    const navigationElement = document.getElementById('navigation-menu');
    navigationElement.innerHTML = `
        <li><a href="#" class="active">Dashboard</a></li>
        <li><a href="#">Appointments</a></li>
        <li><a href="#">Medical Records</a></li>
        <li><a href="#">Messages</a></li>
    `;
    
    // Initialize upcoming appointments
    const appointmentListElement = document.getElementById('appointment-list');
    if (upcomingAppointments.length > 0) {
        let appointmentsHTML = '';
        upcomingAppointments.forEach(appointment => {
            const appointmentDate = new Date(appointment.scheduled_dt);
            const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const formattedTime = appointmentDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
            
            const provider = providersData.find(p => p.provider_id === appointment.provider_id);
            
            appointmentsHTML += `
                <div class="appointment-card">
                    <div class="appointment-info">
                        <p class="date">${formattedDate}</p>
                        <p class="time">${formattedTime}</p>
                        <p class="type">${appointment.appointment_type === 'inperson' ? 'In-Person Visit' : 'Virtual Visit'}</p>
                        <p class="doctor">${provider ? provider.name : 'Unknown Provider'}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn btn-secondary">Reschedule</button>
                        <button class="btn btn-outline">Cancel</button>
                    </div>
                </div>
            `;
        });
        appointmentListElement.innerHTML = appointmentsHTML;
    } else {
        appointmentListElement.innerHTML = `
            <div class="no-appointments">
                <p>You have no upcoming appointments.</p>
            </div>
        `;
    }
    
    // Initialize the modal
    const modal = document.getElementById('appointmentModal');
    const closeModal = document.querySelector('.close-modal');
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');
    
    bookAppointmentBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        initializeFormStep1();
    });
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Initialize navigation between steps
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.closest('.modal-step-content').id.replace('step', ''));
            const nextStep = currentStep + 1;
            
            // Process current step data before moving to next
            if (currentStep === 1) {
                processStep1Data();
            } else if (currentStep === 2) {
                processStep2Data();
            } else if (currentStep === 3) {
                processStep3Data();
            }
            
            // Hide current step
            document.getElementById(`step${currentStep}`).style.display = 'none';
            
            // Show next step
            document.getElementById(`step${nextStep}`).style.display = 'block';
            
            // Update active step in navigation
            document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
            document.querySelector(`.step[data-step="${nextStep}"]`).classList.add('active');
            
            // Initialize the next step if needed
            if (nextStep === 2) {
                initializeFormStep2();
            } else if (nextStep === 3) {
                initializeFormStep3();
            } else if (nextStep === 4) {
                initializeFormStep4();
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.closest('.modal-step-content').id.replace('step', ''));
            const prevStep = currentStep - 1;
            
            // Hide current step
            document.getElementById(`step${currentStep}`).style.display = 'none';
            
            // Show previous step
            document.getElementById(`step${prevStep}`).style.display = 'block';
            
            // Update active step in navigation
            document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
            document.querySelector(`.step[data-step="${prevStep}"]`).classList.add('active');
        });
    });
    
    // Initialize close modal button on confirmation step
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            // Reset to first step for next time
            document.getElementById('step4').style.display = 'none';
            document.getElementById('step1').style.display = 'block';
            document.querySelector('.step[data-step="4"]').classList.remove('active');
            document.querySelector('.step[data-step="1"]').classList.add('active');
        });
    }
    
    // Function to initialize Step 1 form
    function initializeFormStep1() {
        // Populate mobility options
        const mobilityOptionsElement = document.getElementById('mobility-options');
        let mobilityHTML = '';
        formOptions.mobilityOptions.forEach(option => {
            const checked = option.value === 'no' ? 'checked' : '';
            mobilityHTML += `
                <label>
                    <input type="radio" name="mobilityIssues" value="${option.value}" ${checked}> ${option.text}
                </label>
            `;
        });
        mobilityOptionsElement.innerHTML = mobilityHTML;
        
        // Populate reason for visit dropdown
        const reasonForVisitElement = document.getElementById('reasonForVisit');
        let reasonHTML = '';
        formOptions.reasonForVisit.forEach(option => {
            reasonHTML += `<option value="${option.value}">${option.text}</option>`;
        });
        reasonForVisitElement.innerHTML = reasonHTML;
        
        // Populate symptom duration dropdown
        const symptomDurationElement = document.getElementById('symptomDuration');
        let durationHTML = '';
        formOptions.symptomDuration.forEach(option => {
            durationHTML += `<option value="${option.value}">${option.text}</option>`;
        });
        symptomDurationElement.innerHTML = durationHTML;
        
        // Populate severity options
        const severityOptionsElement = document.getElementById('severity-options');
        let severityHTML = '';
        formOptions.severity.forEach(option => {
            const checked = option.value === 'mild' ? 'checked' : '';
            severityHTML += `
                <label>
                    <input type="radio" name="severity" value="${option.value}" ${checked}> ${option.text}
                </label>
            `;
        });
        severityOptionsElement.innerHTML = severityHTML;
        
        // Populate visit type options
        // Populate visit type options
        const visitTypeOptionsElement = document.getElementById('visit-type-options');
        let visitTypeHTML = '';
        formOptions.visitType.forEach(option => {
            const checked = option.value === 'inperson' ? 'checked' : '';
            visitTypeHTML += `
                <label>
                    <input type="radio" name="visitType" value="${option.value}" ${checked}> ${option.text}
                </label>
            `;
        });
        visitTypeOptionsElement.innerHTML = visitTypeHTML;
    }
    
    // Function to initialize Step 2 form
    // Function to initialize Step 2 form
    function initializeFormStep2() {
        const insuranceInfoElement = document.getElementById('insuranceInfo');
        insuranceInfoElement.innerHTML = `
            <div class="insurance-details">
                <div class="insurance-card">
                    <div class="insurance-provider">${insuranceData.provider_name}</div>
                    <div class="insurance-info-row">
                        <span>Policy Number:</span>
                        <span>${insuranceData.policy_number}</span>
                    </div>
                    <div class="insurance-info-row">
                        <span>Coverage Level:</span>
                        <span>${insuranceData.coverage_details.coverage_level}</span>
                    </div>
                    <div class="insurance-info-row">
                        <span>Copay:</span>
                        <span>${insuranceData.coverage_details.copay}</span>
                    </div>
                    <div class="insurance-info-row">
                        <span>Deductible:</span>
                        <span>${insuranceData.coverage_details.deductible}</span>
                    </div>
                    <div class="insurance-info-row">
                        <span>Valid Through:</span>
                        <span>${insuranceData.valid_through}</span>
                    </div>
                </div>
                <div class="verification-status">
                    <p>Verifying insurance status...</p>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary prev-step">Back</button>
                <button type="button" id="continueToScheduleBtn" class="btn btn-primary next-step">Continue to Schedule</button>
            </div>
        `;
        
        // Run the insurance verification process
        verifyInsurance().then(result => {
            const verificationStatusElement = document.querySelector('.verification-status');
            verificationStatusElement.innerHTML = `
                <p class="verification-message ${result.valid ? 'verification-success' : 'verification-warning'}">
                    ${result.message}
                </p>
            `;
        });
        
        // Attach event listener to the newly added button
        document.getElementById('continueToScheduleBtn').addEventListener('click', function() {
            // Process step 2 data if needed
            processStep2Data();
            
            // Transition from Step 2 to Step 3
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step3').style.display = 'block';
            
            // Update navigation steps
            document.querySelector(`.step[data-step="2"]`).classList.remove('active');
            document.querySelector(`.step[data-step="3"]`).classList.add('active');
            
            // Initialize Step 3 form
            initializeFormStep3();
        });
    }
    

// Updated verification function to be more reliable
const verifyInsurance = () => {
    // In a real app, this would make an API call to verify insurance
    // For demo purposes, return a promise that simulates API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (insuranceData.status === "active") {
                resolve({
                    valid: true,
                    message: "Your insurance is active and verified. You can proceed with booking."
                });
            } else {
                resolve({
                    valid: false,
                    message: "There appears to be an issue with your insurance. You may continue booking, but additional costs may apply."
                });
            }
        }, 1000); // Simulate network delay
    });
};

// Function to process step 2 data - make sure this is called
function processStep2Data() {
    // Nothing special needs to be done here, but ensure this function exists
    // and is properly called when continuing to the next step
    console.log("Insurance verification complete, proceeding to scheduling");
}
    
    // Function to initialize Step 3 form
    function initializeFormStep3() {
        // Get form data from step 1
        const formData = window.appointmentFormData || {};
        
        // Populate appointment type options with recommendation
        const appointmentTypeOptionsElement = document.getElementById('appointment-type-options');
        let appointmentTypeHTML = '';
        formOptions.visitType.forEach(option => {
            // Set the recommended option as checked
            const checked = option.value === formData.recommendedVisitType ? 'checked' : '';
            const recommendedClass = option.value === formData.recommendedVisitType ? 'recommended' : '';
            appointmentTypeHTML += `
                <label class="${recommendedClass}">
                    <input type="radio" name="appointmentType" value="${option.value}" ${checked}> 
                    ${option.text}
                    ${option.value === formData.recommendedVisitType ? ' (Recommended)' : ''}
                </label>
            `;
        });
        appointmentTypeOptionsElement.innerHTML = appointmentTypeHTML;
        
        // Show recommendation based on triage
        const recommendationElement = document.getElementById('appointmentTypeRecommendation');
        if (formData.recommendationMessage) {
            recommendationElement.innerHTML = `
                <div class="recommendation-box ${formData.recommendedUrgency}">
                    <p>${formData.recommendationMessage}</p>
                    ${formData.needsPriorityBooking ? '<p class="priority-note">Based on your responses, we recommend priority booking.</p>' : ''}
                </div>
            `;
        }
        
        // Auto-select priority booking if needed
        const priorityBookingOptionsElement = document.getElementById('priority-booking-options');
        let priorityHTML = '';
        formOptions.priorityBooking.forEach(option => {
            const checked = (option.value === 'yes' && formData.needsPriorityBooking) || 
                          (option.value === 'no' && !formData.needsPriorityBooking) ? 'checked' : '';
            priorityHTML += `
                <label>
                    <input type="radio" name="priorityBooking" value="${option.value}" ${checked}> ${option.text}
                </label>
            `;
        });
        priorityBookingOptionsElement.innerHTML = priorityHTML;
        
        // Set min date for appointment date picker (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedTomorrow = tomorrow.toISOString().split('T')[0];
        document.getElementById('appointmentDate').min = formattedTomorrow;
        
        // Set default date (tomorrow for urgent cases, next available for others)
        if (formData.recommendedUrgency === 'urgent') {
            document.getElementById('appointmentDate').value = formattedTomorrow;
        } else {
            // In a real app, this would come from the backend
            // For demo, set to tomorrow + 1 for non-urgent cases
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 2);
            document.getElementById('appointmentDate').value = defaultDate.toISOString().split('T')[0];
        }
        
        // Generate initial time slots
        updateTimeSlots(document.getElementById('appointmentDate').value);
        
        // Add event listener for date change
        document.getElementById('appointmentDate').addEventListener('change', function() {
            updateTimeSlots(this.value);
        });
        
        // Add warning if user selects non-recommended visit type
        appointmentTypeOptionsElement.addEventListener('change', function(e) {
            if (e.target.value !== formData.recommendedVisitType) {
                const confirmed = confirm(
                    "This visit type is different from our recommendation based on your symptoms. " +
                    "Are you sure you want to proceed with this selection?"
                );
                if (!confirmed) {
                    // Revert to recommended type
                    document.querySelector(`input[value="${formData.recommendedVisitType}"]`).checked = true;
                }
            }
        });
    }
    
// Function to update time slots based on selected date
function updateTimeSlots(date) {
    const slots = generateTimeSlots(date);
    const timeSlotsElement = document.getElementById('available-time-slots');
    
    if (slots.length === 0) {
        timeSlotsElement.innerHTML = `<p class="no-slots">No available time slots for the selected date.</p>`;
        return;
    }
    
    let slotsHTML = '';
    slots.forEach(slot => {
        const disabledClass = !slot.available ? 'disabled' : '';
        slotsHTML += `
            <div class="time-slot ${disabledClass}" data-slot-id="${slot.id}" data-time="${slot.time}">
                <span>${slot.formatted}</span>
            </div>
        `;
    });
    
    timeSlotsElement.innerHTML = slotsHTML;
}

// Attach event listener using event delegation
document.getElementById('available-time-slots').addEventListener('click', function(e) {
    let target = e.target;
    // If the click is on a child element like <span>, use its parent
    if (target.tagName.toLowerCase() === 'span') {
        target = target.parentElement;
    }
    // Only process clicks on available time slots
    if (target.classList.contains('time-slot') && !target.classList.contains('disabled')) {
        // Remove 'selected' class from all time slots
        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
        // Add 'selected' class to the clicked slot
        target.classList.add('selected');
        // Store the selected time slot details
        window.selectedTimeSlot = {
            id: target.dataset.slotId,
            time: target.dataset.time
        };
        console.log("Selected slot:", window.selectedTimeSlot);
    }
});


    // Function to initialize Step 4 (confirmation)
    function initializeFormStep4() {
        const formData = window.appointmentFormData || {};
        const selectedDate = document.getElementById('appointmentDate').value;
        const selectedTimeSlot = window.selectedTimeSlot || {};
        
        // Format the date
        const appointmentDate = new Date(`${selectedDate}T${selectedTimeSlot.time}`);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
        
        // Get selected visit type
        const selectedAppointmentType = document.querySelector('input[name="appointmentType"]:checked').value;
        const appointmentTypeText = selectedAppointmentType === 'inperson' ? 'In-Person Visit' : 'Virtual Visit';
        
        // Get selected provider (default to first provider for demo)
        const provider = providersData[0];
        
        // Create booking data
        const bookingData = {
            provider_id: provider.provider_id,
            date: selectedDate,
            time: selectedTimeSlot.time,
            type: selectedAppointmentType,
            reason: formData.reasonForVisit || 'Consultation'
        };
        
        // Show loading state
        const confirmationDetailsElement = document.getElementById('confirmation-details');
        confirmationDetailsElement.innerHTML = `
            <div class="loading-spinner">
                <p>Booking your appointment...</p>
            </div>
        `;
        
        // Book the appointment
        bookAppointment(bookingData).then(newAppointment => {
            // Update confirmation details
            confirmationDetailsElement.innerHTML = `
                <div class="confirmation-success">
                    <div class="confirmation-icon">✓</div>
                    <p>Your appointment has been successfully scheduled.</p>
                </div>
                
                <div class="appointment-details">
                    <div class="detail-row">
                        <span>Date:</span>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span>Time:</span>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="detail-row">
                        <span>Type:</span>
                        <span>${appointmentTypeText}</span>
                    </div>
                    <div class="detail-row">
                        <span>Doctor:</span>
                        <span>${provider.name}</span>
                    </div>
                    <div class="detail-row">
                        <span>Location:</span>
                        <span>${selectedAppointmentType === 'inperson' ? 'Washington DC Clinic, Room 302' : 'Telehealth'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Appointment ID:</span>
                        <span>${newAppointment.appointment_id}</span>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h3>Next Steps</h3>
                    <p>You will receive a confirmation email and text message shortly.</p>
                    <p>${selectedAppointmentType === 'virtual' ? 'A link to join your telehealth appointment will be sent to you before the appointment.' : 'Please arrive 15 minutes before your appointment time.'}</p>
                </div>
                
                <div class="form-actions">
                    <button id="closeModalBtn" class="btn btn-primary">Done</button>
                </div>
            `;
            
            // Add event listener for close button
            document.getElementById('closeModalBtn').addEventListener('click', function() {
                modal.style.display = 'none';
                // Reset to first step for next time
                document.getElementById('step4').style.display = 'none';
                document.getElementById('step1').style.display = 'block';
                document.querySelector('.step[data-step="4"]').classList.remove('active');
                document.querySelector('.step[data-step="1"]').classList.add('active');
                
                // Add the new appointment to the list and refresh UI
                upcomingAppointments.push(newAppointment);
                refreshAppointmentList();
            });
        });
    }
    
    // Function to refresh appointment list
    function refreshAppointmentList() {
        const appointmentListElement = document.getElementById('appointment-list');
        
        if (upcomingAppointments.length > 0) {
            let appointmentsHTML = '';
            upcomingAppointments.forEach(appointment => {
                const appointmentDate = new Date(appointment.scheduled_dt);
                const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                const formattedTime = appointmentDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                });
                
                const provider = providersData.find(p => p.provider_id === appointment.provider_id);
                
                appointmentsHTML += `
                    <div class="appointment-card">
                        <div class="appointment-info">
                            <p class="date">${formattedDate}</p>
                            <p class="time">${formattedTime}</p>
                            <p class="type">${appointment.appointment_type === 'inperson' ? 'In-Person Visit' : 'Virtual Visit'}</p>
                            <p class="doctor">${provider ? provider.name : 'Unknown Provider'}</p>
                        </div>
                        <div class="appointment-actions">
                            <button class="btn btn-secondary">Reschedule</button>
                            <button class="btn btn-outline">Cancel</button>
                        </div>
                    </div>
                `;
            });
            appointmentListElement.innerHTML = appointmentsHTML;
        } else {
            appointmentListElement.innerHTML = `
                <div class="no-appointments">
                    <p>You have no upcoming appointments.</p>
                </div>
            `;
        }
    }
    
    // Function to process step 1 data
    function processStep1Data() {
        // Collect form data
        const mobilityIssues = document.querySelector('input[name="mobilityIssues"]:checked').value;
        const reasonForVisit = document.getElementById('reasonForVisit').value;
        const symptoms = document.getElementById('symptoms').value;
        const symptomDuration = document.getElementById('symptomDuration').value;
        const severity = document.querySelector('input[name="severity"]:checked').value;
        const visitType = document.querySelector('input[name="visitType"]:checked').value;
        
        // Get triage recommendation
        const triageResult = triageRules.determineVisitType(symptoms, severity, symptomDuration);
        
        // Determine if priority booking is needed
        const needsPriorityBooking = triageRules.shouldPrioritizeBooking(
            symptoms, 
            severity, 
            symptomDuration, 
            mobilityIssues
        );
        
        // Store form data
        window.appointmentFormData = {
            mobilityIssues,
            reasonForVisit,
            symptoms,
            symptomDuration,
            severity,
            visitType,
            recommendedVisitType: triageResult.type,
            recommendedUrgency: triageResult.urgency,
            recommendationMessage: triageResult.message,
            needsPriorityBooking
        };
        
        // Update user data for future use
        userData.mobility_issues_flag = mobilityIssues === 'yes';
        
        // If emergency case, show alert
        if (triageResult.type === 'emergency') {
            alert(triageRules.getRecommendation(triageResult));
            return false;
        }
        
        return true;
    }
    
    // Function to process step 2 data
    function processStep2Data() {
        // In a real app, we might do more here
        // For now, we just pass through since insurance verification is handled elsewhere
    }
    
    // Function to process step 3 data
    function processStep3Data() {
        // Get selected date
        const selectedDate = document.getElementById('appointmentDate').value;
        
        // Get selected time slot
        if (!window.selectedTimeSlot) {
            // If no time slot selected, select the first available one
            const firstAvailableSlot = document.querySelector('.time-slot:not(.disabled)');
            if (firstAvailableSlot) {
                firstAvailableSlot.classList.add('selected');
                window.selectedTimeSlot = {
                    id: firstAvailableSlot.dataset.slotId,
                    time: firstAvailableSlot.dataset.time
                };
            }
        }
        
        // Get selected appointment type
        const appointmentType = document.querySelector('input[name="appointmentType"]:checked').value;
        
        // Get priority booking
        const priorityBooking = document.querySelector('input[name="priorityBooking"]:checked').value;
        
        // Store data for confirmation step
        window.appointmentFormData = {
            ...window.appointmentFormData,
            appointmentDate: selectedDate,
            appointmentType,
            priorityBooking
        };
    }
});