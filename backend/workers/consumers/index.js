const crypto = require("crypto");
const { Worker } = require("bullmq");

const redisConnection = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
};


const worker = new Worker("solveChallenge", async (job) => {
    const { deposit_token, challenge_id, challenge_hash } = job.data;

    let solved = false;
    let secret = 1;

    while (!solved && secret <= 500000) {
        const cryptoString = `deposit_token=${deposit_token}&challenge_id=${challenge_id}&secret=${secret}`;
        const hash = crypto.createHash("sha256").update(cryptoString).digest("hex");

        solved = challenge_hash === hash;
        if (!solved) secret++;
    }

    return secret;
},
{
    connection: redisConnection
});

worker.on("completed", (job, returnvalue) => {
  console.log(`Worker completed job ${job.id} with result ${returnvalue}`);
});
