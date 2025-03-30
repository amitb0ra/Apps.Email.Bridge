import {
    IRead,
    IHttp,
    IPersistence,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { sendMessage } from "../helpers/message";
import { createSummaryPrompt } from "../constants/prompts";
import { llm } from "../helpers/llmProvider";
import { IMessageRaw } from "@rocket.chat/apps-engine/definition/messages/IMessageRaw";
import { ISummary } from "../definations/ISummary";
import { set } from "../helpers/persistence";

export async function chatSummary(
    user: IUser,
    room: IRoom,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    threadId?: string
) {
    try {
        let messages: string;
        if (threadId) {
            messages = await getThreadMessages(room, read, user, threadId);
            console.log("Thread messages: ", messages);
        } else {
            messages = await getRoomMessages(room, read);
        }

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
            await set(persistence, `${user.id}#SUMMARY`, summary);
            await sendMessage(read, user, room, summary.body);
        }
    } catch (error) {
        console.error("Error in chatSummary:", error);
        throw new Error("Failed to get chat summary");
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

async function getThreadMessages(
    room: IRoom,
    read: IRead,
    user: IUser,
    threadId: string
): Promise<string> {
    const thread = await read.getThreadReader().getThreadById(threadId);

    if (!thread) {
        await sendMessage(read, user, room, "Thread not found");
        throw new Error("Thread not found");
    }

    const messages = thread
        .filter((message) => message.text)
        .map((message) => message.text);

    if (messages.length > 1 && messages[0] === messages[1]) {
        messages.shift();
    }

    return messages.join("\n");
}
