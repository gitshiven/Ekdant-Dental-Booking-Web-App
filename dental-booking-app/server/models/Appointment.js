// server/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: String,
  phone: String,
  date: String,
  time: String,
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
