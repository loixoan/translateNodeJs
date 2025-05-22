import express from 'express';
import {translate} from '@vitalets/google-translate-api';
import {HttpsProxyAgent} from 'https-proxy-agent';
import {GoogleGenAI} from "@google/genai";
import dotenv from 'dotenv';
const app = express();
app.use(express.json());
dotenv.config();

const proxyUrl = '';
const agent = new HttpsProxyAgent(proxyUrl);

app.post('/api/translate', async (req, res) => {
    const {txt, lang} = req.body;

    if (!txt || !lang) {
        return res.status(200).json({
            status: 'fail',
            error: 'Invalid request',
            data: null
        });
    }

    try {
        const {text} = await translate(txt, {
            to: lang,
            fetchOptions: {agent}
        });

        // ,
        //     fetchOptions: { agent }

        return res.status(200).json({
            status: text ? 'success' : 'fail',
            error: !text,
            data: text ? {text} : null
        });
    } catch (err) {
        return res.status(200).json({
            status: 'fail',
            error: true,
            message: err.message
        });
    }
});

app.get('/api/googleGemini/CallApi', async (req, res) => {
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    let text = "";
    const config = {
        thinkingConfig: {
            thinkingBudget: 0,
        },
        responseMimeType: 'application/json',
    };
    const model = 'gemini-2.5-flash-preview-04-17';
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: `Hãy so sánh ChatGPT Plus và Claude AI theo các tiêu chí sau: Kiến trúc, Mô hình đào tạo, Trọng tâm phát triển, Khả năng hiểu ngữ cảnh, Phong cách trả lời, Ứng dụng nổi bật, Nhà phát triển, Tính sẵn có.
                            Trả về kết quả ở định dạng JSON như sau: {
                              "tieu_chi": "",
                              "ChatGPT Plus": "",
                              "Claude AI": ""
                            }`,
                },
            ],
        }
    ];

    async function main() {
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });
        for await (const chunk of response) {
            text += chunk.text;
        }
    }

    await main();

    return res.status(200).json({
        status: text ? 'success' : 'fail',
        error: !text,
        data: text ? {text: JSON.parse(text)} : null
    });


})
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
