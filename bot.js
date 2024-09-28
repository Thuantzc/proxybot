const axios = require('axios');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');


const TELEGRAM_TOKEN = 'API BOT TELGRAM';


const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// List of proxy URLs
const proxyUrls = [
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
  'https://github.com/themiralay/Proxy-List-World/raw/master/data.txt',
  'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt',
  'https://github.com/TuanMinPay/live-proxy/raw/master/all.txt',
  'https://github.com/andigwandi/free-proxy/raw/main/proxy_list.txt',

];


async function fetchProxies(url) {
  try {
    const response = await axios.get(url);
    const proxies = response.data.split('\n').filter(line => line.trim() !== '');
    return proxies;
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error.message);
    throw new Error(`Error fetching proxies from ${url}`);
  }
}

async function fetchAllProxies() {
  const allProxies = [];

  for (const url of proxyUrls) {
    try {
      const proxies = await fetchProxies(url);
      allProxies.push(...proxies);
    } catch (error) {
      console.error(error.message);
      
    }
  }

  return allProxies;
}


async function saveProxiesToFile(proxies) {
  const filePath = './proxies.txt';
  fs.writeFileSync(filePath, proxies.join('\n'), 'utf8');
  console.log(`Saved ${proxies.length} proxies to ${filePath}`);
  return filePath;
}


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim().toLowerCase();

  try {
    
    if (text === '/getid') {
      bot.sendMessage(chatId, `Your Telegram ID is: ${chatId}`);
    } 

    
    else if (text === '/getproxy') {
      bot.sendMessage(chatId, 'Fetching proxies, please wait...');
      const proxies = await fetchAllProxies();
      if (proxies.length) {
        const filePath = await saveProxiesToFile(proxies);
        await bot.sendDocument(chatId, filePath);
      } else {
        bot.sendMessage(chatId, 'No proxies found.');
      }
    } 

    
    else {
      bot.sendMessage(chatId, `Welcome to the bot! Available commands:
- /getid: Get your Telegram ID.
- /getproxy: Fetch and send proxies as a file.`);
    }
  } catch (error) {
    
    console.error('An error occurred:', error.message);
    bot.sendMessage(chatId, `An error occurred: ${error.message}`);
  }
});

