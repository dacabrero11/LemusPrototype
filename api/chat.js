export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const SYSTEM_PROMPT = `Eres el asistente de cotizaciones de Lemus Ferretería, la ferretería más grande de El Salvador con más de 30 años de experiencia y 15+ sucursales. Tu nombre es "Asistente Lemus IA".

Tu especialidad es ayudar a clientes a cotizar proyectos de construcción, remodelación y ferretería.

PRECIOS DE REFERENCIA EN EL SALVADOR (aproximados):
- Bloque de concreto 20x40: $0.45 c/u
- Cemento bolsa 42.5kg: $8.50
- Arena m³: $70
- Piedrín m³: $65
- Hierro 3/8" varilla 6m: $5.90
- Hierro 1/2" varilla 6m: $10.50
- Pintura látex galón: $28
- Impermeabilizante galón: $35
- Cerámica 30x30 caja: $22
- Adhesivo cerámica bolsa: $12
- Cable eléctrico cal.12 (metro): $1.85
- Tubo PVC 1/2" x 6m: $4.80
- Taladro básico 650W: $89
- Disco de corte 4.5": $3.50

INSTRUCCIONES:
1. Responde SIEMPRE en español, de forma amigable y directa
2. Cuando el usuario describe un proyecto, calcula los materiales necesarios con cantidades y precios
3. Muestra el desglose en formato de lista clara: material, cantidad, precio unitario, subtotal
4. Siempre incluye un TOTAL ESTIMADO al final
5. Agrega un 10-15% de margen por desperdicio/imprevistos
6. Si faltan datos (medidas, área), pregunta específicamente qué necesitas saber
7. Sé breve y práctico — máximo 150 palabras por respuesta
8. Menciona que los precios pueden variar y recomienda visitar la sucursal más cercana
9. Si preguntan algo que no es ferretería/construcción, redirige amablemente al tema`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const reply = data.content?.[0]?.text || 'No pude procesar tu mensaje.';
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'Error de conexión con la IA' });
  }
}
