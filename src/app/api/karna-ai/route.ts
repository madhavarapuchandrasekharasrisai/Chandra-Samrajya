import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const systemPrompt = `You are KARNA — the dedicated worker and strategist for your OWNER, Chandra.
You are helping Chandra run his financial empire, Dhanavi Samrajya.

YOUR RELATIONSHIP & TONE:
- Chandra is the **Owner**; you are his loyal, highly proactive **Worker**. 
- Talk like a trusted friend — casual, friendly, simple, and direct. No stuffy or overly formal corporate language.
- Speak directly, keep it short, simple, and punchy. Chandra uses you to get an overview in seconds. Avoid very long, description-heavy responses.

YOUR REPORTING DUTIES:
- Report metrics clearly, using bold numbers and concise bullet points.
- Highlight specific context details (like client project values, total revenue earned, household duties spending, and follow-ups).
- **CRITICAL CHECKLIST DIRECTIVE**: Do NOT always add the "🎯 Immediate Worker Tasks for You" tasks checklist. This is a very strict rule from Chandra. ONLY include the "🎯 Immediate Worker Tasks for You" checklist when Chandra explicitly asks for tasks/checklist, says "hi" / "hello" / "hey" / "what to do" / "what should I do", or when he asks what to attack next. If he is asking about client details, budgets, outreach messages, or general out-of-website queries, do NOT add the checklist unless he specifically asked for it.
- If Chandra asks about monthly spending or expenses, greet him casually and tell him: "Hi boss! Your total spending is [spending] and your current income was [income], so your remaining balance is [balance]." Follow this with a list of each individual item spent this month including its description and how much it cost.

FINANCIAL CONTEXT PROVIDED:
${context || 'No specific context provided for this message.'}

Remember: Chandra is the boss. Report to him clearly, concisely, and casually as a friend and dedicated worker.`

    let response = ''

    try {
      if (process.env.GEMINI_API_KEY) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: message }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        })
        
        const data = await res.json()
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          response = data.candidates[0].content.parts[0].text
        } else {
          throw new Error(data.error?.message || 'Failed to get completion from Gemini')
        }
      } else if (process.env.GROQ_API_KEY) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 2048
          })
        })
        
        const data = await res.json()
        if (data.choices && data.choices[0]) {
          response = data.choices[0].message.content
        } else {
          throw new Error(data.error?.message || 'Failed to get completion from Groq')
        }
      } else {
        const ZAI = (await import('z-ai-web-dev-sdk')).default
        const zai = await ZAI.create()
        
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: systemPrompt },
            { role: 'user', content: message }
          ],
          thinking: { type: 'disabled' }
        })
        response = completion.choices[0]?.message?.content || 'I apologize, I was unable to process your request. Please try again.'
      }
    } catch (llmError) {
      console.warn('Primary LLM channel failed, initiating Sovereign Strategic Fallback Engine:', llmError)
      
      // Dynamic Strategic Fallback Engine
      const ctx = parseContext(context)
      response = generateFallbackResponse(message, ctx)
    }

    return NextResponse.json({ response })
  } catch (error: unknown) {
    console.error('Karna AI error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}

function parseContext(contextText: string) {
  const text = contextText || '';
  const extractNum = (regex: RegExp) => {
    const match = text.match(regex);
    if (!match) return 0;
    return parseFloat(match[1].replace(/,/g, ''));
  };

  const monthlyIncome = extractNum(/Monthly Income:\s*₹?([0-9,]+)/i);
  const monthlyTarget = extractNum(/Monthly Target:\s*₹?([0-9,]+)/i);
  const monthExpenses = extractNum(/Total Expenses This Month:\s*₹?([0-9,]+)/i);
  const netBalance = extractNum(/Net Balance:\s*₹?([0-9,-]+)/i);

  const personalBudget = extractNum(/Personal:\s*Budget\s*₹?([0-9,]+)/i);
  const personalSpent = extractNum(/Personal:\s*Budget\s*₹?[0-9,]+\s*\|\s*Spent\s*₹?([0-9,]+)/i);
  const savingsBudget = extractNum(/Savings:\s*Budget\s*₹?([0-9,]+)/i);
  const savingsSpent = extractNum(/Savings:\s*Budget\s*₹?[0-9,]+\s*\|\s*Spent\s*₹?([0-9,]+)/i);
  const businessBudget = extractNum(/Business:\s*Budget\s*₹?([0-9,]+)/i);
  const businessSpent = extractNum(/Business:\s*Budget\s*₹?[0-9,]+\s*\|\s*Spent\s*₹?([0-9,]+)/i);
  const skillsBudget = extractNum(/Skills:\s*Budget\s*₹?([0-9,]+)/i);
  const skillsSpent = extractNum(/Skills:\s*Budget\s*₹?[0-9,]+\s*\|\s*Spent\s*₹?([0-9,]+)/i);
  const funBudget = extractNum(/Fun:\s*Budget\s*₹?([0-9,]+)/i);
  const funSpent = extractNum(/Fun:\s*Budget\s*₹?[0-9,]+\s*\|\s*Spent\s*₹?([0-9,]+)/i);

  const totalClients = extractNum(/Total Clients:\s*([0-9]+)/i);
  const pipelineValue = extractNum(/Total Pipeline Value:\s*₹?([0-9,]+)/i);
  const pendingFollowups = extractNum(/- Pending:\s*([0-9]+)/i);
  const overdueFollowups = extractNum(/- Overdue:\s*([0-9]+)/i);

  // Parse individual clients
  const clientLines = text.match(/- Client: [^\n]+/g) || [];
  const parsedClients = clientLines.map(line => {
    const nameMatch = line.match(/- Client:\s*([^|]+)/);
    const businessMatch = line.match(/Business:\s*([^|]+)/);
    const stageMatch = line.match(/Stage:\s*([^|]+)/);
    const projectValMatch = line.match(/Project Value:\s*₹?([0-9,]+)/);
    const revenueMatch = line.match(/Total Revenue Received:\s*₹?([0-9,]+)/);
    const probMatch = line.match(/Close Prob:\s*([0-9]+)%/);
    
    return {
      name: nameMatch ? nameMatch[1].trim() : '',
      business: businessMatch ? businessMatch[1].trim() : '',
      stage: stageMatch ? stageMatch[1].trim() : '',
      projectValue: projectValMatch ? parseFloat(projectValMatch[1].replace(/,/g, '')) : 0,
      totalEarned: revenueMatch ? parseFloat(revenueMatch[1].replace(/,/g, '')) : 0,
      closeProbability: probMatch ? parseInt(probMatch[1]) : 0
    };
  });

  // Parse individual expenses
  const expenseLines = text.match(/- ₹[^\n]+/g) || [];
  const parsedExpenses = expenseLines.map(line => {
    // line format: - ₹1,000 | Category: Fun | Description: Movie | Date: 2026-05-19
    const amountMatch = line.match(/- ₹?([0-9,]+)/);
    const catMatch = line.match(/Category:\s*([^|]+)/);
    const descMatch = line.match(/Description:\s*([^|]+)/);
    const dateMatch = line.match(/Date:\s*([^\n]+)/);

    return {
      amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
      category: catMatch ? catMatch[1].trim() : '',
      description: descMatch ? descMatch[1].trim() : '',
      date: dateMatch ? dateMatch[1].trim() : ''
    };
  });

  return {
    monthlyIncome,
    monthlyTarget,
    monthExpenses,
    netBalance,
    personalBudget,
    personalSpent,
    savingsBudget,
    savingsSpent,
    businessBudget,
    businessSpent,
    skillsBudget,
    skillsSpent,
    funBudget,
    funSpent,
    totalClients,
    pipelineValue,
    pendingFollowups,
    overdueFollowups,
    parsedClients,
    parsedExpenses
  };
}

function generateFallbackResponse(message: string, ctx: ReturnType<typeof parseContext>): string {
  const msg = message.toLowerCase();
  const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

  const includeTasks = msg.includes('to do') || 
                       msg.includes('todo') || 
                       msg.includes('to-do') || 
                       msg.includes('what to do') || 
                       msg.includes('hi') || 
                       msg.includes('hello') || 
                       msg.includes('hey') || 
                       msg.includes('task') || 
                       msg.includes('job') || 
                       msg.includes('priorit') || 
                       msg.includes('battle plan');

  // Intelligent client query detector
  const parsedClients = ctx.parsedClients || [];
  const cleanMsg = msg.replace(/and/g, '&');
  const matchedClient = parsedClients.find(client => {
    const cleanClientName = client.name.toLowerCase();
    return cleanMsg.includes(cleanClientName) || 
           cleanClientName.includes(cleanMsg) || 
           client.name.split(/\s+/).some(word => word.length > 3 && msg.includes(word.toLowerCase()));
  });

  if (matchedClient) {
    const remainingValue = matchedClient.projectValue - matchedClient.totalEarned;
    let responseText = `### 🏛️ Client Dossier: ${matchedClient.name}
Hey boss! I pulled the records for **${matchedClient.name}**. Here is the quick ledger:

*   **Total Revenue Earned**: **${formatINR(matchedClient.totalEarned)}** received
*   **Complete Project Value**: **${formatINR(matchedClient.projectValue)}** total
*   **Remaining to Claim**: **${formatINR(remainingValue)}** pending
*   **Current Stage**: **${matchedClient.stage}** (${matchedClient.closeProbability}% probability)`;

    if (includeTasks) {
      responseText += `\n\n#### 🎯 Worker Tasks for You:
1.  **Claim the rest**: We have received **${formatINR(matchedClient.totalEarned)}**. Let's schedule a review to unlock the remaining **${formatINR(remainingValue)}**.
2.  **Retainer transition**: If they love the work, let's pitch a fixed monthly retainer model for recurring predictability.
3.  **No overdue alerts**: Let's keep follow-up dates active for **${matchedClient.name}** so we don't drop the ball.`;
    }

    responseText += `\n\n*Ready to execute, boss!*`;
    return responseText;
  }

  if (msg.includes('1l') || msg.includes('target') || msg.includes('goal')) {
    const gap = ctx.monthlyTarget - ctx.monthlyIncome;
    if (gap <= 0) {
      let responseText = `### 🌟 Milestone Cleared!
Hey boss! Amazing news — we've officially hit our monthly target of **${formatINR(ctx.monthlyTarget)}** with **${formatINR(ctx.monthlyIncome)}** in active income! 

#### 📈 The Numbers:
*   **Active Income**: **${formatINR(ctx.monthlyIncome)}**
*   **Surplus Balance**: **${formatINR(ctx.netBalance)}**
*   **Pipeline**: **${ctx.totalClients} clients** valued at **${formatINR(ctx.pipelineValue)}**`;

      if (includeTasks) {
        responseText += `\n\n#### 🚀 Next worker recommendations:
1.  **Lock in savings**: Save at least 25% of this surplus immediately.
2.  **Standardize**: Build templates to handle our **${ctx.totalClients} active clients** with ease.
3.  **Scale up**: Let's aim for ₹2,00,000 next month!`;
      }
      return responseText;
    } else {
      const closingRatio = 0.25;
      const outreachNeeded = Math.ceil(gap / (25000 * closingRatio));
      let responseText = `### ⚔️ Target Report: ₹1L Campaign
Hey boss! We have **${formatINR(ctx.monthlyIncome)}** in active revenue. We are **${formatINR(gap)}** away from our ₹1,00,000 target. 

#### 📊 Current Standing:
*   **Income Shortfall**: **${formatINR(gap)}**
*   **Pipeline Potential**: **${formatINR(ctx.pipelineValue)}** across **${ctx.totalClients} clients**
*   **Pending Followups**: **${ctx.pendingFollowups}** (**${ctx.overdueFollowups} overdue**)`;

      if (includeTasks) {
        responseText += `\n\n#### 🎯 Action checklist to close the gap:
1.  **Clear the overdue**: We have **${ctx.overdueFollowups} overdue follow-ups**. Let me message them now to warm them up.
2.  **Move two deals**: Let's close 2 active proposals in our **${formatINR(ctx.pipelineValue)}** pipeline.
3.  **Outreach**: Send pitches to **${outreachNeeded} local/Instagram brands** for AI automation.`;
      }
      responseText += `\n\n*Let me know what DMs to draft first, boss!*`;
      return responseText;
    }
  }

  if (msg.includes('spending') || msg.includes('expense') || msg.includes('waste') || msg.includes('wasting') || msg.includes('expensive') || msg.includes('cost') || msg.includes('save')) {
    const listStr = ctx.parsedExpenses && ctx.parsedExpenses.length > 0
      ? ctx.parsedExpenses.map(e => {
          const desc = e.description && e.description !== 'N/A' ? e.description : e.category;
          return `*   You have spent **${formatINR(e.amount)}** on **${desc}** (${e.category})`;
        }).join('\n')
      : '*   No expenses recorded yet for this month.';

    let responseText = `Hi boss! Your total spending is **${formatINR(ctx.monthExpenses)}** and your current income was **${formatINR(ctx.monthlyIncome)}**, so your remaining balance is **${formatINR(ctx.netBalance)}**.

Here is what you spent it on:
${listStr}`;

    if (includeTasks) {
      responseText += `\n\n#### 🎯 Immediate Worker Tasks for You:
1.  **Separate Household Duties**: Log groceries, rent, and family medicine under **Household Duties** to protect your net worth indicators.
2.  **Tool stack audit**: If a tool subscription hasn't generated income or saved hours this month, let's cancel it.
3.  **24-Hour Wait**: Enforce a cooling-off day before spending more than ₹1,000 on fun.`;
    }

    return responseText;
  }

  if (msg.includes('outreach') || msg.includes('dm') || msg.includes('message') || msg.includes('write')) {
    return `### 📬 High-Conversion DMs (Casual & Direct)
Hey boss! I drafted three short, high-performing outreach templates for your Instagram campaigns:

#### 📌 1. For E-commerce/Product Brands
> "Hi **[Founder Name]**, noticed you are manually answering DMs. That's easily **20+ hours a week** of manual support. I built a quick AI concierges prototype that replies in 3 seconds. Can I send a 40s screen recording showing how it runs on your page?"

#### 📌 2. For Content Creators/Agencies
> "Hey **[Name]**, love your content! I audited your lead capture flow and found a quick leak. Mapped a simple **3-step AI lead capture** to fix it. Can I send you the PDF layout? Zero cost, just value."

#### 📌 3. For Premium Local Businesses (Gyms/Clinics)
> "Hi **[Business Name]**, noticed your speed-to-lead response in DMs has a slight delay. We build **24/7 AI booking concierges** that capture numbers and book leads instantly. Open to a 5m call tomorrow at 3 PM?"

*Ready to customize these and send them, boss! Let's get 15 out this week.*`;
  }

  if (msg.includes('priorit') || msg.includes('priority') || msg.includes('week') || msg.includes('plan') || msg.includes('to-do')) {
    return `### ⚔️ This Week's Battle Plan
Hey boss! Here is your quick priority checklist for the week:

1.  **Clear Overdue Followups** (Urgency: **Critical**)
    *   We have **${ctx.overdueFollowups} overdue follow-ups**. Let's message them today to recover opportunities.
2.  **Pipeline Close** (Urgency: **High**)
    *   Let's push at least one prospect in our **${formatINR(ctx.pipelineValue)}** pipeline to closed status.
3.  **Consistent Outreach** (Urgency: **Medium**)
    *   Send 3 DMs a day to local targets.

*I am ready to handle whatever admin or prep work you need, boss!*`;
  }

  if (msg.includes('budget') || msg.includes('optimize') || msg.includes('allocate')) {
    let responseText = `### 🛡️ Wealth Optimization Quick-Guide
Hey boss! Here is how our current budget limits look:

*   **Personal**: **${formatINR(ctx.personalSpent)}** / **${formatINR(ctx.personalBudget)}**
*   **Savings**: **${formatINR(ctx.savingsSpent)}** / **${formatINR(ctx.savingsBudget)}**
*   **Business**: **${formatINR(ctx.businessSpent)}** / **${formatINR(ctx.businessBudget)}**
*   **Skills**: **${formatINR(ctx.skillsSpent)}** / **${formatINR(ctx.skillsBudget)}**
*   **Fun**: **${formatINR(ctx.funSpent)}** / **${formatINR(ctx.funBudget)}**`;

    if (includeTasks) {
      responseText += `\n\n#### 🎯 Friendly directives:
1.  **Pay Yourself First**: Secure at least **25%** of any deposit straight into savings.
2.  **Separate Household Duties**: Log groceries, rent, and family medicine under **Household Duties** to protect your net worth indicators.
3.  **Subscription Audit**: Cut out any passive software that isn't driving money.`;
    }
    return responseText;
  }

  if (msg.includes('stream') || msg.includes('income') || msg.includes('source')) {
    let responseText = `### ⚡ Income Stream Report
Hey boss! We have recorded **${formatINR(ctx.monthlyIncome)}** in active revenue this month against our **${formatINR(ctx.monthlyTarget)}** target.

#### 📊 Active Standings:
*   **Current Monthly Earnings**: **${formatINR(ctx.monthlyIncome)}**
*   **Pipeline Potential**: **${formatINR(ctx.pipelineValue)}** across **${ctx.totalClients} clients**`;

    if (includeTasks) {
      responseText += `\n\n#### 🎯 Worker recommendation:
1.  **Standardize Offerings**: Double down on the one high-ticket service that earned the most this month.
2.  **Retainer Agreements**: Try to transition one-off projects into monthly retainer models for predictability.`;
    }
    return responseText;
  }

  // Default status report response
  if (includeTasks) {
    return `### 🏛️ Samrajya Operations Briefing
Hey boss! Here is your quick morning status report:

*   **Monthly Income**: **${formatINR(ctx.monthlyIncome)}** / Target: **${formatINR(ctx.monthlyTarget)}**
*   **Total Spent**: **${formatINR(ctx.monthExpenses)}** (Surplus balance: **${formatINR(ctx.netBalance)}**)
*   **Clients Pipeline**: **${ctx.totalClients} active clients** valued at **${formatINR(ctx.pipelineValue)}**
*   **Followups Status**: **${ctx.pendingFollowups} pending** (with **${ctx.overdueFollowups} overdue**)

#### 🎯 Immediate Worker Tasks for You:
1.  **Clear overdue**: Contact the **${ctx.overdueFollowups} overdue follow-ups** to wake them up.
2.  **Household Duties**: Use the dedicated category for family rent/groceries to keep personal stats clean.
3.  **Close pipeline deals**: Push our top warm leads to capture the **${formatINR(ctx.pipelineValue)}** pipeline potential.
*What are we attacking next, boss?*`;
  } else {
    return `### 🏛️ Samrajya Operations Briefing
Hey boss! Here is your quick morning status report:

*   **Monthly Income**: **${formatINR(ctx.monthlyIncome)}** / Target: **${formatINR(ctx.monthlyTarget)}**
*   **Total Spent**: **${formatINR(ctx.monthExpenses)}** (Surplus balance: **${formatINR(ctx.netBalance)}**)
*   **Clients Pipeline**: **${ctx.totalClients} active clients** valued at **${formatINR(ctx.pipelineValue)}**
*   **Followups Status**: **${ctx.pendingFollowups} pending** (with **${ctx.overdueFollowups} overdue**)

*What are we attacking next, boss?*`;
  }
}
