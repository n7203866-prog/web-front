import { NextRequest, NextResponse } from 'next/server';
import { fetchFromAPI } from '@/lib/api';

function numericId(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const stringValue = String(value);
  return /^\d+$/.test(stringValue) ? stringValue : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, nationality, id_number, job_position, trainingId, training } = body;

    if (!name || !email || !training) {
      return NextResponse.json(
        { error: 'Name, email, and training are required' },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      name,
      email,
      phone: phone || '',
      nationality: nationality || '',
      id_number: id_number || '',
      job_position: job_position || '',
      message: body.message || `Enrollment request for ${training}`,
      form_type: 'training',
      related_item_title: training,
      page_url: body.page_url || '',
    };

    const relatedItemId = numericId(trainingId);
    if (relatedItemId) payload.related_item_id = relatedItemId;

    const result = await fetchFromAPI('/contact-inquiries/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error submitting enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to submit enrollment' },
      { status: 500 }
    );
  }
}
