import express from 'express'
import cors from 'cors'
import { exec } from 'child_process'
import path from 'path';
import fs from 'fs'

const tmpDir = './tmp';

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

const app = express()

app.use(cors({ origin: '*' }))

app.get('/health-check', (_, response) => {
    response.status(200).send('OK')
})

app.get('/download', async (request, response) => {
    const url = request.query.url
    if (!url) return response.status(400).send('No URL')

    const filename = `audio_${Date.now()}`
    const mp3Path = path.join(tmpDir, `${filename}.mp3`)

    const cmd = `yt-dlp -x --add-metadata --audio-format mp3 --audio-quality 0 --embed-thumbnail -o "${mp3Path}" "${url}"`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) return response.status(500).send(`Error: ${stderr}`);

        response.download(mp3Path, `${filename}.mp3`, (err) => {
            fs.unlinkSync(mp3Path);
        });
    })
})

app.listen(1111)