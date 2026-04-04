# SmartRent Deployment Guide 🚀

To successfully host your full-stack application, the best architectural approach is a **Split Deployment**: hosting the Frontend on **Vercel** and the Backend on **Render**.

> [!WARNING]  
> Why not host the Backend on Vercel too?  
> Vercel is designed for "Serverless Functions". Because your SmartRent backend uses an always-running internal clock (`setInterval` in `reminders.service.js` for cron jobs), deploying the Node.js server to Vercel will cause these background tasks to freeze. Render keeps the server continuously running.

Here is your step-by-step launch protocol:

---

## Part 1: Deploying the Backend (Render)

Render provides a free, always-on tier that perfectly supports Express and MongoDB.

1. Create an account at [Render.com](https://render.com) and connect your GitHub.
2. Click **New +** and select **Web Service**.
3. Connect your SmartRent repository.
4. Configure the Web Service settings as follows:
   * **Name**: `smartrent-api`
   * **Root Directory**: `server` *(Important: don't leave this blank!)*
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start` *(make sure package.json has `"start": "node server.js"`)*
5. Scroll down to **Environment Variables** and add all your keys from your local `.env` file:
   * `MONGO_URI`
   * `JWT_ACCESS_SECRET`
   * `JWT_REFRESH_SECRET`
   * `RAZORPAY_KEY_ID`
   * `RAZORPAY_KEY_SECRET`
   * `GOOGLE_CLIENT_ID`
   * `GOOGLE_CLIENT_SECRET` 
   * `CLIENT_URL` *(You will update this later once Vercel is live)*
6. Click **Create Web Service**. Wait 2-3 minutes for the build to finish.
7. Copy the deployed URL (e.g., `https://smartrent-api.onrender.com`).

---

## Part 2: Deploying the Frontend (Vercel)

Now we will host the Vite React application on Vercel.

1. Create an account at [Vercel.com](https://vercel.com) and connect your GitHub.
2. Click **Add New...** -> **Project**.
3. Import your SmartRent repository.
4. Expand the **Build and Output Settings** and **Framework Preset** section:
   * **Framework Preset**: Specify `Vite`
   * **Root Directory**: `client` *(Important)*
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add the connection link to your newly deployed Render server:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://smartrent-api.onrender.com` *(Replace with your actual Render URL)*
   * **Key**: `VITE_GOOGLE_CLIENT_ID`
   * **Value**: *(Your Google OAuth client ID)*
6. Click **Deploy**! Wait 1-2 minutes.
7. Vercel will provide you a live URL (e.g., `https://smartrent.vercel.app`).

---

## Part 3: Finalizing Webhooks & Handlers

Once both are launched, tie them together so data flows securely:

1. **Update Render CORS/URLs**:
   * Go back to Render Dashboard > Environment Variables.
   * Update `CLIENT_URL` to your new Vercel domain (`https://smartrent.vercel.app`).
2. **Update Google OAuth Settings**:
   * Go to your Google Cloud Console.
   * Add your new Vercel domain to **Authorized JavaScript origins**.
   * Add `https://smartrent-api.onrender.com/auth/google/callback` to **Authorized redirect URIs**.

You are now live! 🎉
