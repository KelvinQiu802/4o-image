import 'dotenv/config';

import { OpenAI } from 'openai';
import { GHIBILI } from './prompt';
import { image2Base64 } from './utils';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

const imagePath = process.argv[2];

if (!imagePath) {
    console.error('Please provide an image path as an argument');
    process.exit(1);
}

const imageType = imagePath.split('.').pop();
async function main() {
    try {
        console.log("Start")
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-all',
            messages: [{
                role: 'user', content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/${imageType};base64,${image2Base64(imagePath)}`
                        }
                    },
                    {
                        type: "text",
                        text: GHIBILI
                    },
                ]
            }],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                process.stdout.write(content);
            }
        }
        process.stdout.write('\n');
    } catch (error) {
        console.error('Error processing image:', error);
        process.exit(1);
    }
}

main();
