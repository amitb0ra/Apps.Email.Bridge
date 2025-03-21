import {
    IHttp,
    IHttpResponse,
} from "@rocket.chat/apps-engine/definition/accessors";

export async function llm(http: IHttp, prompt: string): Promise<string> {
    const body = {
        model: "llama3",
        messages: [
            {
                role: "system",
                content: prompt,
            },
        ],
        temperature: 0,
    };

    try {
        const response: IHttpResponse = await http.post(
            `http://host.docker.internal:11434/v1/chat/completions`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                content: JSON.stringify(body),
            }
        );

        if (!response || !response.data) {
            console.error("No response data received from AI.");
            return "No response data received from AI.";
        }

        const { choices } = response.data;
        return choices[0].message.content;
    } catch (error) {
        console.error("Error in llmProvider", error);
        throw new Error("Failed to get response from LLM");
    }
}
