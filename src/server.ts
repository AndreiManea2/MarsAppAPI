import express from "express";
import axios from "axios";
import { CameraType } from "./types";

const app = express();
const port = 8000;
const NASA_API_KEY = 'ApzUaOAkfmdL4y2ouq5kbtqEPSSdcPTKp7SNbZ4p';

app.use(express.json());
const router = express.Router();

router.get('/test', (req: any, res: any) => res.send('Hello world !'));

router.get('/rovers', async (req: any, res: any) => {
    try {
        const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=${NASA_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error while getting rovers.', error);
        res.status(500).json({ error: 'Failed to fetch rover data from NASA API.' });
    }
});

router.get('/rovers/:rover/photos/:camera', async (req: any, res: any) => {
    const { rover, camera } = req.params;

    if (!Object.values(CameraType).includes(camera as CameraType)) {
        return res.status(400).json({ error: `Invalid camera type: ${camera}` });
    }

    try {
        const response = await axios.get(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
            {
                params: {
                    sol: 1000, // Hardcoded Martian sol
                    camera: camera,
                    api_key: NASA_API_KEY,
                },
            }
        );

        res.json(response.data);
    } catch (error: any) {
        console.error('Error fetching Mars photos:', error.message);
        res.status(500).json({ error: 'Failed to fetch photos from MARS API' });
    }
});

app.use('/', router);

app.listen(port, () => {
    console.log(`Test backend is running on port ${port}`);
});
