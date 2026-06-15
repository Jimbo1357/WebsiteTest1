import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid'; // You can install this or use a simple random string generator

export default async function handler(req, res) {
    // 1. Handling the submission (POST)
    if (req.method === 'POST') {
        const { text } = req.body;
        const id = nanoid(8); // Generates an 8-character random ID (e.g., 'xY7zK9a2')
        
        // Save raw text to Vercel KV with an expiration of 7 days (optional)
        await kv.set(id, text, { ex: 60 * 60 * 24 * 7 }); 
        
        return res.status(200).json({ id });
    }

    // 2. Handling the retrieval (GET)
    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id) return res.status(400).send('Missing paste ID');

        const rawText = await kv.get(id);
        if (!rawText) return res.status(404).send('Paste not found or expired');

        // CRITICAL: Set content-type to plain text so it renders as a raw string in the browser
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(rawText);
    }

    return res.status(405).send('Method Not Allowed');
}
