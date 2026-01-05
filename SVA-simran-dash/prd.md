Custom Dashboard Project Requirements: SemperVirens VC Fund Data
Project Name: SemperVirens Fund I Performance Dashboard
Target Audience: Internal Stakeholders (Heads of Product, Finance, Leadership)
Development Stack: Full JavaScript (Node.js/Express Backend, React Frontend)
Target Deployment: Vercel (Serverless Functions for API, Frontend Hosting)

Local Dev Environment: Antigravity Dev Tool
1. Data Source & Access Requirements
The primary challenge is securing programmatic, recurring access to the Excel file stored on SharePoint.
1.1 Data Source
Requirement ID
Description
Details
DS.1.0
Source File Location
The project must connect to the Excel file located at the following SharePoint URL: https://sempervirensvc.sharepoint.com/:x:/r/sites/OutsideAdvisors/_layouts/15/Doc.aspx?sourcedoc=%7B5E69CEF7-FD55-4C4B-BF65-83FB3FDA6A96%7D&file=SemperVirens%20Fund%20I%20Workbook%20-%202025.09.30.xlsx&action=default&mobileredirect=true

DS.1.1
Required Data
Initial requirements focus on extracting data from the primary investment performance sheet (assumed to be named "Fund Metrics"). Specific data points (e.g., IRR, TVPI, Commitment Status) must be identified post-scoping.

1.2 Microsoft Graph API Integration (The Connection Bridge)
This is the modern, secure method for your server to access SharePoint data.
Requirement ID
Description
Technical Details
DS.2.0
Azure AD Application Setup
Requires a dedicated application registration in Azure AD to obtain a Client ID and Client Secret.
DS.2.1
Permission Scope
The Azure AD application must be granted the necessary permissions to ensure non-interactive server-side access to the SharePoint drive (e.g., Sites.Read.All and/or Files.Read.All).
DS.2.2
Token Management
The Node.js backend must implement logic to securely request, store, and automatically refresh the Azure AD Access Token before it expires.
DS.2.3
Data Extraction Method
The backend must use the Microsoft Graph API's specific Excel endpoints (/workbook/tables/{table-name}/rows) to pull targeted table data, avoiding full file downloads for efficiency.

2. Backend & Data Pipeline Requirements (Node.js / Express)
The backend acts as the secure middle layer, orchestrating data movement and serving the API.
2.1 Database & Caching (For Performance and Reliability)
The SharePoint data must be mirrored in a high-speed database for dashboard performance.
Requirement ID
Description
Technical Details
BE.1.0
Database Selection
Select a database (e.g., PostgreSQL) to act as the persistent data store and cache for all Excel data.
BE.1.1
Data Model
The database schema must be designed for optimal dashboard querying (indexed fields, normalized tables).
BE.1.2
Data Ingestion Job
A dedicated background process must handle the Extract, Transform, Load (ETL) pipeline from SharePoint to the DB.

2.2 Scheduled Data Refresh (Making it "Live")
The key to a live dashboard is a reliable scheduler.
Requirement ID
Description
Technical Details
BE.2.0
Scheduler Implementation
Use a Node.js library like node-schedule or node-cron to set the refresh interval.
BE.2.1
Refresh Interval
The initial data refresh interval must be set to Hourly (e.g., every 60 minutes) to balance data freshness with Graph API throttling risk.
BE.2.2
Atomic Update
The ETL job must update the database in an atomic or transactional manner to ensure the dashboard never serves incomplete or partially updated data.

2.3 API Development
The Express.js application will serve the data to the React frontend.
Requirement ID
Description
Technical Details
BE.3.0
Express.js Setup
Setup a lightweight Express.js server (or Vercel Serverless Functions) to expose secure RESTful endpoints for the frontend.
BE.3.1
Core Endpoint
Must include a fast endpoint (e.g., /api/v1/fund/summary) that returns all necessary aggregated metrics in a single payload, fetched directly from the database (BE.1.0).
BE.3.2
Security Headers
API must implement essential security headers (Helmet library recommended) like CSP, X-Content-Type-Options, and robust CORS configuration.

3. Frontend Requirements (React / Visualization)
This layer focuses on the user experience and visualization of the fund performance.
3.1 Framework & Libraries
Requirement ID
Description
Technical Details
FE.1.0
Frontend Framework
Use React for building the component-based UI.
FE.1.1
Visualization Library
Use Recharts or a similar React-centric library for speed, backed by D3.js for custom, 'wow factor' visual elements.
FE.1.2
Styling
Implement a utility-first CSS framework (e.g., Tailwind CSS) for responsive and rapid design iteration.

3.2 UI/UX and Interactivity
Requirement ID
Description
Technical Details
FE.2.0
Responsive Design
The dashboard must be fully responsive, maintaining readability and interaction quality across desktop, tablet, and mobile devices (prioritizing the Apple ecosystem experience).
FE.2.1
Data Refresh Status
The UI must display a prominent "Last Refreshed" timestamp pulled from the Express API to inform users of data freshness.
FE.2.2
Key Metric Visualization
Use prominent KPIs/scorecards for high-level metrics (e.g., Total Committed Capital, Funds Called).
FE.2.3
Interactive Filtering
Implement filtering widgets (time period, vintage year) that update the visual elements without a full page reload.

4. Deployment & Hosting Requirements (Vercel)
The deployment strategy needs to align with Vercel's serverless architecture.
Requirement ID
Description
Technical Details
DP.1.0
Vercel Hosting
The React frontend must be deployed as a static site via Vercel.
DP.1.1
API as Serverless Functions
The Node.js API must be implemented using Vercel Serverless Functions (e.g., using the /api directory in Next.js/Express) to handle API endpoints.
DP.1.2
Environment Variables
All secrets (Azure AD Client ID/Secret, Database Credentials) must be securely managed using Vercel's environment variable system.
DP.1.3
External Scheduler
The scheduled ETL job (BE.2.0) must be hosted on an external, persistent service (e.g., a dedicated cron server or managed serverless scheduler) to ensure the hourly data refresh runs reliably, as Vercel Serverless Functions cannot host persistent processes.
DP.1.4
CI/CD Pipeline
Setup automated deployment from the Git repository (e.g., main branch) to Vercel upon successful code changes.


