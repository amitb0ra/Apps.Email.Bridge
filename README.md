# 💡 Natural Language Bridge to Legacy Email (Powered by Generative AI)

> This app is in the early stages of development. Please check [TODO.md](TODO.md) for the latest updates.

## 👥 Mentor(s)

**Vipin Chaudhary**

## 📢 Communication Channel

Join the discussion on [Rocket.Chat](https://open.rocket.chat/channel/idea-Natural-Language-Bridge-to-Legacy-Email).

## 💬 Project Description

Legacy email remains a cornerstone of global communication, even as modern platforms like Rocket.Chat gain traction. This project bridges the gap by developing a Rocket.Chat app that integrates legacy email functionality through natural language commands, powered by Generative AI.

The app empowers users to manage their email accounts directly within Rocket.Chat, streamlining workflows and fostering collaboration.

### Key Features

-   **Summarize and Send**: Summarize email threads or discussions and send them as emails to specified recipients.
-   **Search and Share**: Search emails by date range or keywords, and share results or attachments directly in the channel.
-   **Daily Email Reports**: Generate and share daily summaries of email activity.
-   **Secure Connections**: Ensure encrypted email connections using TLS for enhanced security.

## 📜 Getting Started

### Prerequisites

-   A Rocket.Chat server setup.
-   Rocket.Chat Apps CLI. Install it using:

    ```sh
    npm install -g @rocket.chat/apps-cli
    ```

### ⚙️ Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/amitb0ra/Apps.Email.Bridge/
    ```

2. Navigate to the project directory:

    ```sh
    cd Apps.Email.Bridge
    ```

3. Install dependencies:

    ```sh
    npm install
    ```

4. Deploy the app:

    ```sh
    rc-apps deploy --url <server_url> --username <username> --password <password>
    ```

    Replace the placeholders:

    - `<server_url>`: URL of your Rocket.Chat workspace.
    - `<username>`: Your Rocket.Chat username.
    - `<password>`: Your Rocket.Chat password.

---

## 🚀 Usage

Use the `/email-bridge` commands to interact with the app:

-   `/email-bridge help`: Get detailed instructions on how to use the app.
-   `/email-bridge auth`: Authorize your email account.(ensure credentials are set up in the app settings).
-   `/email-bridge contact`: Manage contacts.
-   `/email-bridge <user-prompt>`: Send commands and interact with your email directly from Rocket.Chat.

### Example Commands

-   `/email-bridge summarize this thread and send it as an email to my boss who refuses to use chat`

-   `/email-bridge post in the channel the budget for 2025 email PDF received between 11/1/2024 and 12/24/2024`
