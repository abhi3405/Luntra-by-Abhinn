// Image Generation Service using multiple APIs
// Supports Hugging Face, Pollinations.ai, and local alternatives

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  modelUsed: string;
}

/**
 * Generate images using Pollinations.ai (free, no API key required)
 * This is a free alternative that generates images on-the-fly
 */
export const generateImageUsingPollinations = async (prompt: string): Promise<GeneratedImage> => {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    // Using Pollinations.ai which provides free image generation
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    
    return {
      id: Date.now().toString(),
      url: imageUrl,
      prompt,
      timestamp: Date.now(),
      modelUsed: 'Pollinations.ai'
    };
  } catch (error) {
    console.error('Error generating image via Pollinations:', error);
    throw new Error('Failed to generate image');
  }
};

/**
 * Generate images using Hugging Face Inference API
 * Requires HF_API_KEY environment variable
 */
export const generateImageUsingHuggingFace = async (prompt: string): Promise<GeneratedImage> => {
  try {
    const apiKey = process.env.REACT_APP_HF_API_KEY;
    
    if (!apiKey) {
      console.warn('HuggingFace API key not found, falling back to Pollinations');
      return generateImageUsingPollinations(prompt);
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large',
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`);
    }

    const imageBlob = await response.blob();
    const imageUrl = URL.createObjectURL(imageBlob);

    return {
      id: Date.now().toString(),
      url: imageUrl,
      prompt,
      timestamp: Date.now(),
      modelUsed: 'Stable Diffusion 3.5'
    };
  } catch (error) {
    console.error('Error generating image via HuggingFace:', error);
    // Fallback to Pollinations
    return generateImageUsingPollinations(prompt);
  }
};

/**
 * Main function to generate images - uses best available option
 */
export const generateImage = async (prompt: string): Promise<GeneratedImage> => {
  if (!prompt.trim()) {
    throw new Error('Prompt cannot be empty');
  }

  // Use Pollinations by default (free, no key required)
  // You can switch to HuggingFace if you have an API key
  return generateImageUsingPollinations(prompt);
};

/**
 * Generate multiple images with slight variations
 */
export const generateMultipleImages = async (
  prompt: string,
  count: number = 2
): Promise<GeneratedImage[]> => {
  const promises = Array(count)
    .fill(null)
    .map((_, i) =>
      generateImageUsingPollinations(`${prompt} (variation ${i + 1})`).catch(() => null)
    );

  const results = await Promise.all(promises);
  return results.filter((img) => img !== null) as GeneratedImage[];
};
