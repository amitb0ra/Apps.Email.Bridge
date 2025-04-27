import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { EmailBridgeApp } from "../../EmailBridgeApp";
import { get, set } from "../helpers/persistence";
import { sendMessage } from "../helpers/message";
import { sendEmail } from "../actions/gmail";

export class ExecuteViewSubmitHandler {
    constructor(
        private readonly app: EmailBridgeApp,
        private readonly read: IRead,
        private readonly http: IHttp,
        private readonly modify: IModify,
        private readonly persistence: IPersistence
    ) {}

    public async run(context: UIKitViewSubmitInteractionContext) {
        const { user, view } = context.getInteractionData();

        if (!user) {
            return {
                success: false,
                error: "No user found",
            };
        }

        const { roomId } = await get(
            this.read.getPersistenceReader(),
            `${user.id}#ROOM_ID_KEY`
        );

        if (!roomId) {
            return {
                success: false,
                error: "No room to send a message",
            };
        }

        let room = (await this.read.getRoomReader().getById(roomId)) as IRoom;

        try {
            switch (view.id) {
                case "ConfirmSendEmail": {
                    console.log("ConfirmSendEmail");

                    const subject =
                        view.state?.["subjectBlockId"]["subjectBlockId"] || "";
                    const body =
                        view.state?.["bodyBlockId"]["bodyBlockId"] || "";
                    const recipients =
                        view.state?.["recipientsBlockId"][
                            "recipientsBlockId"
                        ] || [];

                    await sendEmail(
                        this.app,
                        this.http,
                        this.read,
                        user,
                        room,
                        subject as string,
                        body as string,
                        recipients
                            .split(",")
                            .map((recipient: string) => recipient.trim())
                    );
                    break;
                }
            }

            return context.getInteractionResponder().successResponse();
        } catch (e) {
            await sendMessage(this.read, user, room, `Error occurred: ${e}`);
            return context.getInteractionResponder().errorResponse();
        }
    }
}
