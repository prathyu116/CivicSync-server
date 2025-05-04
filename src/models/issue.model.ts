// src/models/issue.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IIssue } from '../types/models.types';

const IssueSchema: Schema<IIssue> = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Infrastructure', 'Safety', 'Environment', 'Public Services', 'Other'],
      message: '{VALUE} is not a supported category',
    }
  },
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    address: {
      type: String,
      trim: true,
    },
  },
  imageUrl: {
    type: String,
    trim: true,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  votes: {
    type: Number,
    default: 0,
    min: 0,
  },
  votedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Issue: Model<IIssue> = mongoose.model<IIssue>('Issue', IssueSchema);

export default Issue;