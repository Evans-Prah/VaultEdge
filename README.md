# VaultEdge

A sandbox monolithic fintech backend built with Express and TypeScript, demonstrating core modules and infrastructure for a digital wallet and payment processing system.

Project Overview

This repository implements a single Express application containing the following modules:

User Module: Account creation, JWT-based authentication, and KYC status tracking.

Wallet Module: Multi-currency support, balance management, and transaction history.

Payment Module: Internal transfers, external gateway integrations, and ledger writes.

Notification Module: Transaction alerts, account updates, and marketing messages.

Analytics Module: Spending patterns, transaction summaries, and reporting.

Lending Module: Loan creation, repayment schedules, interest calculations, and loan payments.

Investment Module: Portfolio tracking, price feeds, and performance analytics.

Neobank Module: Virtual card issuance, FX conversions, and neobank feature support.

Tech Stack

Language: TypeScript

Framework: Express

Databases: PostgreSQL (primary), Redis (cache/locks)

Messaging (optional): Kafka (event bus)

Infrastructure as Code: Terraform

Containerization: Docker

CI/CD: GitHub Actions / Azure Pipelines

Getting Started

Clone the repository

git clone git@github.com:your-org/finfabric.git
cd finfabric

Install dependencies

npm install express pg redis kafkajs jsonwebtoken dotenv
npm install -D typescript ts-node-dev @types/express @types/node @types/jsonwebtoken

Initialize TypeScript

npx tsc --init --rootDir src --outDir dist --esModuleInterop true --resolveJsonModule true

Project Structure

/src
  /modules
    /user
    /wallet
    /payment
    /notification
    /analytics
    /lending
    /investment
    /neobank
  /config
  /middleware
  /utils
  app.ts       # Application entrypoint
  routes.ts    # Central routing
tsconfig.json
package.json
.env.example
README.md

Run the development server

npm run dev  # using ts-node-dev

License

This project is licensed under the Apache License 2.0. See the LICENSE file for details.
