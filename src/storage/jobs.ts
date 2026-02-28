// How it handles basic CRUD
import type { GetOneJobResponse } from "@/shared/types.js";
const jobs = new Map<string, GetOneJobResponse>(); // DS for jobs data
let jobCounter = 0;

// Add a job
export function addJob(job: GetOneJobResponse) {
    jobCounter++
    const jobId = `job-${jobCounter}`
    job.jobId = jobId;
    jobs.set(jobId, job);
    return jobId;
}

// Get all jobs
export function getAllJobs() {
    return Array.from(jobs.values())
}

// Get one job
export function getOneJob(jobId: string) {
    return jobs.get(jobId)
}

// Delete one job
export function deleteJob(jobId: string) {
    return jobs.delete(jobId);
}

