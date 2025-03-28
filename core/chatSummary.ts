import { IRead, IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { sendMessage } from "../helpers/sendMessage";
import { createSummaryPrompt } from "../constants/prompts";
import { llm } from "../helpers/llmProvider";
import { IMessageRaw } from "@rocket.chat/apps-engine/definition/messages/IMessageRaw";
import { sendEmail } from "./gmail";
import { ISummary } from "../definations/ISummary";
import { EmailBridgeApp } from "../EmailBridgeApp";

export async function chatSummary(
    app: EmailBridgeApp,
    user: IUser,
    room: IRoom,
    read: IRead,
    http: IHttp,
    recipients?: string[]
) {
    try {
        const messages = await getRoomMessages(room, read);

        if (!messages || messages.trim().length === 0) {
            await sendMessage(
                read,
                user,
                room,
                "There are no messages to summarize in this channel."
            );
            return;
        }

        const prompt = createSummaryPrompt(messages);
        await sendMessage(
            read,
            user,
            room,
            "Creating a summary of the chat..."
        );

        const response = await llm(http, prompt);
        const summary = JSON.parse(response) as ISummary;

        if (
            summary.subject === "out-of-context" ||
            summary.body === "out-of-context"
        ) {
            await sendMessage(
                read,
                user,
                room,
                "The summary is out of context. Please provide more specific chat."
            );
            return;
        } else {
            await sendMessage(read, user, room, summary.body);
        }

        if (recipients) {
            sendMessage(
                read,
                user,
                room,
                `Sending email to ${recipients.join(", ")}`
            );
            await sendMessage(
                read,
                user,
                room,
                `Subject: ${summary.subject}\n\n${summary.body}`
            );
            sendEmail(
                app,
                http,
                read,
                user,
                room,
                summary.subject,
                summary.body,
                recipients
            );
        }
    } catch (error) {
        console.error("Error in getUserContext:", error);
        throw new Error("Failed to get user context");
    }
}

async function getRoomMessages(room: IRoom, read: IRead): Promise<string> {
    const messages: IMessageRaw[] = await read
        .getRoomReader()
        .getMessages(room.id, {
            sort: { createdAt: "asc" },
        });

    return messages.map((message) => message.text).join("\n");
}
