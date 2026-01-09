🚀 Day 2: From TypeScript to a Live AWS API (The "Magic" of Serverless)

Documenting Day 2 of building TrackMyExpense! Yesterday was about structure; today was about "The Magic." 🪄

I went from local TypeScript files to a live, production-ready AWS API in a few sessions. If you've ever wondered what happens "under the hood" when you deploy serverless apps, here's the breakdown of how we did it:

---

🏗️ Phase 1: The Foundation (CloudFormation)

We deployed 3 core infrastructure stacks manually using AWS CloudFormation:
1. 🗄️ Database: DynamoDB (Single Table Design) with GSI for optimized queries.
2. 🔐 Auth: AWS Cognito User Pool with custom domains and security policies.
3. 📦 Storage: Multiple S3 buckets for receipts (secure) and frontend (hosting).

---

⚡ Phase 2: The "One Command" Deployment

This is where it gets cool. Using the Serverless Framework, we automated the bridge between code and cloud.

The Workflow:
1️⃣ Compile: TypeScript (`.ts`) is transpiled into clean JavaScript (`.js`) and modern Node.js.
2️⃣ Package: The code + all dependencies (node_modules) are bundled into a lean ZIP.
3️⃣ Translate: The simple `serverless.yml` generated a massive AWS CloudFormation template (JSON) behind the scenes (I checked — it was hundreds of lines!).
4️⃣ Orchestrate: AWS CloudFormation received the command, uploaded the code to S3, and built the API Gateway + Lambda + IAM roles in minutes.

---

✅ Day 2 Achievements

✓ 3/3 Infrastructure Stacks Live in `ap-south-1`
✓ DynamoDB Schema optimized (UserId / EntityType keys)
✓ Serverless Framework configured for Auth & Storage access
✓ First Live Endpoint: `/health` is UP and talk to the DB!
✓ IAM Permissions strictly configured (Least Privilege)

---

🤖 Powered by Google's Antigravity AI

Antigravity continues to blow my mind. It didn't just give me snippets; it:
• Wrote full CloudFormation templates.
• Debugged TypeScript compilation errors in seconds.
• Explained the "Behind the Scenes" mechanics of the Serverless Framework.
• Drafted this update while keeping the technical depth intact.

Moving fast while actually understanding the "why" is a game-changer. 🔥

---

📈 What's Next?

Phase 3: Building the actual services! 
• Authentication flows (Login/Register)
• Multi-Account Management CRUD
• Transaction Logic

---

🔗 GitHub: https://github.com/kmakhilesh4/TrackMyExpense

#BuildInPublic #Serverless #AWS #TypeScript #CloudFormation #CloudComputing #FullStack #GoogleAntigravity #AIassistedCoding #DeveloperJourney #NodeJS
