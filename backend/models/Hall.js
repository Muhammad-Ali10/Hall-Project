const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true,
    },
    state: String,
    region: String, // State/Province
    pincode: String,
    postalCode: String, // Alternative to pincode
    country: {
      type: String,
      default: 'India',
    },
    fullAddress: {
      type: String,
      required: true,
    },
    formattedAddress: String, // From Google Maps API
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      // No default - location should only exist if coordinates are present
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false, // Will be geocoded automatically
    },
    latitude: Number, // Stored separately for easier access
    longitude: Number, // Stored separately for easier access
  },
  description: String,
  capacity: {
    type: Number,
    required: false, // Can be set later in dashboard
    min: 1,
  },
  price: {
    type: Number,
    required: false, // Can be set later in dashboard
    min: 0,
  },
  eventTypes: [{
    type: String,
    enum: ['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other'],
  }],
  amenities: [{
    type: String,
  }],
  photos: [{
    url: String,
    publicId: String,
  }],
  videos: [{
    url: String,
    publicId: String,
  }],
  policies: {
    cancellation: String,
    refund: String,
    terms: String,
  },
  gst: String,
  license: {
    url: String,
    publicId: String,
  },
  gstDocument: {
    url: String,
    publicId: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  bookedDates: [{
    date: Date,
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
  }],
  blockedDates: [{
    date: Date,
    reason: String,
    blockedBy: {
      type: String,
      enum: ['owner', 'admin'],
      default: 'owner',
    },
  }],
  availableDates: [{
    date: Date,
    slots: [{
      startTime: String,
      endTime: String,
      price: Number, // Optional: different pricing for different slots
    }],
  }],
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
  banner: {
    url: String,
    publicId: String,
  },
  openingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } },
  },
  seasonalPricing: [{
    name: String, // e.g., "Wedding Season", "Holiday Season"
    startDate: Date,
    endDate: Date,
    priceMultiplier: { type: Number, default: 1 }, // e.g., 1.2 for 20% increase
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to ensure location is only set if coordinates exist
hallSchema.pre('save', function(next) {
  // If location exists but coordinates are missing or invalid, remove location
  if (this.location && (!this.location.coordinates || 
      !Array.isArray(this.location.coordinates) || 
      this.location.coordinates.length !== 2 ||
      this.location.coordinates.some(coord => isNaN(coord) || coord === 0))) {
    this.location = undefined;
  }
  
  // Sync latitude and longitude from coordinates array
  if (this.location && this.location.coordinates && this.location.coordinates.length === 2) {
    this.location.longitude = this.location.coordinates[0];
    this.location.latitude = this.location.coordinates[1];
    this.location.type = 'Point';
  }
  
  // Update updatedAt timestamp
  this.updatedAt = new Date();
  
  next();
});

// Geospatial index for location-based queries
hallSchema.index({ location: '2dsphere' });
// Text index for search
hallSchema.index({ name: 'text', description: 'text', 'address.city': 'text', 'address.fullAddress': 'text' });
// Standard indexes
hallSchema.index({ 'address.city': 1 });
hallSchema.index({ 'address.state': 1 });
hallSchema.index({ price: 1 });
hallSchema.index({ capacity: 1 });
hallSchema.index({ eventTypes: 1 });
hallSchema.index({ isActive: 1 });
hallSchema.index({ rating: -1 });
hallSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Hall', hallSchema);

