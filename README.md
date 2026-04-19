# GAIO CRM - Global AI Olympiad Management System

A high-performance, specialized CRM built for the **Global AI Olympiad (GAIO)**. This platform centralizes governance, communication, and partnership management for a global scale operation.

## 🚀 Core Features

### 🛠️ Global Platform Governance (Admin)
- **Dynamic Mail Infrastructure**: Multi-account SMTP/IMAP configuration grouped by categories (Organisers, Sponsors, Volunteers, etc.).
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Super Admins, Admins, and Partners.
- **System Logs**: Real-time tracking of administrative actions and security events.

### 📧 Global Mailbox System
- **Category-Based Routing**: Centralized mail handling for different departments.
- **SMTP Switching**: Ability for admins to switch between multiple mail servers directly from the console.
- **Modern UI**: Integrated Inbox, Sent, and Draft management with a focus on productivity.

### 💬 Global Communication Hub
- **Dynamic Channels**: Create 1-way (Broadcast) or 2-way (Interactive) channels.
- **Permission Management**: Restrict messaging privileges to specific roles (e.g., "Sponsors Only" or "Organisers Only").
- **Real-time Interaction**: Threaded replies, broadcast targets, and online status indicators.

### 🤝 Sponsor & Partner Management Hub
- **Strategy & Plans**: Propose and track sponsorship tiers and strategic funding goals.
- **Contract & Legals**: 
  - **Admin Control**: Only admins can draft or upload contracts.
  - **Digital Execution**: Partners can view, sign (via hand-signature pad), or reject agreements.
  - **Registry**: Secure history of all signed legal documents.
- **Dedicated Partner Chat**: Secure, direct communication line between admins and corporate partners.

## 💻 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API & LocalStorage Persistence (v2)
- **Signature Engine**: HTML5 Canvas API for digital hand-signatures.

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/gaio-crm.git
   cd gaio-crm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:4444`.

## 📁 Project Structure

- `src/app/admin`: System governance and mail infrastructure.
- `src/app/communication`: Global chat and channel management.
- `src/app/mailbox`: Centralized email client.
- `src/app/sponsors`: Partner hub with legal and strategy modules.
- `src/components`: Reusable UI components (Sidebar, Header, Charts).
- `src/context`: Authentication and global state providers.

## 🔐 Security & Permissions

- **Super Admin**: Full access to infrastructure, logs, and legal drafting.
- **Admin**: Manage partners, communication channels, and mail routing.
- **Sponsor/Partner**: Access to their specific hub, contract signing, and strategy discussion.

## 📜 License

This project is proprietary and built specifically for the Global AI Olympiad. Unauthorized copying of this file, via any medium, is strictly prohibited.

---
**GAIO Global Operations Team**  
*Building the future of AI through global competition.*
