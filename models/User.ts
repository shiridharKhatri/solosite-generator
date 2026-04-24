import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  image: String,
  password: { type: String, select: false },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
