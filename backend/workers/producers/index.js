const { Queue, QueueEvents } = require('bullmq');
const express = require("express");

const redisConnection = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
};

const PORT = process.env.WORKERS_PORT || 3002;

const queueEvents = new QueueEvents('solveChallenge', {
    connection: redisConnection,
});

const queue = new Queue('solveChallenge', {
    connection: redisConnection,
});


const app = express();
app.use(express.json());

app.get("/heartbeat", async (_req, res) => {
    res.status(200).send(true);
});

app.post("/job", async (req, res) => {
    console.log(req.body);

    if (!req.body) {
        res.status(400).send("Missing body");
        return;
    }

    const { deposit_token, challenge_id, challenge_hash } = req.body;

    if (!deposit_token || !challenge_id || !challenge_hash) {
        res.status(400).send("Missing parameters");
        return;
    }

    const job = await queue.add('solveChallenge', { deposit_token, challenge_id, challenge_hash });
    res.status(200).send(job.id);
});

app.get("/job/:id", async (req, res) => {
    const job = await queue.getJob(req.params.id);

    if (!job) {
        res.status(404).send("Job not found");
        return;
    }

    res.status(200).send(job);
});


queueEvents.on('completed', (job) => {
    console.log(`Job with ID ${job.jobId} has been completed and returned ${job.returnvalue}!`);
});


app.listen(PORT, () => {
  console.log(`Workers server started on localhost:${PORT}`);     
});
