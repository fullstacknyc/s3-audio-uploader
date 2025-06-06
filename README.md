# AudioCloud - S3 Audio Uploader

AudioCloud is a secure, high-quality audio file hosting platform designed for musicians, content creators, and audio professionals. Built with Next.js and AWS S3, it enables users to upload, store, and share audio without compromising quality.

## 🌐 Live Demo

[Try it live](https://s3-audio-uploader.vercel.app)

## 🚀 Features

* 🔐 Secure audio storage with AWS S3
* 🎵 No compression — preserves original file quality
* 🔗 Shareable secure download links
* 🧠 Ad unit integration with AdSense
* 📱 Responsive design for mobile and desktop

## 🛠️ Tech Stack

* **Framework:** Next.js 13 (App Router)
* **Storage:** AWS S3
* **Styling:** CSS Modules
* **UI:** React Icons, custom components
* **Ads:** Google AdSense integration

## 📦 Installation

```bash
git clone https://github.com/fullstacknyc/s3-audio-uploader.git
cd s3-audio-uploader
npm install
```

## ⚙️ Environment Variables

Create a `.env.local` file and add the following:

```env
NEXT_PUBLIC_ADSENSE_CLIENT="your-adsense-client-id"
NEXT_PUBLIC_ADSENSE_LEADERBOARD_SLOT="your-slot-id"
NEXT_PUBLIC_ADSENSE_LARGE_RECTANGLE_SLOT="your-slot-id"
NEXT_PUBLIC_ADSENSE_BANNER_SLOT="your-slot-id"
NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT="your-slot-id"
AWS_REGION="your-region"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="your-bucket"
```

## 🧪 Local Development

```bash
npm run dev
```

## 📁 Project Structure

```
app/
  ├── components/
  ├── page.tsx
  ├── styles/
  ├── lib/ (Ad Context, AWS utils)
  └── public/
```

## 🧱 Contributions

Pull requests welcome. For major changes, please open an issue first to discuss what you would like to change.

## 🪪 License

[MIT](LICENSE)

---

Built with ❤️ by [fullstacknyc](https://github.com/fullstacknyc)
