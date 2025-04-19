'use client'

import { useState } from 'react';

export default function AudioDownloader() {
    const [audioUrl, setAudioUrl] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAudioUrl(event.target.value);
    };
    
    const handleDownloadClick = () => {
        if (audioUrl) {
        setDownloadLink(audioUrl);
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
        {downloadLink && (
            <a href={downloadLink} download>
            Click here to download the audio
            </a>
        )}
        </div>
    );
}