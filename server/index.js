const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });
const app = express();

app.use(cors());
app.use(express.json());

app.delete('/nuke-user/:uid', async (req, res) => {
    const { uid } = req.params;
    
    const { 
        VITE_COMETCHAT_APPID, 
        COMETCHAT_REGION, 
        VITE_COMETCHAT_APIKEY 
    } = process.env;

    const url = `https://${VITE_COMETCHAT_APPID}.api-${COMETCHAT_REGION}.cometchat.io/v3/users/${uid}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'apiKey': VITE_COMETCHAT_APIKEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (response.ok) {

            res.status(200).json({ message: `User ${uid} deleted successfully` });
        } else {
            const error = await response.json();
            res.status(response.status).json(error);
        }
    } catch (err) {
        console.error('Ошибка на бэке:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Бэк запущен на порту ${PORT}`);
    console.log("App ID:", process.env.VITE_COMETCHAT_APPID);
    console.log("Region:", process.env.COMETCHAT_REGION);
});