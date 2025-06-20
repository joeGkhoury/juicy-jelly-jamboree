import { InvestmentMemo } from '../types/investmentMemo';

const OPENROUTER_API_KEY = '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'; // WARNING: Do not expose this key in public repos or client-side code

export const generateInvestmentMemoFromTicker = async (
  ticker: string,
  userInstructions: string
): Promise<InvestmentMemo> => {
  console.log(`Generating investment memo for ${ticker} with instructions: ${userInstructions}`);
  
  try {
    const prompt = createInvestmentMemoPrompt(ticker, userInstructions);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Referer": "https://investment-memo-generator.com",
        "X-Title": "Investment Memo Generator",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
          {
            "role": "system",
            "content": "You are a world-class investment analyst and research expert. You specialize in creating comprehensive, detailed investment memos for long-term value investors. Your analysis should be thorough, well-researched, and provide actionable insights."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        "temperature": 0.7,
        "max_tokens": 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    const aiResponse = data.choices[0].message.content;
    // Try to split the AI response into sections using regex
    const sectionTitles = [
      'COMPANY SUMMARY',
      'FINANCIAL OVERVIEW',
      'VALUATION SUMMARY',
      'INVESTMENT THESIS',
      'RISK FACTORS',
      'CATALYSTS',
      'MOAT ANALYSIS'
    ];
    const sectionRegex = new RegExp(
      sectionTitles.map(title => `(?:^|\n)\s*${title}[:\s]*`).join('|'),
      'gi'
    );
    const splits = aiResponse.split(sectionRegex).map(s => s.trim()).filter(Boolean);
    let memo: InvestmentMemo;
    if (splits.length >= 7) {
      memo = {
        companySummary: splits[0],
        financialOverview: splits[1],
        valuationSummary: splits[2],
        investmentThesis: splits[3],
        riskFactors: splits[4],
        catalysts: splits[5],
        moatAnalysis: splits[6],
        generatedAt: new Date(),
        userInstructions
      };
    } else {
      // Fallback: fill all fields with the full response
      memo = {
        companySummary: aiResponse,
        financialOverview: aiResponse,
        valuationSummary: aiResponse,
        investmentThesis: aiResponse,
        riskFactors: aiResponse,
        catalysts: aiResponse,
        moatAnalysis: aiResponse,
        generatedAt: new Date(),
        userInstructions
      };
    }
    return memo;
    
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw new Error('Failed to generate investment memo. Please try again later.');
  }
};

const createInvestmentMemoPrompt = (ticker: string, userInstructions: string): string => {
  return `Write a comprehensive, well-structured investment memo of at least 750 words for the stock ${ticker.toUpperCase()}. The memo should be suitable for saving as a PDF and include the following sections:

1. COMPANY SUMMARY: Overview of the business model, core products/services, market position, and competitive landscape.
2. FINANCIAL OVERVIEW: Analysis of financial performance, revenue trends, profitability, balance sheet, and cash flow.
3. VALUATION SUMMARY: Valuation analysis using multiple methodologies, trading multiples, and fair value estimates.
4. INVESTMENT THESIS: Core investment arguments and reasons for long-term opportunity.
5. RISK FACTORS: Comprehensive risk assessment including company-specific, industry, and macroeconomic risks.
6. CATALYSTS: Events or trends that could drive stock performance over the next 1-3 years.
7. MOAT ANALYSIS: Analysis of the company's sustainable competitive advantages.

${userInstructions ? `Special focus areas: ${userInstructions}` : ''}

Make each section substantive and detailed, providing specific examples and data points where relevant. The memo should be suitable for institutional investors and provide actionable investment insights. Format the memo clearly for easy reading and PDF export.`;
};

const generateEnhancedMockMemo = (ticker: string, userInstructions: string): Omit<InvestmentMemo, 'generatedAt' | 'userInstructions'> => {
  const companyName = getCompanyName(ticker);
  
  return {
    companySummary: `${companyName} (${ticker}) stands as one of the most influential and strategically positioned companies in the modern global economy. The company operates through a diversified portfolio of business segments that span across multiple high-growth industries, including core technology services, cloud infrastructure, digital advertising, consumer electronics, and emerging technologies such as artificial intelligence and autonomous systems. 

Founded with a vision to transform how people interact with technology, ${companyName} has evolved from its initial focus into a comprehensive technology ecosystem that serves billions of users worldwide. The company's business model is built on creating interconnected platforms and services that generate network effects, where the value of the platform increases exponentially as more users join the ecosystem.

The company's market position is characterized by dominant market share in several key verticals, supported by substantial competitive moats including proprietary technology, extensive data assets, brand recognition, and significant scale advantages. ${companyName} has consistently demonstrated its ability to innovate and adapt to changing market conditions, successfully navigating technological transitions and expanding into adjacent markets through both organic growth and strategic acquisitions.

With operations spanning across North America, Europe, Asia-Pacific, and emerging markets, ${companyName} has built a truly global footprint that provides diversified revenue streams and reduces dependence on any single geographic market. The company's international expansion strategy has been particularly successful in capturing growth opportunities in developing economies while maintaining its leadership position in mature markets.

The management team has established a strong track record of strategic execution, capital allocation discipline, and long-term value creation for shareholders. The company's corporate culture emphasizes innovation, customer obsession, and long-term thinking, which has enabled it to maintain its competitive edge even as the technology landscape continues to evolve rapidly.`,

    financialOverview: `${companyName} demonstrates exceptional financial performance across all key metrics, reflecting the strength of its underlying business model and the effectiveness of its strategic execution. The company has delivered consistent revenue growth over the past decade, with annual revenue increasing at a compound annual growth rate (CAGR) of approximately 15-25%, significantly outpacing both the broader market and industry peers.

Revenue diversification is a key strength, with the company generating income from multiple high-margin business segments. The core technology services segment contributes the largest portion of revenue, while the rapidly growing cloud computing division has emerged as a significant growth driver and margin expander. The advertising business provides substantial recurring revenue with attractive unit economics, and the consumer products segment offers steady cash generation with strong brand loyalty.

Profitability metrics showcase the company's operational excellence and pricing power. Operating margins have consistently remained above 20-25%, demonstrating the scalability of the business model and the company's ability to leverage fixed costs across its growing revenue base. Net profit margins have shown steady improvement over time, reflecting both operational efficiency gains and the increasing contribution from higher-margin business segments.

The balance sheet strength is particularly noteworthy, with the company maintaining a conservative capital structure characterized by minimal debt levels relative to its cash generation capacity. The company holds substantial cash reserves and short-term investments, providing significant financial flexibility for strategic investments, acquisitions, and capital returns to shareholders. This strong balance sheet position has enabled the company to invest counter-cyclically during market downturns and capitalize on strategic opportunities.

Free cash flow generation has been robust and consistent, with the company converting a high percentage of its net income into cash flow. This strong cash generation capability has supported both growth investments and significant returns to shareholders through dividend payments and share repurchase programs. The company's cash flow predictability and growth trajectory make it an attractive investment for income-focused investors while also providing capital appreciation potential.`,

    valuationSummary: `The current valuation of ${companyName} reflects a premium to broader market multiples, which appears justified by the company's superior growth profile, competitive positioning, and financial performance characteristics. Trading at approximately 25-35x forward earnings, the stock commands a premium that is consistent with other high-quality technology companies that demonstrate similar growth and profitability metrics.

From a price-to-sales perspective, the company trades at multiples that reflect the market's recognition of its revenue quality, growth sustainability, and margin expansion potential. The EV/Sales ratio is particularly attractive when considering the company's diversified revenue streams and the increasing contribution from higher-margin business segments such as cloud services and software licensing.

Discounted cash flow (DCF) analysis supports the current valuation levels when using reasonable assumptions for long-term growth rates and discount rates. The DCF model indicates a fair value range that encompasses the current trading price, with upside potential driven by the company's ability to expand market share in existing segments and successfully penetrate new markets. The terminal value assumptions appear conservative given the company's track record of innovation and market expansion.

Comparable company analysis reveals that ${companyName} trades at a reasonable premium to industry peers when adjusted for differences in growth rates, profitability, and competitive positioning. The valuation premium is justified by superior return on invested capital (ROIC), stronger competitive moats, and more diversified revenue streams compared to most comparable companies.

Historical valuation analysis shows that the stock has traded within a relatively wide range over the past five years, with current levels near the middle of the historical range. This suggests that there may be opportunities for valuation expansion if the company continues to execute on its strategic initiatives and deliver consistent financial performance. The stock's valuation multiple expansion potential is supported by increasing institutional ownership and growing recognition of the company's long-term competitive advantages.`,

    investmentThesis: `The investment thesis for ${companyName} is built on three fundamental pillars that position the company as a compelling long-term investment opportunity. First, the company possesses durable competitive advantages that create significant barriers to entry and protect its market-leading positions across multiple business segments. These competitive moats include network effects that strengthen as the user base grows, proprietary technology and data assets that are difficult to replicate, strong brand recognition that commands customer loyalty, and scale advantages that provide cost leadership in key markets.

The second pillar of the investment thesis centers on the company's multiple growth drivers and expanding total addressable market (TAM). The secular trends toward digital transformation, cloud adoption, artificial intelligence integration, and mobile commerce provide substantial tailwinds that should support above-average growth for years to come. The company is well-positioned to capitalize on these trends through its existing platform infrastructure and continued investment in emerging technologies.

Furthermore, the company's expansion into international markets represents a significant growth opportunity, with penetration rates in many developing economies still in the early stages. The growing middle class in emerging markets, combined with increasing internet and smartphone adoption, creates a favorable demographic backdrop for sustained growth in these regions.

The third pillar focuses on the company's exceptional management team and corporate governance practices. The leadership has demonstrated consistent strategic vision, disciplined capital allocation, and the ability to navigate complex technological and regulatory environments. The management team's track record of successful product launches, strategic acquisitions, and market expansion initiatives provides confidence in their ability to continue creating shareholder value.

Additionally, the company's financial strength and cash generation capability provide significant optionality for value creation through various capital allocation strategies, including organic growth investments, strategic acquisitions, and enhanced shareholder returns. This financial flexibility, combined with the company's innovative capabilities, positions it well to adapt to changing market conditions and capitalize on new opportunities as they emerge.`,

    riskFactors: `Several key risk factors warrant careful consideration when evaluating an investment in ${companyName}. Regulatory scrutiny represents perhaps the most significant near-term risk, as governments worldwide are increasingly focused on technology companies' market power, data privacy practices, and competitive behavior. Potential regulatory actions could include antitrust investigations, forced business divestitures, increased compliance costs, or restrictions on data collection and usage, any of which could materially impact the company's business model and profitability.

Competitive risks are also substantial, given the dynamic nature of the technology industry and the constant threat of disruption from both established players and emerging startups. The company faces intense competition across all of its major business segments, with competitors investing heavily in research and development to gain market share. The risk of technological obsolescence is particularly relevant in fast-moving areas such as artificial intelligence, cloud computing, and mobile platforms, where breakthrough innovations could potentially disrupt existing market leaders.

Economic sensitivity presents another layer of risk, as the company's advertising-dependent revenue streams are susceptible to macroeconomic downturns that reduce corporate marketing budgets. While the company has demonstrated some resilience during previous economic cycles, a prolonged recession could significantly impact advertising revenues and overall financial performance. Additionally, consumer discretionary spending patterns affect the company's e-commerce and consumer electronics segments.

Cybersecurity and data privacy risks have become increasingly important as the company handles vast amounts of sensitive user data across its platforms. Any significant data breach or privacy violation could result in substantial regulatory fines, legal liabilities, and reputational damage that could have long-lasting effects on user trust and business performance.

Geopolitical tensions and trade policy uncertainties pose additional risks, particularly given the company's global operations and supply chain dependencies. Trade restrictions, tariffs, or sanctions could disrupt international operations, increase costs, or limit access to key markets. The company's exposure to various international markets also creates foreign exchange risks that could impact financial results when translated to the reporting currency.`,

    catalysts: `Several near-term and medium-term catalysts could drive significant outperformance for ${companyName} over the next 12-36 months. Product innovation and new service launches represent the most immediate catalysts, with the company's robust research and development pipeline expected to yield breakthrough products and features that could expand market opportunities and drive user engagement. Upcoming product launches in artificial intelligence, augmented reality, and cloud services are particularly promising and could accelerate revenue growth in high-margin segments.

Market share expansion in international markets presents another significant catalyst, as the company continues to invest in localization efforts and strategic partnerships to penetrate underdeveloped regions. The growing adoption of digital services in emerging markets, combined with the company's increasing focus on these regions, could drive substantial revenue growth and geographic diversification.

Strategic acquisitions and partnerships could serve as important catalysts for both organic growth acceleration and entry into new market segments. The company's strong balance sheet and cash generation provide ample capacity for value-accretive acquisitions that could expand its technology capabilities, customer base, or geographic reach. Recent acquisition activity suggests management's commitment to this growth strategy.

Operational efficiency improvements and margin expansion initiatives represent additional catalysts that could drive earnings growth exceeding revenue growth. The company has identified several areas for cost optimization and process automation that could result in meaningful margin improvements over the next several years. These initiatives, combined with the scalability of the company's platform-based business model, could lead to significant operating leverage.

Regulatory clarity in key markets could also serve as a positive catalyst if ongoing investigations and policy discussions result in frameworks that provide certainty without materially constraining the company's business operations. A resolution of current regulatory uncertainties could remove a significant overhang on the stock and allow valuation multiples to expand toward historical norms.

Finally, increased institutional adoption and index inclusion could drive technical demand for the stock, particularly as ESG investing continues to grow and the company improves its sustainability and governance practices. The company's growing focus on environmental initiatives and social responsibility could attract ESG-focused investment flows.`,

    moatAnalysis: `${companyName} possesses multiple layers of sustainable competitive advantages that create formidable barriers to entry and protect its market-leading positions across various business segments. The most significant moat stems from powerful network effects that become stronger as the platform's user base expands. As more users join the ecosystem, the platform becomes increasingly valuable to all participants, creating a virtuous cycle that makes it extremely difficult for competitors to replicate the scale and utility of the established network.

Data advantages represent another crucial competitive moat, as the company has accumulated vast datasets from billions of users across multiple touchpoints and services. This proprietary data enables superior personalization, more effective advertising targeting, better product recommendations, and enhanced user experiences that competitors cannot easily match. The data network effects become more powerful over time as the company continues to collect and analyze user behavior patterns across its integrated ecosystem.

Brand strength and customer loyalty provide substantial protection against competitive threats, as the company has built one of the most recognizable and trusted brands in the technology sector. This brand equity translates into lower customer acquisition costs, higher customer lifetime value, and increased customer willingness to try new products and services within the ecosystem. The brand moat is particularly valuable in consumer-facing segments where trust and familiarity drive purchasing decisions.

Technological superiority and intellectual property assets create additional competitive barriers, with the company holding extensive patent portfolios and maintaining significant investments in research and development. The company's engineering talent and innovation capabilities enable it to stay ahead of competitors in key technological areas and rapidly respond to market changes or competitive threats.

Scale economies provide cost advantages that become more pronounced as the business grows, with the company able to spread fixed costs across a larger revenue base and negotiate better terms with suppliers and partners. This scale advantage is particularly evident in areas such as cloud infrastructure, content acquisition, and global operations, where the company's size provides meaningful cost benefits relative to smaller competitors.

Switching costs and ecosystem lock-in effects further strengthen the company's competitive position, as users become increasingly integrated into the company's suite of products and services. The cost and inconvenience of switching to alternative platforms create natural retention mechanisms that support stable customer relationships and predictable revenue streams. These switching costs are enhanced by the company's strategy of creating seamless integration across its various products and services.`
  };
};

const getCompanyName = (ticker: string): string => {
  const companies: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'CRM': 'Salesforce Inc.',
    'ADBE': 'Adobe Inc.',
    'ORCL': 'Oracle Corporation',
    'NOW': 'ServiceNow Inc.',
    'SNOW': 'Snowflake Inc.',
    'PLTR': 'Palantir Technologies',
    'UBER': 'Uber Technologies',
    'LYFT': 'Lyft Inc.',
    'SQ': 'Block Inc.',
    'PYPL': 'PayPal Holdings',
    'SHOP': 'Shopify Inc.'
  };
  
  return companies[ticker.toUpperCase()] || `${ticker.toUpperCase()} Corporation`;
};
