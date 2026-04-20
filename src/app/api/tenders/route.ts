import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://gaioevent.tech/', { cache: 'no-store' });
    const html = await response.text();

    // Regex to find tender cards
    // Pattern matches the title and location from the HTML cards
    const tenderCards = html.matchAll(/<h3[^>]*class="[^"]*text-lg font-bold text-white mb-2"[^>]*>(.*?)<\/h3>[\s\S]*?📍 (.*?)<\/span>/g);
    
    const tenders = [];
    let idCounter = 1;

    for (const match of tenderCards) {
      tenders.push({
        id: `T-${1000 + idCounter}`,
        title: match[1].trim(),
        type: match[1].includes('Finals') ? 'Regional' : 'National',
        date: '2026-06-15', // Placeholder date
        status: 'Open',
        location: match[2].trim()
      });
      idCounter++;
    }

    // Fallback if no tenders found in HTML
    if (tenders.length === 0) {
      return NextResponse.json([
        { id: "T-1001", title: "Regional Finals - Southeast Asia", type: "Regional", date: "2026-05-30", status: "Open" },
        { id: "T-1002", title: "National AI Olympiad - UK", type: "National", date: "2026-06-15", status: "Open" }
      ]);
    }

    return NextResponse.json(tenders);
  } catch (error) {
    return NextResponse.json([]);
  }
}
