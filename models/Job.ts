import mongoose from 'mongoose';

export interface IJob extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  benefits?: string[];
  industry: string;
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive';
  postedDate: Date;
  applicationDeadline?: Date;
  applicationUrl: string;
  source: string; // 'LinkedIn', 'Indeed', 'Glassdoor', etc.
  sourceUrl: string;
  companyInfo?: {
    size?: string;
    industry: string;
    description?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new mongoose.Schema<IJob>({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  remote: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    required: true
  },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
  },
  benefits: [String],
  industry: { type: String, required: true },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    required: true
  },
  postedDate: { type: Date, required: true },
  applicationDeadline: Date,
  applicationUrl: { type: String, required: true },
  source: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  companyInfo: {
    size: String,
    industry: String,
    description: String,
    website: String
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
JobSchema.index({ company: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ skills: 1 });
JobSchema.index({ industry: 1 });
JobSchema.index({ experienceLevel: 1 });
JobSchema.index({ postedDate: -1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
