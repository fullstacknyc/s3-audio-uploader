import AudioUploader from './components/AudioUploader';

export default function Home() {
  return (
    <main>
      <h1 className="text-xl font-bold p-4">Upload Audio to S3</h1>
      <AudioUploader />
    </main>
  );
}