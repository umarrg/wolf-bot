require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const axios = require("axios");
const sdk = require('@api/leonardoai');
const Jimp = require('jimp');
const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const PORT = process.env.PORT || 9000
sdk.auth(process.env.SDK);
app.use(express.json());
app.use(express.urlencoded({ extended: true, }));
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', payload: "Image Generation Bot" });
});



const commands = [
    { command: '/start', description: 'Start the bot' },
    { command: '/help', description: 'Display this help message' },
    { command: '/imagine', description: 'Generate an image based on the provided prompt' },

];

bot.setMyCommands(commands);

bot.onText(/\/start/, (msg, match) => {
    let name = msg.chat.first_name;

    const chatId = msg.chat.id;
    const welcomeMessage = `Hey ${name}! \n \nWelcome to the bot! Here are some commands you can use: \n \n - /start: Start the bot \n - /help: Display this help message   \n - /imagine: Generate an image from prompt /imagine < prompt >  \nyou can just chat with the bot and it will respond to you.  \n\nIf you have any questions or need assistance, feel free to ask! \n  \nDon't forget to check us out on Twitter and Telegram`;

    const inlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Twitter', url: 'https://twitter.com/' },

                ],
                [
                    { text: 'Telegram', url: 'https://t.me/' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, inlineKeyboard);
});


bot.onText(/\/help/, (msg, match) => {
    let name = msg.chat.first_name;
    const chatId = msg.chat.id;
    const welcomeMessage = `Hey ${name}! \n \nWelcome to the bot! Here are some commands you can use: \n \n - /start: Start the bot \n - /help: Display this help message  \n -  \n - /image: Generate an image from prompt /image < prompt >   \n  \nyou can just chat with the bot and it will respond to you.  \n\nIf you have any questions or need assistance, feel free to ask! \n  \nDon't forget to check us out on Twitter and Telegram`;

    const inlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Twitter', url: 'https://twitter.com/' },

                ],
                [
                    { text: 'Telegram', url: 'https://t.me/' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, inlineKeyboard);
});



// bot.onText(/\/image (.+)/, async (msg, match) => {
//     const chatId = msg.chat.id;
//     const prompt = match[1];

//     const loadingGif = 'https://firebasestorage.googleapis.com/v0/b/contactme-2970e.appspot.com/o/vid2.mp4?alt=media&token=112e3c20-fd42-4116-b9f5-c54e3bac0301';
//     const generatingMessage = await bot.sendAnimation(chatId, loadingGif);

//     try {
//         const { data } = await sdk.createGeneration({

//             height: 512,
//             // modelId: 'aa77f04e-3eec-4034-9c07-d0f619684628',
//             modelId: '463b2ee3-5d92-4221-a75d-ca737d339f99',
//             num_images: 1,
//             presetStyle: 'DYNAMIC',
//             prompt: prompt,
//             alchemy: true,

//             width: 512,
//             negative_prompt: 'deformed, blurry, bad anatomy, bad eyes, crossed eyes, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long neck, long body, mutated hands and fingers, out of frame,  cropped, low-res, close-up, double heads, too many fingers, ugly face,plastic, repetitive, black and white, grainy'
//         });



//         const generationId = data.sdGenerationJob.generationId;

//         setTimeout(async () => {
//             try {
//                 const genData = await sdk.getGenerationById({ id: generationId });
//                 const imageUrl = genData.data.generations_by_pk.generated_images[0].url;
//                 await bot.sendPhoto(chatId, imageUrl);
//             } catch (error) {
//                 console.error(error);
//                 await bot.sendMessage(chatId, "Error retrieving generated image.");
//             }
//         }, 50000);

//     } catch (err) {
//         console.error(err);
//         await bot.sendMessage(chatId, "Failed to generate image.");
//     } finally {
//         setTimeout(async () => {
//             await bot.deleteMessage(chatId, generatingMessage.message_id);

//         }, 50000);
//     }
// });
bot.onText(/\/imagine (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const prompt = match[1];

    const loadingGif = 'https://firebasestorage.googleapis.com/v0/b/contactme-2970e.appspot.com/o/vid2.mp4?alt=media&token=112e3c20-fd42-4116-b9f5-c54e3bac0301';
    const generatingMessage = await bot.sendAnimation(chatId, loadingGif);

    try {
        const { data } = await sdk.createGeneration({
            height: 512,
            modelId: 'bece1b41-8cb1-4cf1-892b-7986fcd75671',
            num_images: 1,
            presetStyle: 'DYNAMIC',
            prompt: prompt,
            alchemy: true,
            seed: "4374540535",
            width: 512,
            negative_prompt: 'deformed, blurry, bad anatomy, bad eyes, crossed eyes, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long neck, long body, mutated hands and fingers, out of frame, cropped, low-res, close-up, double heads, too many fingers, ugly face,plastic, repetitive, black and white, grainy'
        });

        const generationId = data.sdGenerationJob.generationId;

        setTimeout(async () => {
            try {
                const genData = await sdk.getGenerationById({ id: generationId });
                const imageUrl = genData.data.generations_by_pk.generated_images[0].url;

                const image = await Jimp.read(imageUrl);

                const watermarkText = 'LandWolf_Base';
                const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

                const textWidth = Jimp.measureText(font, watermarkText);
                const textHeight = Jimp.measureTextHeight(font, watermarkText, textWidth);

                const x = image.bitmap.width - textWidth - 10;
                const y = image.bitmap.height - textHeight - 10;

                image.print(font, x, y, watermarkText);

                const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

                await bot.sendPhoto(chatId, buffer);
            } catch (error) {
                console.error(error);
                await bot.sendMessage(chatId, "Error retrieving or modifying generated image.");
            }
        }, 50000);

    } catch (err) {
        console.error(err);
        await bot.sendMessage(chatId, "Failed to generate image.");
    } finally {
        setTimeout(async () => {
            await bot.deleteMessage(chatId, generatingMessage.message_id);
        }, 50000);
    }
});


bot.onText(/\/seed (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const prompt = match[1];

    const loadingGif = 'https://firebasestorage.googleapis.com/v0/b/contactme-2970e.appspot.com/o/vid2.mp4?alt=media&token=112e3c20-fd42-4116-b9f5-c54e3bac0301';
    const generatingMessage = await bot.sendAnimation(chatId, loadingGif);

    try {
        // Request image generation from Leonardo AI
        const response = await axios.post('https://cloud.leonardo.ai/api/rest/v1/generations', {
            height: 512,
            modelId: 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Kino XL
            prompt: prompt,
            presetStyle: 'CINEMATIC',
            width: 1024,
            photoReal: true,
            photoRealVersion: 'v2',
            alchemy: true,
            controlnets: [
                {
                    initImageId: 'process.env.SDK', // Replace with actual image ID
                    initImageType: 'GENERATED',
                    preprocessorId: 67, // Style Reference ID
                    strengthType: 'High',
                    influence: 0.39
                },
                {
                    initImageId: 'YOUR_INIT_IMAGE_ID', // Replace with actual image ID
                    initImageType: 'UPLOADED',
                    preprocessorId: 67,
                    strengthType: 'High',
                    influence: 0.64
                }
            ],
            negative_prompt: 'deformed, blurry, bad anatomy, bad eyes, crossed eyes, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long neck, long body, mutated hands and fingers, out of frame, cropped, low-res, close-up, double heads, too many fingers, ugly face,plastic, repetitive, black and white, grainy'
        }, {
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${process.env.SDK}`,
                'content-type': 'application/json'
            }
        });

        const generationId = response.data.generationId;

        setTimeout(async () => {
            try {
                // Fetch the generated image
                const genData = await axios.get(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                    headers: {
                        'accept': 'application/json',
                        'authorization': `Bearer ${process.env.SDK}`
                    }
                });

                const imageUrl = genData.data.generations_by_pk.generated_images[0].url;

                // Load the image with Jimp
                const image = await Jimp.read(imageUrl);

                // Add watermark to the image
                const watermarkText = 'LandWolf_Base';
                const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

                const textWidth = Jimp.measureText(font, watermarkText);
                const textHeight = Jimp.measureTextHeight(font, watermarkText, textWidth);

                const x = image.bitmap.width - textWidth - 10;
                const y = image.bitmap.height - textHeight - 10;

                image.print(font, x, y, watermarkText);

                const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

                // Send the watermarked image back to the user
                await bot.sendPhoto(chatId, buffer);
            } catch (error) {
                console.error(error);
                await bot.sendMessage(chatId, "Error retrieving or modifying generated image.");
            }
        }, 50000);

    } catch (err) {
        console.error(err);
        await bot.sendMessage(chatId, "Failed to generate image.");
    } finally {
        setTimeout(async () => {
            await bot.deleteMessage(chatId, generatingMessage.message_id);
        }, 50000);
    }
});

app.listen(PORT, () => {
    console.log('Bot listening on port ' + PORT)
});