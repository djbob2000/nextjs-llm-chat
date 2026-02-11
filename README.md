# LLM Chat Workbench

A modern chat interface for interacting with various Large Language Models (LLM) via OpenRouter. It supports streaming, conversation history, tool calling, and markdown export.

## Key Features

- **Streaming Responses**: Get tokens in real-time as they are generated.
- **Tool Calling**: Assistant can execute functions (e.g., get current time, summarize text).
- **Markdown & Code**: High-quality text rendering and syntax highlighting with a copy-to-clipboard button.
- **Flexible Settings**: Change models, adjust temperature, and set system prompts for each chat.
- **Export**: Save your conversations as Markdown files.
- **Security**: Built-in authentication (Auth.js), rate limiting, Zod validation, and input sanitization.
- **Premium UI**: Built with Tailwind CSS, Lucide icons, and shadcn/ui components. Supports dark and light modes.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: Tailwind CSS (v4)
- **Authentication**: Auth.js (NextAuth v5)
- **LLM API**: OpenRouter

## Quick Start

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up your environment variables in `.env.local` (Database URL, OpenRouter API Key).
4. Run database migrations: `npx prisma migrate dev`.
5. Start the development server: `npm run dev`.

## Additional Information

This project is a demonstration of a modern AI application architecture, featuring clearly separated layers (Repositories, Services, Proxy) and a responsive user interface.
