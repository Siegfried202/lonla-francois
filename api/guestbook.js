export default async function handler(req, res) {
    const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/69fbd46ec0954111d8e92554';
    const JSONBIN_KEY = process.env.JSONBIN_KEY;

    if (!JSONBIN_KEY) {
        return res.status(500).json({ error: "Configuration serveur manquante (JSONBIN_KEY)" });
    }

    if (req.method === 'GET') {
        try {
            const response = await fetch(JSONBIN_URL, {
                headers: { 'X-Master-Key': JSONBIN_KEY }
            });
            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch from DB' });
        }
    } else if (req.method === 'POST') {
        const { nom, message } = req.body;
        
        try {
            const getRes = await fetch(JSONBIN_URL, { headers: { 'X-Master-Key': JSONBIN_KEY } });
            const currentData = await getRes.json();
            const record = currentData.record || { guestbook: [], reservations: [] };
            
            record.guestbook.push({
                id: Date.now(),
                nom,
                message,
                date: new Date().toISOString()
            });

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
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
