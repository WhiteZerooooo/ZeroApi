import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;

const TIMEOUT = 15 * 60 * 1000;
const lastPostTimes = {};
const emailSentFlags = {};
const mailOptionsGroup = {};

// 配置 bodyParser 中间件来解析 POST 请求的 JSON 数据
app.use(bodyParser.json());

// 在Express.js中
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 或者指定具体的域名
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.post('/simulate-click', async (req, res) => {
    const url = req.body.url;
    console.log(url)
    const randomIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    const userAgent = "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36";
    
    try {
        const response = await axios.get(url, {
            headers: {
                'X-Forwarded-For': randomIP(),
                'User-Agent': userAgent
            },
            timeout: 10000 // 设置请求超时时间为10秒
        });
        // console.log(response.data);
        res.send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            res.status(500).send('请求超时');
        } else {
            res.status(500).send('请求发生错误');
        }
    }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`应用程序正在监听端口 ${port}`);
});
