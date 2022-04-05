'use strict';

const express = require('express');
const line = require('@line/bot-sdk');

// Steinを利用するための準備
const SteinStore = require('stein-js-client');
const store = new SteinStore('https://api.steinhq.com/v1/storages/624b4abf4906bb0537380523');

const PORT = process.env.PORT || 3002;

// Messaging APIを利用するための鍵を設定します。
const config = {
  channelSecret: '6873f2bdc8b11e69ffc57c8fc8e2798d',
  channelAccessToken: 'JPJGtk+3rS1wsJM1FZnSSC4bMLJevwZE3JRcmW39C7G4uB+32P0mVep5jkT6S2TYCpSiqst6JBp1OFaDCbd7pg6b349yBZCL+p5uqC3ysLHTaXaCvRG9UvZypFMAxSnuyOosN0NVrRosev0cEv5jQwdB04t89/1O/w1cDnyilFU='
};

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // シート名`シート1`の`Message`列に、LINE Botに送信したメッセージを書き込む。
  await store.append("シート1", [
    {
      Message: event.message.text,
    }
  ]);

  // ユーザーにリプライメッセージを送ります。
  return client.replyMessage(event.replyToken, {
    type: 'text', // テキストメッセージ
    text: event.message.text // ← ここに入れた言葉が実際に返信されます
    // event.message.text には、受信したメッセージが入っているので、それをそのまま返信しています
    // ここを 'テスト' のように書き換えると、何を受信しても「テスト」と返すようになります
  });
}

const app = express();
app.get('/', (req, res) => res.send('Hello LINE BOT! (HTTP GET)'));
app.post('/webhook', line.middleware(config), (req, res) => {

  if (req.body.events.length === 0) {
    res.send('Hello LINE BOT! (HTTP POST)');
    console.log('検証イベントを受信しました！');
    return;
  } else {
    console.log('受信しました:', req.body.events);
  }

  Promise.all(req.body.events.map(handleEvent)).then((result) => res.json(result));
});

app.listen(PORT);
console.log(`ポート${PORT}番でExpressサーバーを実行中です…`);