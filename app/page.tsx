import AudioUploader from './components/AudioUploader';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Audio Uploader</h1>
          <p className="mt-2 text-gray-600">Upload your audio files (100MB MAX) securely to Amazon S3</p>
        </div>
        <AudioUploader />
      </div>
    </main>
  );
}