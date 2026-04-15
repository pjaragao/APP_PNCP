const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export class AIService {
  /**
   * Analisa um edital ou resumo de licitação
   */
  static async analisarEdital(textoEdital: string) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY não configurada')

    const prompt = `
      Você é um especialista em licitações públicas brasileiras.
      Analise o texto do edital abaixo e extraia:
      1. Requisitos de Habilitação Técnica (Certidões, Atestados de Capacidade).
      2. Prazos Críticos (Envio, Esclarecimentos, Impugnação).
      3. Riscos Identificados (Exigências incomuns, prazos apertados).
      4. Sugestão de "Go/No-Go" para a empresa.

      Texto do Edital:
      ${textoEdital.substring(0, 30000)} // Limite para o prompt
    `

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    if (!response.ok) {
      throw new Error(`Erro Gemini API: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  /**
   * Gera uma minuta de proposta baseada no edital e dados da empresa
   */
  static async gerarMinutaProposta(edital: string, dadosEmpresa: any) {
    // Lógica similar para geração de documentos
  }
}
