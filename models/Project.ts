import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  data: { type: Object, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  thumbnail: { type: String },
  theme: { type: String },
  seoScore: { type: Number, default: 0 },
}, { timestamps: true });

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
