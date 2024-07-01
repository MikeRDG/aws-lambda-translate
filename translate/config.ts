import pg from 'pg';
const { Pool } = pg;
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT!),
    ssl: {
        rejectUnauthorized: false,
    },
}
export const pool = new Pool(dbConfig);
export const queueUrl = process.env.SQS_QUEUE_URL
