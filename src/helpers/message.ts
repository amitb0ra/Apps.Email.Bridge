import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import { BlockBuilder } from "@rocket.chat/apps-engine/definition/uikit";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { WELCOME_MESSAGE } from "../constants/dialogue";

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

export async function sendHelperMessageOnInstall(
    user: IUser,
    read: IRead,
    modify: IModify
) {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const members = [user.username, appUser.username];

    const room = await getOrCreateDirectRoom(read, modify, members);

    const textMessageBuilder = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setGroupable(true)
        .setParseUrls(false)
        .setText(WELCOME_MESSAGE);

    await modify.getCreator().finish(textMessageBuilder);
}

export async function getOrCreateDirectRoom(
    read: IRead,
    modify: IModify,
    usernames: Array<string>
): Promise<IRoom> {
    let room: IRoom | undefined = await read
        .getRoomReader()
        .getDirectByUsernames(usernames);

    if (room) {
        return room;
    }

    const creator = (await read.getUserReader().getAppUser()) as IUser;
    const newRoom = modify
        .getCreator()
        .startRoom()
        .setType(RoomType.DIRECT_MESSAGE)
        .setCreator(creator)
        .setMembersToBeAddedByUsernames(usernames);

    const roomId = await modify.getCreator().finish(newRoom);
    return (await read.getRoomReader().getById(roomId)) as IRoom;
}
