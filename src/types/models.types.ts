import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; 
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
  imageUrl?: string | null;
  status: 'Pending' | 'In Progress' | 'Resolved';
  votes: number;
  votedBy: Types.ObjectId[];
  createdBy: Types.ObjectId | IUser; 
  createdAt: Date;
}