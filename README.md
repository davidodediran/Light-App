# Light App

Multi-tenant school communication and support ticket platform built on AWS.

## Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Auth**: Amazon Cognito
- **Database**: Amazon Aurora Serverless v2 (PostgreSQL) + Prisma ORM
- **Real-time**: AWS AppSync (GraphQL subscriptions)
- **Calling**: AWS Chime SDK (in-app audio/video)
- **Storage**: Amazon S3 + CloudFront
- **Email**: Amazon SES via SQS
- **Automation**: AWS Lambda + EventBridge (escalation engine)
- **AI**: Amazon Bedrock (Claude 3 Haiku) for ticket summarisation
- **Hosting**: AWS Amplify

## Features

- 7 user roles: Super Admin, Admin, Principal, Class Teacher, Subject Teacher, Parent, Student
- Automated ticket escalation: 24h → 48h → 72h → 96h+ with 5 escalation levels
- Real-time messaging within tickets and direct parent↔teacher threads
- In-app calling (teachers initiate, parents answer only)
- School-wide announcement broadcast (read-only for parents)
- AI-generated ticket summaries at principal escalation
- Multi-tenant: one deployment, unlimited schools

## Development

```bash
cp .env.example .env.local
# Fill in AWS credentials and resource ARNs

npm install
npx prisma generate
npm run dev
```

## Branch Strategy

| Branch | Environment |
|--------|-------------|
| `dev` | Development |
| `staging` | Staging |
| `main` | Production |

## Escalation Timeline

| Status | Deadline |
|--------|----------|
| Open | 24h |
| Escalated to Class Teacher | 48h |
| Escalated to Principal | 72h |
| Escalated to Director | 96h |
| Escalated to Owner | No auto-escalation |
