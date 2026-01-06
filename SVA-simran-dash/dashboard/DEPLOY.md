# Deployment Instructions for Vercel

This dashboard is built with Next.js and is optimized for deployment on [Vercel](https://vercel.com).

## Prerequisites

1.  A [GitHub account](https://github.com) (where this repository is hosted).
2.  A [Vercel account](https://vercel.com/signup).

## Steps to Deploy

1.  **Log in to Vercel**: Go to https://vercel.com and log in.
2.  **Add New Project**:
    *   Click on the **"Add New..."** button in the dashboard.
    *   Select **"Project"**.
3.  **Import Git Repository**:
    *   Select **"Continue with GitHub"**.
    *   Search for and select the repository: `simran-dash` (or whatever you named it on GitHub).
4.  **Configure Project**:
    *   **Framework Preset**: It should automatically detect **Next.js**.
    *   **Root Directory**: Ensure this is set to `dashboard` (since the Next.js app is inside the `dashboard` folder). *Important: If Vercel doesn't detect this automatically, click "Edit" next to Root Directory and select `dashboard`.*
5.  **Environment Variables**:
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables (values can be found in your local `.env.local` file):
        *   `OPENAI_API_KEY`: Your OpenAI API key (starts with `sk-...`).
        *   `DASHBOARD_PASSWORD`: The password for the dashboard (e.g., `S@V25`).
6.  **Deploy**:
    *   Click **"Deploy"**.

## Post-Deployment

*   Vercel will build and deploy your application.
*   Once finished, you will get a live URL (e.g., `https://simran-dash.vercel.app`).
*   Visit the URL and log in with your configured password.

## Updating the Site

*   Any time you push code to the `main` branch of your GitHub repository, Vercel will automatically trigger a new deployment.
