const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const ClinicStatus = require('../models/ClinicStatus');

// POST /api/book – Patient books appointment
 router.post('/book', async (req, res) => {
  try {
    const { date, time } = req.body;

    // ✅ 0. Block Sundays
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday
    if (dayOfWeek === 0) {
      return res.status(400).json({ error: 'Clinic is closed on Sundays' });
    }

    // ✅ 1. Validate clinic hours
    const [hour, minute] = time.split(':').map(Number);
    const isMorning = hour >= 10 && hour < 14;
    const isEvening = hour >= 17 && hour < 20;

    if (!(isMorning || isEvening)) {
      return res.status(400).json({ error: 'Time must be within clinic hours (10am–2pm, 5pm–8pm)' });
    }

    // ✅ 2. Check for double booking (same date & time)
    const alreadyExists = await Appointment.findOne({ date, time });
    if (alreadyExists) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const newAppt = new Appointment(req.body);
    await newAppt.save();

    return res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('❌ Error during booking:', err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});





// GET /api/appointments – Receptionist views all
// Add this route in your router file
router.get("/available-slots", (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: "Date is required" });

  const CLINIC_HOURS = [
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30"
  ];

  const fs = require("fs");
  const path = require("path");
  const DATA_FILE = path.join(__dirname, "../data/appointments.json");

  let appointments = [];

  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    appointments = JSON.parse(data);
  }

  const bookedSlots = appointments
    .filter(appt => appt.date === date)
    .map(appt => appt.time);

  const availableSlots = CLINIC_HOURS.filter(slot => !bookedSlots.includes(slot));

  res.json(availableSlots);
});


// PUT /api/appointments/:id/approve – Approve an appointment
router.put('/appointments/:id/approve', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Not found' });

    appointment.status = 'approved';
    await appointment.save();
    res.json({ message: 'Appointment approved' });
  } catch (err) {
    console.error('❌ Error approving appointment:', err);
    res.status(500).json({ error: 'Failed to approve appointment' });
  }
});

// DELETE /api/appointments/:id – Cancel an appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    console.error('❌ Error cancelling appointment:', err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// GET /api/status – Get clinic open/closed status
router.get('/status', async (req, res) => {
  try {
    let status = await ClinicStatus.findOne();
    if (!status) status = await ClinicStatus.create({ open: true });
    res.json({ open: status.open });
  } catch (err) {
    console.error('❌ Error fetching status:', err);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// PUT /api/status – Toggle clinic open/closed
router.put('/status', async (req, res) => {
  try {
    const { open } = req.body;
    let status = await ClinicStatus.findOne();
    if (!status) {
      status = await ClinicStatus.create({ open });
    } else {
      status.open = open;
      await status.save();
    }
    res.json({ message: 'Status updated', open: status.open });
  } catch (err) {
    console.error('❌ Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/slots?date=YYYY-MM-DD – Available slots for a day
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;

    const allSlots = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '5:00 PM',  '5:30 PM',  '6:00 PM',  '6:30 PM',
  '7:00 PM',  '7:30 PM', '8:00 PM'
];

// Get appointments by phone number (patient)
router.get('/my/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const appointments = await Appointment.find({ phone });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

    const bookedAppointments = await Appointment.find({ date });
    const bookedTimes = bookedAppointments.map(appt => appt.time);

    const available = allSlots.filter(slot => !bookedTimes.includes(slot));
    res.json({ available });
  } catch (err) {
    console.error('❌ Error fetching slots:', err);
    res.status(500).json({ error: 'Failed to get slots' });
  }
});

module.exports = router;
