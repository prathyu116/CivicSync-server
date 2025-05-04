import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../types/models.types';

const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Basic validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Default to not select password
  },
  votes: [{
    type: Schema.Types.ObjectId,
    ref: 'Issue',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;