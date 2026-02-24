import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function generate() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'Dark navy blue futuristic AI marketing background with glowing green particle trails, curved light streaks flowing from right side, digital constellation dots and lines, subtle holographic grid, premium SaaS landing page hero background, smooth gradient lighting, minimal and elegant, cinematic glow, modern startup aesthetic, clean space for headline text, ultra high resolution, 16:9, realistic digital art',
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, 'hero-bg.jpeg'), Buffer.from(base64Data, 'base64'));
        console.log('Image successfully generated and saved to public/hero-bg.jpeg');
        return;
      }
    }
    console.log('No image data found in the response.');
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

generate();
