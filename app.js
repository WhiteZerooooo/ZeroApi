const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

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

// 配置 Nodemailer 以发送电子邮件，使用QQ邮箱的SMTP设置
const transporter = nodemailer.createTransport({
  service: '163', // 使用QQ邮箱的服务
  auth: {
    user: 'n1345913800@163.com', // 你的QQ邮箱地址
    pass: 'LKAAHIZRILOTLYOG' // 你的QQ邮箱授权码
  }
});

// 处理 POST 请求
app.post('/send-email', (req, res) => {
  const { to, subject, text } = req.body;
  const toEmail = "食之契约受害者<" + to + ">"; // 设置昵称并包含完整的收件人地址
  console.log(to)
  console.log(text)

  // 创建邮件对象
  const mailOptions = {
    from: '小兔子<n1345913800@163.com>', // 你的QQ邮箱地址
    to: toEmail,
    subject,
    text
  };

  const mailOptions2 = {
    from: '小兔子<n1345913800@163.com>', // 你的QQ邮箱地址
    to: "食之契约受害者<1345913800@qq.com>",
    subject,
    text
  };

  // 发送邮件
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('邮件发送失败');
    } else {
      console.log('邮件已发送: ' + info.response);
      res.status(200).send('邮件已成功发送');
    }
  });
  // 发送邮件
  transporter.sendMail(mailOptions2, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('邮件发送失败');
    } else {
      console.log('邮件已发送: ' + info.response);
      res.status(200).send('邮件已成功发送');
    }
  });
});

app.post('/start-timer', (req, res) => {
  const { to, subject, text, playerID } = req.body;
  const toEmail = "食之契约受害者<" + to + ">"; // 设置昵称并包含完整的收件人地址
  mailOptionsGroup[playerID] = {
    from: '小兔子<n1345913800@163.com>', // 你的QQ邮箱地址
    to: toEmail,
    subject,
    text
  };
  if (emailSentFlags[playerID]) {
    emailSentFlags[playerID] = false;
  } else {
    lastPostTimes[playerID] = Date.now();
  }
  console.log("开始计时" + playerID)
});

app.post('/simulate-click', async (req, res) => {
    const url = req.body.url;
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

function checkInactivity() {
  const currentTime = Date.now();
  for (const playerID in lastPostTimes) {
    if (!emailSentFlags[playerID] && currentTime - lastPostTimes[playerID] >= TIMEOUT) {
      transporter.sendMail(mailOptionsGroup[playerID], (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
          emailSentFlags[playerID] = true;
          delete lastPostTimes[playerID];
        }
      });
    } else {
      const TimeNum = currentTime - lastPostTimes[playerID];
      console.log(playerID + ":" + TimeNum)
    }
  }
}

function getFormattedTime() {
    const now = new Date();
    let timeStr = '';
 
    // 月份
    timeStr += (now.getMonth() + 1).toString().padStart(2, '0');
    // 日
    timeStr += now.getDate().toString().padStart(2, '0');
    // 时
    timeStr += now.getHours().toString().padStart(2, '0');
    // 分
    timeStr += now.getMinutes().toString().padStart(2, '0');
    // 秒
    timeStr += now.getSeconds().toString().padStart(2, '0');
 
    return timeStr;
}

app.listen(port, () => {
  console.log(`应用程序正在监听端口 ${port}`);
  setInterval(checkInactivity, 60000);
});
