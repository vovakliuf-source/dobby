const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const geoCoder = require('../utils/geocoder');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxLength: [100, 'Title cannot be more than 100 characters'],
    required: [true, 'Title is required'],
  },
  slug: String,
  description: {
    type: String,
    trim: true,
    maxLength: [1000, 'Description cannot be more than 1000 characters'],
    required: [true, 'Description is required'],    
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  company: { 
    type: String,
    trim: true,
    maxLength: [100, 'Company name cannot be more than 100 characters'],
    required: [true, 'Company name is required'],    
  },
  industry: {
    type: [String],
    required: [true, 'Industry is required'],
    enum: {
      values: [
        'Business',
        'Information Technology',
        'Banking',
        'Education/Training',
        'Telecommunication',
        'Others'
      ],
      message: 'Please select correct options for industry'
    }      
  },
    jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: {
      values: ['Permanent', 'Temporary', 'Internship'],
      message: 'Please select correct options for job type'
    }
  },
    minEducation: {
        type: String,
        required: [true, 'Minimum education is required'],
        enum: {
            values: ['Bachelors', 'Masters', 'PhD'],
            message: 'Please select correct options for minimum education'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: [true, 'Experience is required'],
        enum: {
            values: ['No experience', '1 year', '2 years', '3 years', '4 years', '5+ years'],
            message: 'Please select correct options for experience'
        }
    },
    salary: {
        type: Number,
        required: [true, 'Salary is required']
    },
    postingDate: {
        type: Date,
        default: Date.now
    },
    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7) // Default to 30 days from now
    },
    applicantsApplied: {
        type: [Object],
        select: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

jobSchema.pre('save', async function() {
    this.slug = await slugify(this.title, { lower: true });
});

jobSchema.pre('save', async function() {
    const loc = await geoCoder.geocode({ address: this.address, limit: 5, countryCode: 'fr', minConfidence: 0.3 });
    if (loc.length > 0) {      
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
  }
});

module.exports = mongoose.model('Job', jobSchema);