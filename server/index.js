const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const fetch = require('node-fetch');

dotenv.config({ path: './.env.local' });
const app = express();

app.use(cors());
app.use(express.json());

app.delete('/nuke-user/:uid', async (req, res) => {
    const { uid } = req.params;
    const { COMETCHAT_APP_ID, COMETCHAT_REGION, COMETCHAT_REST_API_KEY } = process.env;

    const url = `https://${COMETCHAT_APP_ID}.api-${COMETCHAT_REGION}.cometchat.io/v3/users/${uid}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'apiKey': COMETCHAT_REST_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (response.ok) {
            res.status(200).json({ message: `User${uid} deleted succesfully` });
            window.location.assign('/');
        } else {
            const error = await response.json();
            res.status(response.status).json(error);
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Бэк запущен${PORT}`)
    console.log("App ID:", COMETCHAT_APP_ID);
    console.log("Rest Key:", COMETCHAT_REST_API_KEY?.substring(0, 5));
})
