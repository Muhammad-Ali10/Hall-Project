const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['decoration', 'catering', 'photography', 'makeup', 'travel', 'other'],
    required: true,
  },
  description: String,
  phone: {
    type: String,
    required: true,
  },
  email: String,
  address: String,
  city: String,
  portfolio: [{
    url: String,
    publicId: String,
    type: {
      type: String,
      enum: ['image', 'video'],
    },
  }],
  idProof: {
    url: String,
    publicId: String,
    type: {
      type: String,
      enum: ['aadhar', 'pan', 'driving-license', 'passport', 'other'],
    },
  },
  plNumber: String,
  bankDetails: {
    accountNumber: String,
    ifsc: String,
    bankName: String,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  adminNotes: [{
    note: String,
    action: {
      type: String,
      enum: ['approve', 'reject', 'block', 'unblock', 'note'],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  packages: [{
    name: String,
    description: String,
    price: Number,
    features: [String],
  }],
  pricing: {
    basePrice: Number,
    currency: { type: String, default: 'INR' },
    pricingModel: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'package'],
      default: 'fixed',
    },
  },
  availability: {
    monday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    tuesday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    wednesday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    thursday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    friday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    saturday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    sunday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

serviceProviderSchema.index({ category: 1 });
serviceProviderSchema.index({ city: 1 });
serviceProviderSchema.index({ isActive: 1 });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);

