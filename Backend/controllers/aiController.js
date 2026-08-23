const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function getSuggestions(req, res) {
  try {
    const {
      performance,
      accessibility,
      seo,
      bestPractices
    } = req.body;

    // Validate scores
    const scores = {
      performance: Number(performance),
      accessibility: Number(accessibility),
      seo: Number(seo),
      bestPractices: Number(bestPractices)
    };

    for (const [key, value] of Object.entries(scores)) {
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${key} score.`
        });
      }
    }

    const prompt = `
You are an expert website performance, accessibility, SEO,
and web best-practices consultant.

Analyze the following Lighthouse website audit:

Performance: ${scores.performance}/100
Accessibility: ${scores.accessibility}/100
SEO: ${scores.seo}/100
Best Practices: ${scores.bestPractices}/100

Calculate the overall score using the average of the four categories.

Identify the weakest areas and provide exactly 5 practical,
professional recommendations.

Rules:
- Focus primarily on the lowest-scoring categories.
- Do not invent audit results that were not provided.
- Each recommendation must explain what should be improved.
- Give actionable advice that a developer can actually implement.
- Avoid generic statements such as "improve your website".
- Keep each recommendation concise.
- Return ONLY a numbered list from 1 to 5.
`;

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",

        messages: [
          {
            role: "system",
            content:
              "You are a professional website audit consultant."
          },
          {
            role: "user",
            content: prompt
          }
        ],

        temperature: 0.3,
        max_tokens: 1000
      });

    const suggestions =
      completion.choices?.[0]?.message?.content?.trim();

    if (!suggestions) {
      throw new Error(
        "AI did not return any recommendations."
      );
    }

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {

    console.error(
      "AI SUGGESTIONS ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to generate AI recommendations."
    });
  }
}

module.exports = {
  getSuggestions
};
