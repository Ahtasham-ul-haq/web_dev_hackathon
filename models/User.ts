import mongoose from 'mongoose';

export interface ISkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  endorsements?: number;
}

export interface IExperience {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  skills: string[];
}

export interface IEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  achievements?: string[];
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate?: Date;
  endDate?: Date;
  highlights?: string[];
}

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  resumeUrl?: string;
  resumeText?: string;
  contactInfo: {
    phone?: string;
    email: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    location?: string;
  };
  summary?: string;
  skills: ISkill[];
  experience: IExperience[];
  education: IEducation[];
  projects: IProject[];
  certifications?: string[];
  languages?: { language: string; proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native' }[];
  preferences: {
    jobTitles: string[];
    locations: string[];
    remoteWork: boolean;
    salaryRange?: {
      min: number;
      max: number;
      currency: string;
    };
    industries: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  yearsOfExperience: { type: Number },
  endorsements: { type: Number, default: 0 }
});

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: { type: String, required: true },
  skills: [String]
});

const EducationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  gpa: Number,
  achievements: [String]
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  url: String,
  githubUrl: String,
  startDate: Date,
  endDate: Date,
  highlights: [String]
});

const UserSchema = new mongoose.Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  avatar: String,
  resumeUrl: String,
  resumeText: String,
  contactInfo: {
    phone: String,
    email: { type: String, required: true },
    linkedin: String,
    github: String,
    portfolio: String,
    location: String
  },
  summary: String,
  skills: [SkillSchema],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  projects: [ProjectSchema],
  certifications: [String],
  languages: [{
    language: String,
    proficiency: { type: String, enum: ['Basic', 'Conversational', 'Fluent', 'Native'] }
  }],
  preferences: {
    jobTitles: [String],
    locations: [String],
    remoteWork: { type: Boolean, default: false },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    industries: [String]
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
