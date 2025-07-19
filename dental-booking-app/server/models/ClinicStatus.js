const mongoose = require('mongoose');

const clinicStatusSchema = new mongoose.Schema({
  open: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('ClinicStatus', clinicStatusSchema);
