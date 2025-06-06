import express from 'express';
import {translate} from '@vitalets/google-translate-api';
import {HttpsProxyAgent} from 'https-proxy-agent';
import {GoogleGenAI} from "@google/genai";
import dotenv from 'dotenv';
import {modelGemini} from "./model.js";
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

app.post('/api/googleGemini/CallApi', async (req, res) => {
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const {txt} = req.body;
    let text = "";
    const config = {
        thinkingConfig: {
            thinkingBudget: 0,
        },
        responseMimeType: 'application/json',
    };
    const model = modelGemini.flash;
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: txt,
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
            console.log(chunk.text)
            text += chunk.text;
        }
    }

    await main();
    console.log("text: "+ text)
    return res.status(200).json({
        status: text ? 'success' : 'fail',
        error: !text,
        data: text ? JSON.parse(text) : null
    });


})
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
