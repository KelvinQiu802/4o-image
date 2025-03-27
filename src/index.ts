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
    console.error('请提供图片路径作为参数');
    process.exit(1);
}

async function main() {
    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-all',
            messages: [{
                role: 'user', content: [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": `data:image/png;base64,${image2Base64(imagePath)}`
                        }
                    },
                    {
                        "type": "text",
                        "text": GHIBILI
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
        console.error('处理图片时发生错误:', error);
        process.exit(1);
    }
}

main();
