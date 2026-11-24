import { NextRequest, NextResponse } from 'next/server';
import { fetchRawFromAPI } from '@/lib/api';

function isPositiveInteger(value: unknown) {
  if (value === null || value === undefined || value === '') return false;
  return /^\d+$/.test(String(value));
}

function appendIfPresent(formData: FormData, key: string, value: unknown) {
  if (value === null || value === undefined || value === '') return;
  formData.set(key, String(value));
}

function normalizeMessage(value: FormDataEntryValue | null, fallback: string) {
  const message = typeof value === 'string' ? value.trim() : '';
  return message || fallback;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const incomingData = contentType.includes('multipart/form-data')
      ? await request.formData()
      : await request.json();

    const formData = new FormData();

    if (incomingData instanceof FormData) {
      incomingData.forEach((value, key) => {
        if (key === 'related_item_id' && !isPositiveInteger(value)) return;
        formData.append(key, value);
      });
    } else {
      Object.entries(incomingData).forEach(([key, value]) => {
        if (key === 'related_item_id' && !isPositiveInteger(value)) return;
        appendIfPresent(formData, key, value);
      });
    }

    const name = formData.get('name');
    const email = formData.get('email');
    const formType = String(formData.get('form_type') || 'contact');
    const relatedTitle = String(formData.get('related_item_title') || '');

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    formData.set('form_type', formType);
    formData.set(
      'message',
      normalizeMessage(formData.get('message'), relatedTitle ? `Inquiry about ${relatedTitle}` : 'No message provided.')
    );

    const result = await fetchRawFromAPI('/contact-inquiries/', {
      method: 'POST',
      body: formData,
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry sent successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error sending contact inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to send inquiry' },
      { status: 500 }
    );
  }
}
