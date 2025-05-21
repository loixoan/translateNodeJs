import express from 'express';
import { translate } from '@vitalets/google-translate-api';
// import { HttpsProxyAgent } from 'https-proxy-agent';

const app = express();
app.use(express.json());

// const proxyUrl = 'http://brd-customer-hl_ba3dd393-zone-nam_proxy_taob:pjxzc52s5fg1@zproxy.lum-superproxy.io:22225';
// const agent = new HttpsProxyAgent(proxyUrl);

app.post('/api/translate111', async (req, res) => {
    const { txt, lang } = req.body;

    if (!txt || !lang) {
        return res.status(200).json({
            status: 'fail',
            error: 'Invalid request',
            data: null
        });
    }

    try {
        const { text } = await translate(txt, {
            to: lang
        });

    // ,
    //     fetchOptions: { agent }

        return res.status(200).json({
            status: text ? 'success' : 'fail',
            error: !text,
            data: text ? { text } : null
        });
    } catch (err) {
        return res.status(200).json({
            status: 'fail',
            error: true,
            message: err.message
        });
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
