import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms/IRoom";
import { EmailBridgeApp } from "../../EmailBridgeApp";
import { sendMessage } from "../helpers/message";

export async function sendEmail(
    app: EmailBridgeApp,
    http: IHttp,
    read: IRead,
    user: IUser,
    room: IRoom,
    subject: string,
    body: string,
    recipients: string[]
): Promise<void> {
    const accessToken = await app
        .getOauth2ClientInstance()
        .getAccessTokenForUser(user);

    if (!accessToken) {
        await sendMessage(
            read,
            user,
            room,
            "Access token not found. Please reauthorize the app."
        );
        throw new Error("Access token not found");
    }

    if (!recipients || recipients.length === 0) {
        await sendMessage(
            read,
            user,
            room,
            "No recipients provided. Please specify at least one recipient."
        );
        throw new Error("No recipients provided");
    }

    const emailContent = [
        `To: ${recipients.join(", ")}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=UTF-8`,
        "",
        body,
    ].join("\n");

    const base64EncodedEmail = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    try {
        const response = await http.post(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            {
                headers: {
                    Authorization: `Bearer ${accessToken.token}`,
                    "Content-Type": "application/json",
                },
                content: JSON.stringify({
                    raw: base64EncodedEmail,
                }),
            }
        );

        if (response.statusCode === 200) {
            await sendMessage(read, user, room, "✅ Email sent successfully!");
        } else {
            console.error(
                "Failed to send email:",
                response.data || response.content
            );
            await sendMessage(
                read,
                user,
                room,
                `❌ Failed to send email. Status code: ${response.statusCode}`
            );
            throw new Error(
                `Failed to send email. Status code: ${response.statusCode}`
            );
        }
    } catch (error) {
        console.error("Error in sendEmail:", error);
        await sendMessage(
            read,
            user,
            room,
            "❌ An error occurred while sending the email. Please try again later."
        );
        throw new Error("Failed to send email");
    }
}

export async function searchEmail(
    app: EmailBridgeApp,
    http: IHttp,
    read: IRead,
    user: IUser,
    room: IRoom,
    modify: IModify,
    keywords?: string[],
    startDate?: Date,
    endDate?: Date,
    maxResults: number = 100
) {
    const accessToken = await app
        .getOauth2ClientInstance()
        .getAccessTokenForUser(user);

    if (!accessToken) {
        sendMessage(
            read,
            user,
            room,
            "Access token not found. Please reauthorize the app."
        );
        throw new Error("Access token not found");
    }

    const query = keywords ? keywords.join(" ") : "";
    const startDateStr = startDate
        ? `after:${startDate.toISOString().split("T")[0]}`
        : "";
    const endDateStr = endDate
        ? `before:${endDate.toISOString().split("T")[0]}`
        : "";
    const searchQuery = [query, startDateStr, endDateStr]
        .filter(Boolean)
        .join(" ");

    const params = new URLSearchParams({
        q: searchQuery,
        maxResults: maxResults.toString(),
    });

    await sendMessage(read, user, room, "Searching emails, please wait...");

    try {
        const response = await http.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken.token}`,
                },
            }
        );

        console.log("Search response: ", response);

        if (response.statusCode === 200 && response.data.messages) {
            const messages = response.data.messages;
            for (const message of messages) {
                const messageDetails = await http.get(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken.token}`,
                        },
                    }
                );

                console.log("Message details: ", messageDetails);

                if (messageDetails.statusCode === 200) {
                    const payload = messageDetails.data.payload;
                    const headers = payload.headers;
                    const subjectHeader = headers.find(
                        (h: any) => h.name === "Subject"
                    );
                    const subject = subjectHeader
                        ? subjectHeader.value
                        : "No Subject";
                    const bodyPart = payload.parts?.find(
                        (p: any) => p.mimeType === "text/plain"
                    );
                    const body =
                        messageDetails.data.snippet || bodyPart
                            ? atob(
                                  bodyPart.body.data
                                      .replace(/-/g, "+")
                                      .replace(/_/g, "/")
                              )
                            : "No Body";

                    const attachments = payload.parts?.filter(
                        (p: any) => p.filename && p.body.attachmentId
                    );

                    if (attachments && attachments.length > 0) {
                        const attachmentIds = attachments.map(
                            (attachment: any) => attachment.body.attachmentId
                        );

                        for (const attachmentId of attachmentIds) {
                            await getAttachment(
                                app,
                                http,
                                read,
                                user,
                                room,
                                modify,
                                message.id,
                                attachmentId
                            );
                        }
                    }

                    await sendMessage(
                        read,
                        user,
                        room,
                        `Subject: ${subject}\n\nBody:\n${body}`
                    );
                } else {
                    console.error(
                        `Failed to fetch message details for ID: ${message.id}`,
                        messageDetails.data || messageDetails.content
                    );
                }
            }
        } else {
            sendMessage(
                read,
                user,
                room,
                "No emails found matching the search criteria."
            );
        }
    } catch (error) {
        console.error("Error in searchEmail", error);
        sendMessage(
            read,
            user,
            room,
            "An error occurred while searching for emails."
        );
        throw new Error("Failed to search emails");
    }
}

export async function getReport(
    app: EmailBridgeApp,
    http: IHttp,
    read: IRead,
    user: IUser,
    room: IRoom
) {
    const accessToken = await app
        .getOauth2ClientInstance()
        .getAccessTokenForUser(user);

    if (!accessToken) {
        sendMessage(
            read,
            user,
            room,
            "Access token not found. Please reauthorize the app."
        );
        throw new Error("Access token not found");
    }

    await sendMessage(read, user, room, "Generating report, please wait...");

    try {
        const response = await http.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            {
                headers: {
                    Authorization: `Bearer ${accessToken.token}`,
                },
            }
        );

        if (response.statusCode === 200 && response.data) {
            const totalEmails = response.data.resultSizeEstimate || 0;

            sendMessage(
                read,
                user,
                room,
                `📊 Email Statistics:\n\nTotal Emails: ${totalEmails}`
            );
        } else {
            console.error(
                "Failed to fetch email statistics:",
                response.data || response.content
            );
            sendMessage(
                read,
                user,
                room,
                "Failed to fetch email statistics. Please try again later."
            );
        }
    } catch (error) {
        console.error("Error in getReport function:", error);
        sendMessage(
            read,
            user,
            room,
            "An error occurred while fetching email statistics."
        );
        throw new Error("Failed to fetch email statistics");
    }
}

export async function getAttachment(
    app: EmailBridgeApp,
    http: IHttp,
    read: IRead,
    user: IUser,
    room: IRoom,
    modify: IModify,
    messageId: string,
    attachmentId: string
) {
    const accessToken = await app
        .getOauth2ClientInstance()
        .getAccessTokenForUser(user);

    if (!accessToken) {
        sendMessage(
            read,
            user,
            room,
            "Access token not found. Please reauthorize the app."
        );
        throw new Error("Access token not found");
    }

    await sendMessage(read, user, room, "Fetching attachments, please wait...");

    try {
        const attachmentResponse = await http.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken.token}`,
                },
            }
        );

        if (attachmentResponse.statusCode === 200 && attachmentResponse.data) {
            const attachmentData = attachmentResponse.data.data;
            const url = `data:application/octet-stream;base64,${attachmentData}`;
            const downloadBlock = modify.getCreator().getBlockBuilder();

            downloadBlock.addActionsBlock({
                elements: [
                    downloadBlock.newButtonElement({
                        actionId: "authorize",
                        text: downloadBlock.newPlainTextObject(
                            "Download Attachment"
                        ),
                        url: url.toString(),
                    }),
                ],
            });

            await sendMessage(
                read,
                user,
                room,
                `Attachment fetched successfully!`,
                downloadBlock
            );
        } else {
            console.error("Failed to fetch attachment");
            await sendMessage(
                read,
                user,
                room,
                "Failed to fetch attachment. Please try again later."
            );
        }
    } catch (error) {
        console.error("Error in getAttachment function:", error);
        await sendMessage(
            read,
            user,
            room,
            "An error occurred while fetching the attachment."
        );
        throw new Error("Failed to fetch attachment");
    }
}
