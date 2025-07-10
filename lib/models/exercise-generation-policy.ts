import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for Exercise Generation Policy
export interface ExerciseGenerationPolicy {
  // How many days in advance to generate exercises (default: 14)
  advanceDays: number;
  
  // Maximum batch size for a single generation operation (default: 7)
  batchSize: number;
  
  // Tracks when exercises were last generated
  lastGenerationTime?: Date;
  
  // The furthest date that has been generated (ISO date string format)
  furthestGeneratedDate?: string;
  
  // Whether to regenerate exercises that were modified by the user
  preserveUserModifications: boolean;
  
  // Whether automatic generation is enabled for this plan
  autoGenerationEnabled: boolean;
}

// Default values for new generation policies
export const DEFAULT_GENERATION_POLICY: ExerciseGenerationPolicy = {
  advanceDays: 14,
  batchSize: 7,
  preserveUserModifications: true,
  autoGenerationEnabled: true,
};

// MongoDB Schema for embedded policy
export const ExerciseGenerationPolicySchema = new Schema<ExerciseGenerationPolicy>({
  advanceDays: {
    type: Number,
    default: 14,
    min: 1,
    max: 90,
  },
  batchSize: {
    type: Number,
    default: 7,
    min: 1,
    max: 14,
  },
  lastGenerationTime: {
    type: Date,
  },
  furthestGeneratedDate: {
    type: String,
  },
  preserveUserModifications: {
    type: Boolean,
    default: true,
  },
  autoGenerationEnabled: {
    type: Boolean,
    default: true,
  },
}, { _id: false }); // No separate _id for embedded schema

// Helper function to ensure a policy has default values
export function ensureDefaultGenerationPolicy(policy?: Partial<ExerciseGenerationPolicy>): ExerciseGenerationPolicy {
  return {
    ...DEFAULT_GENERATION_POLICY,
    ...policy,
  };
}

// Type guard to check if a policy is valid
export function isValidGenerationPolicy(policy: any): policy is ExerciseGenerationPolicy {
  return (
    typeof policy === 'object' &&
    typeof policy.advanceDays === 'number' &&
    typeof policy.batchSize === 'number' &&
    typeof policy.preserveUserModifications === 'boolean' &&
    typeof policy.autoGenerationEnabled === 'boolean'
  );
}
