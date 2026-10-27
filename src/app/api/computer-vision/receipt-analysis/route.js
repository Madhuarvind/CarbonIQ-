export const dynamic = "force-static";

import { createWorker } from 'tesseract.js';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import multer from 'multer';
import sharp from 'sharp';
import { NextResponse } from 'next/server';

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Initialize Google Cloud Vision client
const visionClient = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY_FILE
});

// Carbon emission factors for common categories (kg CO2 per dollar spent)
const EMISSION_FACTORS = {
  'food': 2.5,
  'transportation': 0.4,
  'shopping': 1.2,
  'entertainment': 0.8,
  'utilities': 0.6,
  'healthcare': 0.3,
  'other': 1.0
};

// Keywords for categorizing expenses
const CATEGORY_KEYWORDS = {
  'food': ['restaurant', 'grocery', 'food', 'cafe', 'deli', 'bakery', 'supermarket'],
  'transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'parking', 'toll'],
  'shopping': ['amazon', 'target', 'walmart', 'store', 'mall', 'retail', 'clothing'],
  'entertainment': ['movie', 'theater', 'concert', 'game', 'park', 'museum', 'event'],
  'utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
  'healthcare': ['pharmacy', 'doctor', 'hospital', 'medical', 'dental']
};

export async function POST(request) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('receipt');

    if (!file) {
      return NextResponse.json(
        { error: 'No receipt image provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Preprocess image for better OCR
    const processedImage = await sharp(buffer)
      .resize(2000, null, { withoutEnlargement: true })
      .sharpen()
      .greyscale()
      .normalize()
      .jpeg({ quality: 90 })
      .toBuffer();

    // Extract text using Tesseract OCR
    const worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,$()-+ ',
      tessedit_pageseg_mode: '6', // Uniform block of text
    });

    const { data: { text: ocrText } } = await worker.recognize(processedImage);
    await worker.terminate();

    // Use Google Cloud Vision for enhanced text detection
    const [visionResult] = await visionClient.textDetection(processedImage);
    const visionText = visionResult.textAnnotations?.[0]?.description || '';

    // Combine OCR results for better accuracy
    const combinedText = `${ocrText}\n${visionText}`.toLowerCase();

    // Parse receipt data
    const receiptData = parseReceiptText(combinedText);

    // Calculate carbon footprint
    const carbonFootprint = calculateCarbonFootprint(receiptData);

    return NextResponse.json({
      success: true,
      receiptData,
      carbonFootprint,
      extractedText: {
        tesseract: ocrText,
        vision: visionText
      }
    });

  } catch (error) {
    console.error('Receipt analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze receipt', details: error.message },
      { status: 500 }
    );
  }
}

function parseReceiptText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  // Extract total amount
  const totalPatterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*\$?(\d+\.?\d*)/i,
    /balance[:\s]*\$?(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*total/i
  ];

  let total = 0;
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      total = parseFloat(match[1]);
      break;
    }
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{2,4})/i
  ];

  let date = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Parse date (simplified)
      date = new Date().toISOString().split('T')[0]; // Use current date as fallback
      break;
    }
  }

  // Extract vendor/store name
  const vendorPatterns = [
    /^([A-Z\s&]+)\n/i,
    /([A-Z\s&]{3,})\s+\d+\.\d+/i
  ];

  let vendor = 'Unknown Store';
  for (const pattern of vendorPatterns) {
    const match = text.match(pattern);
    if (match && match[1].length > 2) {
      vendor = match[1].trim();
      break;
    }
  }

  // Categorize expense
  const category = categorizeExpense(text, vendor);

  return {
    vendor,
    total,
    date: date || new Date().toISOString().split('T')[0],
    category,
    items: extractLineItems(lines),
    rawText: text
  };
}

function categorizeExpense(text, vendor) {
  const combinedText = `${text} ${vendor}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

function extractLineItems(lines) {
  const items = [];
  const itemPattern = /(.+?)\s+\$?(\d+\.?\d*)/;

  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match && match[2] && parseFloat(match[2]) > 0) {
      items.push({
        description: match[1].trim(),
        amount: parseFloat(match[2])
      });
    }
  }

  return items.slice(0, 10); // Limit to 10 items
}

function calculateCarbonFootprint(receiptData) {
  const { total, category } = receiptData;
  const emissionFactor = EMISSION_FACTORS[category] || EMISSION_FACTORS.other;

  const carbonKg = total * emissionFactor;

  return {
    totalKgCO2: carbonKg,
    emissionFactor,
    category,
    breakdown: {
      directEmissions: carbonKg * 0.7, // 70% from direct consumption
      indirectEmissions: carbonKg * 0.3  // 30% from supply chain
    },
    suggestions: generateCarbonSuggestions(category, carbonKg)
  };
}

function generateCarbonSuggestions(category, carbonKg) {
  const suggestions = {
    food: [
      'Choose locally sourced ingredients',
      'Reduce food waste by planning meals',
      'Consider plant-based alternatives'
    ],
    transportation: [
      'Use public transportation or biking',
      'Carpool or use ride-sharing efficiently',
      'Maintain proper tire pressure for fuel efficiency'
    ],
    shopping: [
      'Buy durable, long-lasting products',
      'Choose products with minimal packaging',
      'Support local businesses to reduce transportation emissions'
    ],
    entertainment: [
      'Choose local events to reduce travel',
      'Use streaming services instead of physical media',
      'Participate in virtual events when possible'
    ],
    utilities: [
      'Switch to renewable energy providers',
      'Improve home energy efficiency',
      'Use energy-efficient appliances'
    ],
    healthcare: [
      'Choose local healthcare providers',
      'Use telemedicine when appropriate',
      'Proper medication management to reduce waste'
    ],
    other: [
      'Review spending patterns for optimization',
      'Consider digital alternatives to physical purchases',
      'Support sustainable businesses'
    ]
  };

  return suggestions[category] || suggestions.other;
}

export async function GET() {
  return NextResponse.json({
    message: 'Receipt Analysis API',
    supportedFormats: ['jpg', 'jpeg', 'png', 'bmp', 'tiff'],
    maxFileSize: '10MB',
    features: [
      'OCR text extraction',
      'Automatic categorization',
      'Carbon footprint calculation',
      'Personalized reduction suggestions'
    ]
  });
}
