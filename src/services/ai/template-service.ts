
import { openai } from "@/lib/openai"

export class TemplateService {
    /**
     * Generates a warm introduction request email to a Bridge Contact.
     */
    static async generateIntroRequest(
        bridgeName: string,
        targetName: string,
        targetCompany: string,
        userContext: string, // User's name, role, company
        reason: string
    ): Promise<string> {
        const prompt = `
        Eres un experto copywriter para networking B2B. 
        Escribe un email corto, casual y educado pidiendo una introducción (intro).

        Contexto:
        - Remitente: ${userContext}
        - Contacto Puente (Receptor): ${bridgeName}
        - Persona Objetivo: ${targetName} (en ${targetCompany})
        - Razón para la intro: ${reason}

        Guía:
        - Asunto: Corto y relevante (ej. "¿Intro a [Empresa]?").
        - Tono: Profesional pero cercano (es un contacto tuyo).
        - Estructura: 
            1. Saludo amigable.
            2. "El Pedido": Pregunta explícita si se siente cómodo presentándote a ${targetName}.
            3. "El Porqué": Explica brevemente el valor/razón (${reason}).
            4. Ofrece un "Blurb Forwardable" al final que él pueda copiar-pegar al objetivo.
        
        Devuelve SOLO el cuerpo del email (incluye la línea "Asunto:" al principio).
        El idioma debe ser ESPAÑOL.
        `

        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4o",
            })
            return completion.choices[0].message.content || "Error generando borrador."
        } catch (e) {
            console.error("AI Generation failed:", e)
            return "Hola [Nombre],\n\n¿Podrías presentarme a [Objetivo]?\n¡Gracias!"
        }
    }

    /**
     * Generates a cold outreach message (LinkedIn/Email) to a Target.
     */
    static async generateColdMessage(
        targetName: string,
        targetCompany: string,
        userContext: string,
        valueProp: string
    ): Promise<string> {
        const prompt = `
        Eres un experto SDR. Escribe un mensaje de prospección en frío (apto para LinkedIn InMail o Email) de alta conversión.

        Contexto:
        - Remitente: ${userContext}
        - Objetivo: ${targetName} (en ${targetCompany})
        - Propuesta de Valor: ${valueProp}

        Guía:
        - Longitud: Menos de 150 palabras.
        - Tono: Directo, enfocado en valor, baja fricción.
        - Estructura:
            1. Relevancia (Por qué yo, Por qué ahora).
            2. Valor (Cómo ayudamos).
            3. Llamada a la Acción (Bajo compromiso, ej. "¿Te parece interesante?").
        
        Devuelve SOLO el cuerpo del mensaje.
        El idioma debe ser ESPAÑOL.
        `

        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4o",
            })
            return completion.choices[0].message.content || "Error generando borrador."
        } catch (e) {
            console.error("AI Generation failed:", e)
            return "Hola [Nombre],\n\nMe gustaría charlar sobre [Empresa].\nSaludos,"
        }
    }
}
