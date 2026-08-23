const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function getComparisonSummary(req, res) {
  try {
    const {
      site1,
      site2,
      performance1,
      accessibility1,
      seo1,
      bestPractices1,
      performance2,
      accessibility2,
      seo2,
      bestPractices2,
    } = req.body;

    const prompt = `
You are an expert website performance and SEO analyst.

Compare these two websites using their Lighthouse scores.

Website 1:
URL: ${site1}
Performance: ${performance1}
Accessibility: ${accessibility1}
SEO: ${seo1}
Best Practices: ${bestPractices1}

Website 2:
URL: ${site2}
Performance: ${performance2}
Accessibility: ${accessibility2}
SEO: ${seo2}
Best Practices: ${bestPractices2}

Provide a professional comparison summary.

Requirements:
- Identify which website performs better overall.
- Mention the strongest category of each website.
- Mention the weakest category of each website.
- Identify important differences between the websites.
- Give 2 practical recommendations.
- Keep the response concise.
- Do not invent information that is not represented by the scores.
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const summary =
      completion.choices?.[0]?.message?.content ||
      "Unable to generate AI comparison summary.";

    res.json({
      success: true,
      summary,
    });

  } catch (error) {
    console.error("COMPARISON AI ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to generate AI comparison summary.",
    });
  }
}

module.exports = {
  getComparisonSummary,
};