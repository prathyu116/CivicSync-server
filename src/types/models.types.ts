// src/types/models.types.ts
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional on retrieval if selecting '-password'
  votes: Types.ObjectId[];
  createdAt: Date;
}

export interface IIssue extends Document {
  title: string;
  description: string;
  category: 'Infrastructure' | 'Safety' | 'Environment' | 'Public Services' | 'Other';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  imageUrl?: string | null; // Allow null
  status: 'Pending' | 'In Progress' | 'Resolved';
  votes: number;
  votedBy: Types.ObjectId[];
  createdBy: Types.ObjectId | IUser; // Can be populated
  createdAt: Date;
}