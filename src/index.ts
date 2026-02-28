import express from 'express';
import jobs from '@/routes/jobs.js'
const app = express();
const PORT = 3000

app.use(express.json())
app.use('/api/jobs', jobs);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok'});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});