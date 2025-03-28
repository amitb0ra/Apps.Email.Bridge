import { IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { BlockBuilder } from "@rocket.chat/apps-engine/definition/uikit";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function sendMessage(
    read: IRead,
    user: IUser,
    room: IRoom,
    message: string,
    blocks?: BlockBuilder,
    threadId?: string | null
): Promise<void> {
    const notifier = read.getNotifier();

    const messageBuilder = notifier.getMessageBuilder();
    messageBuilder.setText(message);
    messageBuilder.setRoom(room);

    if (threadId) {
        messageBuilder.setThreadId(threadId);
    }

    if (blocks) {
        messageBuilder.setBlocks(blocks);
    }

    return notifier.notifyUser(user, messageBuilder.getMessage());
}
