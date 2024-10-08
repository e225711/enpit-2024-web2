import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const { content } = req.body;
  await client.query('INSERT INTO questions (content) VALUES ($1)', [content]);

  client.end();
  res.status(200).json({ message: '質問を保存しました' });
}
