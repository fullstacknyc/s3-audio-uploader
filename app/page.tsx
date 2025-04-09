import AudioUploader from './components/AudioUploader';

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Upload Audio to S3</h1>
      <div className="border rounded-lg p-6 shadow-sm">
        <AudioUploader />
      </div>
    </main>
  );
}