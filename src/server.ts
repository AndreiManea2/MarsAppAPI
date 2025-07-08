import express from "express";
import axios from "axios";

const app = express();
const port = 8000;
const NASA_API_KEY = 'ApzUaOAkfmdL4y2ouq5kbtqEPSSdcPTKp7SNbZ4p';

app.use(express.json());
const router = express.Router();

router.get('/test', (req: any, res: any) => res.send('Hello world !'));

router.get('/rovers', async (req: any, res: any) => {
    try {
        const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=${NASA_API_KEY}`);
        const rovers = response.data.rovers;
        res.json({ rovers });
    } catch (error) {
        console.error('Error while getting rovers.', error);
        res.status(500).json({ error: 'Failed to fetch rover data from NASA API.' });
    }
});

app.use('/', router);

app.listen(port, () => {
    console.log(`Test backend is running on port ${port}`);
});
