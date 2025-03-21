import { IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { GetExecutionContextFromUserPrompt } from "../constants/prompts";
import { IExecutionContext } from "../definations/IExecutionContext";
import { llm } from "../helpers/llmProvider";

export async function getExecutionContext(
    http: IHttp,
    userPrompt: string
): Promise<IExecutionContext> {
    try {
        const prompt = GetExecutionContextFromUserPrompt(userPrompt);
        const response = await llm(http, prompt);

        return JSON.parse(response) as IExecutionContext;
    } catch (error) {
        console.error("Error in getUserContext:", error);
        throw new Error("Failed to get user context");
    }
}
