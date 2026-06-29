import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cidade = searchParams.get('cidade')
  const estado = searchParams.get('estado')

  if (!cidade) return NextResponse.json({ error: 'cidade obrigatória' }, { status: 400 })

  try {
    // Step 1: find the city's OSM relation ID via Nominatim
    const query = estado ? `${cidade}, ${estado}, Brazil` : `${cidade}, Brazil`
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=3&featuretype=city`,
      { headers: { 'User-Agent': 'EntregasFlow/1.0 (soccervitae@gmail.com)' } }
    )
    const nominatimData = await nominatimRes.json()

    if (!nominatimData.length) {
      return NextResponse.json({ bairros: [] })
    }

    // Prefer relations, fall back to first result
    const city = nominatimData.find((r: { osm_type: string }) => r.osm_type === 'relation') || nominatimData[0]
    const osmId: number = city.osm_id
    const osmType: string = city.osm_type

    // Overpass area IDs: relation = 3600000000 + id, way = 2400000000 + id
    const areaId = osmType === 'relation' ? 3600000000 + osmId : 2400000000 + osmId

    // Step 2: get neighbourhoods/suburbs within that area via Overpass
    const overpassQuery = `
[out:json][timeout:30];
area(${areaId})->.city;
(
  node["place"~"^(suburb|neighbourhood|quarter)$"](area.city);
  way["place"~"^(suburb|neighbourhood|quarter)$"](area.city);
  relation["place"~"^(suburb|neighbourhood|quarter)$"](area.city);
);
out body;
    `.trim()

    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'text/plain' },
    })

    if (!overpassRes.ok) return NextResponse.json({ bairros: [] })

    const overpassData = await overpassRes.json()

    const bairros: string[] = Array.from(
      new Set(
        (overpassData.elements as Array<{ tags?: { name?: string } }>)
          .map(el => el.tags?.name)
          .filter((n): n is string => !!n && n.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

    return NextResponse.json({ bairros })
  } catch {
    return NextResponse.json({ bairros: [] })
  }
}
