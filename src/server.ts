import express from "express";
import axios from "axios";
import { CameraType, MarsPhotosApiResponse } from "./types";
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
require('dotenv').config()

const app = express();
const port = 8000;

app.use(express.json());
const router = express.Router();

router.get('/test', (req: any, res: any) => res.send('Hello world !'));

router.get('/rovers', async (req: any, res: any) => {
    try {
        const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=${process.env.NASA_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error while getting rovers.', error);
        res.status(500).json({ error: 'Failed to fetch rover data from NASA API.' });
    }
});

router.get('/rovers/:rover/photos/:camera', async (req: any, res: any) => {
    const { rover, camera } = req.params;
    const { sol, earth_date, paginationStart, paginationEnd, page } = req.query;

    if (!Object.values(CameraType).includes(camera as CameraType)) {
        return res.status(400).json({ error: `Invalid camera type: ${camera}` });
    }

    const params: any = {
        camera,
        api_key: process.env.NASA_API_KEY,
    };

    if (sol) {
        params.sol = sol;
    } else if (earth_date) {
        params.earth_date = earth_date;
    } else {
        params.sol = 1000;
    }

    if(page) {
        params.page = page;
    }

    try {
        const response = await axios.get<MarsPhotosApiResponse>(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
            { params }
        );

        let photos = response.data.photos;

        if (paginationStart !== undefined && paginationEnd !== undefined) {
            if (page) {
                return res.status(400).json({
                    error: "Cannot use both 'page' and 'paginationStart/paginationEnd' at the same time."
                });
            }

            const start = parseInt(paginationStart);
            const end = parseInt(paginationEnd);

            if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
                return res.status(400).json({ error: 'Invalid paginationStart or paginationEnd values.' });
            }

            photos = photos.slice(start, end);
        }

        res.json({ photos });
    } catch (error: any) {
        console.error('Error fetching Mars photos:', error.message);
        res.status(500).json({ error: 'Failed to fetch photos from MARS API' });
    }
});

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

cron.schedule('*/30 * * * *', async () => {
    try {
        const timestamp = new Date().toISOString();
        const response = await axios.get<MarsPhotosApiResponse>(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos`,
            {
            params: {
                sol: 1000,
                camera: 'FHAZ',
                api_key: process.env.NASA_API_KEY
            }
        });

        const logData = {
            timestamp,
            response: response.data.photos.map((p: any) => ({
                id: p.id,
                img_src: p.img_src,
                earth_date: p.earth_date,
                camera: p.camera.full_name,
                rover: p.rover.name
            }))
        };

        const logPath = path.join(logsDir, `log-${timestamp}.json`);
        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
        console.log(`[CRON] Fetched and saved photos at ${timestamp}`);
    } catch (err) {
        console.error('[CRON] Failed to fetch photos:', err.message);
    }
});

app.use('/', router);

app.listen(port, () => {
    console.log(`Test backend is running on port ${port}`);
});
