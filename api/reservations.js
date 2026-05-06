export default async function handler(req, res) {
    const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/69fbce7fadc21f119a63ada3';
    const JSONBIN_KEY = process.env.JSONBIN_KEY;

    if (!JSONBIN_KEY) {
        return res.status(500).json({ error: "Configuration serveur manquante (JSONBIN_KEY)" });
    }

    if (req.method === 'POST') {
        const payload = req.body;
        
        try {
            const getRes = await fetch(JSONBIN_URL, { headers: { 'X-Master-Key': JSONBIN_KEY } });
            const currentData = await getRes.json();
            const record = currentData.record || { guestbook: [], reservations: [] };
            
            payload.id = payload.id || Date.now();
            payload.date = payload.date || new Date().toISOString();
            record.reservations.push(payload);

            const putRes = await fetch(JSONBIN_URL, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_KEY 
                },
                body: JSON.stringify(record)
            });

            if (putRes.ok) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(500).json({ error: 'Failed to save to DB' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Failed to save' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
