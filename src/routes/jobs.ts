// Initialize small app Router
import { Router }from 'express'
import * as jobStorage from '@/storage/jobs.js'
import type { GetOneJobResponse } from '@/shared/types.js';
const router = Router();

// Create a job
router.post('/', (req, res) => {
    const job = {
        jobId: "",
        url: req.body.url,
        selector: req.body.selector,
        instanceCount: req.body.instanceCount,
        mode: req.body.mode,
        timeout: req.body.timeout,
        retryAttempts: req.body.retryAttempts,
        retryDelay: req.body.retryDelay,
        proxies: req.body.proxies,
        succeeded: 0,
        failed: 0,
        instances: [],
        status: "idle",
        totalInstances: req.body.instanceCount
    } as GetOneJobResponse ;

    const jobId = jobStorage.addJob(job)

    res.json({
        jobId: jobId,
        status: "idle",
        message: "Job created successfully"
    })
})


// Get all jobs
router.get('/', (req, res) => {
    const jobs = jobStorage.getAllJobs();
    res.json({ jobs });
})

// Get one job
router.get('/:id', (req, res) => {
    const oneJob = jobStorage.getOneJob(req.params.id);

    if (oneJob) {
        res.json({ oneJob });
    } else {
        res.json({ message: "Job not found."})
    }
})

// Delete one job
router.delete('/:id', (req, res) => {
    const deleted = jobStorage.deleteJob(req.params.id)

    // Makes sure it is deleted with an if else
    if (deleted) {
        res.json({
            jobId: req.params.id,
            status: "stopped",
            message: "Job successfully cancelled"
        });
    } else {
        res.json({
            jobId: req.params.id,
            status: "not_found",
            message: "Job not found"
        });
    }
})

export default router;