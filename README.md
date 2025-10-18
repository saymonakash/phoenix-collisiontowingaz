# Collision Towing AZ Website

A modern, responsive website for Collision Towing AZ built with Astro, React, and TypeScript.

## ✨ Features

- 🚀 Built with Astro for optimal performance
- ⚛️ React components with TypeScript
- 🎨 Tailwind CSS for styling
- 📱 Fully responsive design
- 📧 Contact form with email notifications via Resend API
- 🌙 Dark/Light theme support
- 🗺️ Interactive map integration
- 📊 Cost calculator for towing services

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── logo.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Contact.tsx          # Contact form with email integration
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   └── ...
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/
│   │       └── contact.ts       # Contact form API endpoint
│   └── styles/
└── package.json
```

## 🔧 Environment Setup

1. Copy the environment variables template:

```bash
cp .env.example .env
```

2. Update the `.env` file with your actual values:

```bash
# Resend API Configuration
RESEND_API_KEY=your_resend_api_key_here

# Email Configuration
NOTIFICATION_EMAIL=your-notification-email@example.com
```

### Getting Resend API Key

1. Sign up at [Resend.com](https://resend.com)
2. Create a new API key in your dashboard
3. Add the API key to your `.env` file

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📧 Contact Form

The contact form automatically sends email notifications using the Resend API when customers submit inquiries. Features include:

- Form validation with Zod schema
- Email notifications with customer details
- Error handling and user feedback
- Responsive design for all devices

## 🚀 Deployment

The site is configured for deployment on Cloudflare Pages. Make sure to set up the environment variables in your Cloudflare dashboard:

1. Go to your Cloudflare Pages project
2. Navigate to Settings > Environment variables
3. Add the required environment variables:
   - `RESEND_API_KEY`
   - `NOTIFICATION_EMAIL`

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
