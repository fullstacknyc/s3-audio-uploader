'use client'

import { useState } from 'react';

export default function AudioDownloader() {
    const [audioUrl, setAudioUrl] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAudioUrl(event.target.value);
        setError('');
    };

    const handleDownloadClick = () => {
        try {
            const url = new URL(audioUrl); // Validate URL
            setDownloadLink(url.toString());
        } catch {
            setError('Invalid URL. Please enter a valid audio URL.');
        }
    };

    return (
        <div>
            <h1>Audio Downloader</h1>
            <input
                type="text"
                value={audioUrl}
                onChange={handleInputChange}
                placeholder="Enter audio URL"
            />
            <button onClick={handleDownloadClick}>Download</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {downloadLink && (
                <a href={downloadLink} download>
                    Click here to download the audio
                </a>
            )}
        </div>
    );
}