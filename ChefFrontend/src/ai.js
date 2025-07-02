import { HfInference } from '@huggingface/inference'

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`

// Make sure you set an environment variable in Scrimba 
// for HF_ACCESS_TOKEN
const hf = new HfInference(import.meta.env.VITE_HF_ACCESS_TOKEN)

export async function getRecipeFromMistral(ingredientsArr) {
    console.log("ingredientsArr", ingredientsArr)
    const ingredientsString = ingredientsArr.join(", ")
    try {
        const response = await hf.chatCompletion({
            model: "HuggingFaceH4/zephyr-7b-beta",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
            ],
            max_tokens: 1024,
        })
        return response.choices[0].message.content
    } catch (err) {
        console.error("AI API error:", err.message)
        
        // check if the quota is exceeded
        if (err.message.includes("403") || err.message.includes("Forbidden") || err.message.includes("Quota exceeded")) {
            throw new Error("API quota exceeded. Please try again later or upgrade your plan.")
        }
        
        // check if the model is unavailable
        if (err.message.includes("404") || err.message.includes("Not Found")) {
            throw new Error("AI model is currently unavailable. Please try again later.")
        }
        
        // other error
        throw new Error("Failed to generate recipe. Please try again later.")
    }
}