import type { CalcBlock } from '@/lib/content-types';
import type { PageId } from '@/lib/site';

/* The eight investor calculators (Tools). One template renders them all:
   components/calculators/CalculatorPage. Field ids are the original element ids. */

export type CalcField = { id: string; label: string; money?: boolean; placeholder: string; min?: string; max?: string; step?: string };
export type CalculatorDef = {
  /** original element ids of the card and its result panel */
  cardId: string;
  outId: string;
  tag: string;
  title: string;
  titleEm: string;
  lede: string;
  cardTitle: string;
  sub: string;
  formula?: string;
  button: string;
  fields: CalcField[];
};

export const CALCULATORS = {
  cagr: {
    cardId: 'calc-cagr',
    outId: 'cagr-out',
    tag: 'Tools',
    title: 'CAGR',
    titleEm: 'Calculator',
    lede: 'A key measure of investment success: the average yearly growth of your investment.',
    cardTitle: 'CAGR Calculator',
    sub: 'Compound Annual Growth Rate (CAGR) represents the average yearly growth rate of your investment over a specific period — it smooths out the returns and shows the average annual growth rate.',
    formula: 'CAGR = (Ending Value ÷ Beginning Value)^(1/N) − 1',
    button: 'Calculate',
    fields: [
      {
        id: 'cagr-b',
        label: 'Total Investment (PKR)',
        money: true,
        placeholder: '100,000',
      },
      {
        id: 'cagr-e',
        label: 'Final Maturity Value (PKR)',
        money: true,
        placeholder: '250,000',
      },
      {
        id: 'cagr-y',
        label: 'Investment Duration (Years)',
        placeholder: '5',
      },
    ],
  },
  sip: {
    cardId: 'calc-sip',
    outId: 'sip-out',
    tag: 'Tools',
    title: 'SIP',
    titleEm: 'Calculator',
    lede: 'Estimate the potential returns on your systematic monthly investments.',
    cardTitle: 'SIP Calculator',
    sub: 'Helps investors estimate the potential returns on their mutual fund investments using the compound interest formula. Actual returns vary due to market conditions; exit loads and expense ratios are not included.',
    formula: 'FV = P × [(1 + i)ⁿ − 1] × (1 + i) ÷ i',
    button: 'Calculate SIP',
    fields: [
      {
        id: 'sip-p',
        label: 'Monthly Investment Amount (PKR)',
        money: true,
        placeholder: '10,000',
      },
      {
        id: 'sip-r',
        label: 'Expected Rate of Return — Yearly (%)',
        placeholder: '12',
      },
      {
        id: 'sip-y',
        label: 'Investment Duration (Years)',
        placeholder: '10',
      },
    ],
  },
  invest: {
    cardId: 'calc-inv',
    outId: 'inv-out',
    tag: 'Tools',
    title: 'Investment',
    titleEm: 'Calculator',
    lede: 'Plan your wealth growth easily.',
    cardTitle: 'Investment Calculator',
    sub: 'Plan your wealth growth easily — combine an initial lump sum with monthly contributions at your expected return.',
    button: 'Calculate',
    fields: [
      {
        id: 'inv-p',
        label: 'Initial Investment (PKR)',
        money: true,
        placeholder: '500,000',
      },
      {
        id: 'inv-m',
        label: 'Monthly Contribution (PKR)',
        money: true,
        placeholder: '10,000',
      },
      {
        id: 'inv-r',
        label: 'Expected Return (%)',
        placeholder: '12',
        min: '1',
        max: '100',
      },
      {
        id: 'inv-y',
        label: 'Period (Years)',
        placeholder: '10',
      },
    ],
  },
  depr: {
    cardId: 'calc-dep',
    outId: 'dep-out',
    tag: 'Tools',
    title: 'Depreciation',
    titleEm: 'Calculator',
    lede: 'See how inflation erodes the purchasing power of cash over time.',
    cardTitle: 'Depreciation Calculator',
    sub: 'See how inflation erodes the purchasing power of your cash over time. Why it matters: the inflation rate determines how much value your money loses each year.',
    formula: 'Inflation Rate (%) = ((B − A) × 100) ÷ A',
    button: 'Calculate',
    fields: [
      {
        id: 'dep-c',
        label: 'Cash Value (PKR)',
        money: true,
        placeholder: '1,000,000',
      },
      {
        id: 'dep-sy',
        label: 'Start Year',
        placeholder: '2026',
      },
      {
        id: 'dep-y',
        label: 'Number of Years',
        placeholder: '10',
      },
      {
        id: 'dep-i',
        label: 'Inflation % per Year',
        placeholder: '10',
      },
    ],
  },
  xrate: {
    cardId: 'calc-xrate',
    outId: 'xr-out',
    tag: 'Tools',
    title: 'X Rate',
    titleEm: 'Calculator',
    lede: 'Simplify ex-dividend, ex-bonus and ex-rights share prices.',
    cardTitle: 'X Rate Calculator',
    sub: 'Compute ex-dividend, ex-bonus and ex-rights share prices after book closure. Enter percentages as numbers (e.g. 20 for 20%).',
    formula: 'XD = CR − (FV × D%)  ·  XB = CR ÷ (1 + B%)  ·  XR = (CR + FV × R%) ÷ (1 + R%)',
    button: 'Calculate',
    fields: [
      {
        id: 'xr-cr',
        label: 'Closing Rate (CR) — current share price before book closure',
        money: true,
        placeholder: '150',
      },
      {
        id: 'xr-fv',
        label: 'Face Value (FV)',
        money: true,
        placeholder: '10',
      },
      {
        id: 'xr-d',
        label: 'Dividend % (D %)',
        placeholder: '20',
      },
      {
        id: 'xr-b',
        label: 'Bonus % (B %)',
        placeholder: '10',
      },
      {
        id: 'xr-r',
        label: 'Right Issue % (R %)',
        placeholder: '0',
      },
    ],
  },
  dcf: {
    cardId: 'calc-dcf',
    outId: 'dcf-out',
    tag: 'Tools',
    title: 'DCF',
    titleEm: 'Calculator',
    lede: 'Estimate the intrinsic value of a company or investment.',
    cardTitle: 'DCF Calculator',
    sub: 'Estimate the intrinsic value of a company by projecting future free cash flows and discounting them to present value. A higher margin of safety indicates greater protection against market volatility or estimation errors.',
    formula: 'Margin of Safety (%) = (Intrinsic Value − Current Price) ÷ Intrinsic Value × 100',
    button: 'Calculate',
    fields: [
      {
        id: 'dcf-cf',
        label: 'Free Cash Flow Per Share (Rs)',
        money: true,
        placeholder: '15',
      },
      {
        id: 'dcf-p',
        label: 'Current Share Price',
        money: true,
        placeholder: '150',
      },
      {
        id: 'dcf-g',
        label: 'Growth Rate (%)',
        placeholder: '8',
      },
      {
        id: 'dcf-rg',
        label: 'Discounted Rate (Growth Stage) (%)',
        placeholder: '15',
      },
      {
        id: 'dcf-rt',
        label: 'Discounted Rate (Terminal Stage) (%)',
        placeholder: '18',
      },
    ],
  },
  fcf: {
    cardId: 'calc-fcf',
    outId: 'fcf-out',
    tag: 'Tools',
    title: 'Projected FCF & Cash',
    titleEm: 'Calculator',
    lede: 'Project free cash flow and cash from 6-year averages.',
    cardTitle: 'Projected FCF & Cash Calculator',
    sub: 'The estimated cash a business is expected to generate after capital expenditures — projected from 6-year averages with your growth assumption, including per-share values. FCF = Operating Cash Flow − Capital Expenditures.',
    formula: 'Projected FCF = Current FCF × (1 + Growth Rate)ⁿ',
    button: 'Calculate',
    fields: [
      {
        id: 'fcf-eq',
        label: 'Total Equity (Rs)',
        money: true,
        placeholder: '50,000,000',
      },
      {
        id: 'fcf-sh',
        label: 'Shares Outstanding',
        money: true,
        placeholder: '1,000,000',
      },
      {
        id: 'fcf-c',
        label: 'Free Cash Flow 6Y Avg (Rs)',
        money: true,
        placeholder: '2,000,000',
      },
      {
        id: 'fcf-ca',
        label: 'Cash 6Y Avg (Rs)',
        money: true,
        placeholder: '1,500,000',
      },
      {
        id: 'fcf-g',
        label: 'Growth Assumption (%)',
        placeholder: '10',
      },
    ],
  },
  drawdown: {
    cardId: 'calc-dd',
    outId: 'dd-out',
    tag: 'Tools',
    title: 'Drawdown',
    titleEm: 'Calculator',
    lede: 'Measure the decline from peak to trough and what it takes to recover.',
    cardTitle: 'Drawdown Calculator',
    sub: 'Drawdown is the decline in the value of an investment from its peak to its lowest point before a new peak is achieved. Use it to measure portfolio risk, compare volatility, and determine recovery requirements.',
    formula: 'Drawdown (%) = (Peak Value − Trough Value) ÷ Peak Value × 100',
    button: 'Calculate',
    fields: [
      {
        id: 'dd-sb',
        label: 'Starting Balance',
        money: true,
        placeholder: '1,000,000',
      },
      {
        id: 'dd-pd',
        label: 'Period',
        placeholder: '5',
      },
      {
        id: 'dd-l',
        label: 'Loss per period (%)',
        placeholder: '5',
      },
    ],
  },
} satisfies Partial<Record<PageId, CalculatorDef>>;

export type CalculatorId = keyof typeof CALCULATORS;

export const CALC_DISCLAIMER =
  'Disclaimer: This calculator provides estimates only and does not account for fees, taxes, exit loads, or expense ratios. Actual returns vary due to market conditions.';

/* Educational write-up under each calculator (verbatim from the original site).
   The editor can replace a calculator's blocks (content.calcInfo[id]). */
export const CALC_INFO: Partial<Record<CalculatorId, CalcBlock[]>> = {
  cagr: [
    {
      h: 'What is CAGR?',
    },
    'Compound Annual Growth Rate (CAGR) represents the average yearly growth rate of your investment over a specific period. It helps investors understand how much their investment has grown each year, assuming the profits were reinvested annually. CAGR provides a more accurate picture of investment performance compared to raw or absolute returns.',
    {
      h: 'CAGR vs. Absolute Returns',
    },
    "Many investors often measure returns in absolute terms, which only show the total percentage gain over the entire investment period. For example, if you invested PKR 20,000 in 2015 and it grew to PKR 35,000 by 2020, your absolute return would be 75%. While that looks impressive, it doesn't tell you how much your investment grew each year on average.",
    "This is where CAGR becomes important. It smooths out the returns and shows the average annual growth rate, giving you a clearer understanding of your investment's performance year by year.",
    {
      h: 'How to Calculate CAGR',
    },
    'The formula for calculating Compound Annual Growth Rate (CAGR) is:',
    {
      f: 'CAGR = (Ending Value / Beginning Value) ^ (1 / N) − 1',
    },
    'Here:',
    {
      ul: ['Ending Value = Final value of the investment', 'Beginning Value = Initial investment amount', 'N = Number of years'],
    },
    'CAGR helps you determine the consistent annual growth rate of an investment over time.',
    {
      h: 'Benefits of Using an Online CAGR Calculator',
    },
    'An online CAGR calculator makes it simple to analyze and compare investment growth. Here are some of the main benefits:',
    "Unlike absolute returns, CAGR takes into account the duration of the investment. This makes it a more reliable measure of true growth over a specific time frame, whether you're analyzing mutual funds, stocks, or your own business performance.",
    "CAGR allows you to compare the performance of different investment products on a like-for-like basis. Whether you're reviewing mutual funds, stocks, or business growth, CAGR helps identify which option delivered the best annualized returns.",
    "Using Rallys Equities' CAGR Calculator, you can quickly measure and compare the performance of your investments and make smarter financial decisions.",
  ],
  sip: [
    {
      h: 'What is a SIP Calculator?',
    },
    'A SIP (Systematic Investment Plan) Calculator is an online tool that helps investors estimate the potential returns on their mutual fund investments made through SIPs. SIP investing allows individuals to contribute a fixed amount regularly, helping build long-term wealth with financial discipline. The calculator provides an estimate of how much your investments could grow over time based on your input values.',
    "While SIP calculators offer a clear projection, it's important to remember that actual returns may vary due to market fluctuations and other fund-related factors. These calculators also do not account for additional costs like exit loads or expense ratios, which may affect the final value. Overall, they serve as a smart planning tool to help you set realistic financial goals.",
    {
      h: 'How Does a SIP Calculator Work?',
    },
    'The SIP Calculator works using the compound interest formula, which shows how your money grows when returns are reinvested periodically. You simply enter the monthly investment amount, investment duration, and expected annual return rate — and the calculator estimates your total corpus at the end of the period.',
    'The SIP Calculator formula is as follows:',
    {
      f: 'FV = P × [(1 + i)ⁿ − 1] × (1 + i) / i',
    },
    'Where:',
    {
      ul: [
        "FV = Future Value (the amount you'll receive at the end of the investment period)",
        'P = SIP Amount (your regular investment per installment)',
        'i = Periodic Interest Rate (annual return ÷ 12)',
        'n = Total Number of Installments (investment duration in months)',
      ],
    },
    "With Rallys Equities' SIP Calculator, you can easily visualize how small, consistent investments grow into a significant corpus over time — helping you plan smarter for your financial goals.",
  ],
  depr: [
    {
      h: 'What is Inflation?',
    },
    'Inflation measures the rise in the general price level of selected goods and services over a period of time. It reflects the decline in purchasing power of a currency, usually expressed as a percentage. Inflation is an important economic indicator, helping investors and policymakers understand changes in the cost of living.',
    {
      h: 'Why Inflation Rate Matters',
    },
    'Inflation impacts the value of money. As prices rise, the currency loses value, meaning it takes more money to buy the same goods and services as before. This affects everyday living expenses and can slow down economic growth, making it a key metric for financial planning and investment decisions.',
    {
      h: 'How to Calculate the Inflation Rate',
    },
    'Inflation rate shows the percentage increase in prices over a specific period. If the inflation rate reaches 100%, it indicates that prices have doubled. For rates above 100%, the Bureau of Labor Statistics (BLS) typically uses a new base year to keep calculations clear. When using the Consumer Price Index (CPI) above 100, subtract 100 to determine the actual percentage increase over the period.',
    'The formula for calculating inflation is:',
    {
      f: 'Inflation Rate (%) = ((B − A) × 100) / A',
    },
    'Where:',
    {
      ul: ['A = Starting value of the price', 'B = Ending value of the price'],
    },
    'Using a Depreciation or Inflation Calculator, you can quickly determine how much the value of money or goods has changed over time, helping you make informed financial decisions.',
  ],
  dcf: [
    {
      h: 'What is a DCF Calculator?',
    },
    'A DCF (Discounted Cash Flow) Calculator helps investors estimate the intrinsic value of a company or investment. It evaluates how much an investment is worth today based on expected future cash flows, adjusted for the time value of money. Using DCF analysis, you can determine whether a stock is undervalued or overvalued compared to its current market price.',
    {
      h: 'How Does a DCF Calculator Work?',
    },
    "The DCF method projects a company's future free cash flows and discounts them to the present value using an appropriate discount rate. The total of these discounted values gives the Intrinsic Value — a fair estimate of what the investment is truly worth today.",
    {
      h: 'Understanding Margin of Safety',
    },
    'The Margin of Safety measures how much the current market price is below the intrinsic value. A higher margin of safety indicates greater protection against market volatility or estimation errors.',
    {
      f: 'Margin of Safety (%) = ((Intrinsic Value − Current Price) / Intrinsic Value) × 100',
    },
    'Where:',
    {
      ul: ['Intrinsic Value = The estimated fair value of the investment', 'Current Price = The current market price of the investment'],
    },
  ],
  fcf: [
    {
      h: 'What is Projected Free Cash Flow (FCF)?',
    },
    "Projected Free Cash Flow (FCF) represents the estimated amount of cash that a business is expected to generate after accounting for capital expenditures. It is a key indicator of a company's financial health, used by investors to assess its ability to expand operations, pay dividends, or reduce debt.",
    {
      h: 'Why Projecting FCF Matters',
    },
    "Forecasting future cash flows helps investors determine a company's intrinsic value and overall performance potential. By projecting FCF, you can estimate how much cash will be available in the coming years — essential for valuation methods such as Discounted Cash Flow (DCF) analysis.",
    {
      h: 'Key Inputs',
    },
    {
      ul: [
        'Current Free Cash Flow — The latest available FCF value',
        'Growth Rate (%) — Expected annual increase in FCF',
        'Projection Period (Years) — Number of years to forecast',
      ],
    },
    {
      h: 'Uses of the Projected FCF & Cash Calculator',
    },
    {
      ul: [
        "Estimate a company's financial performance over time",
        'Assess investment potential through future cash projections',
        'Support DCF valuation calculations with more accurate data',
        'Compare the projected cash position under different growth scenarios',
      ],
    },
    'Use the Rallys Equities Projected FCF & Cash Calculator to forecast potential cash flow and make informed investment or business planning decisions.',
  ],
  drawdown: [
    {
      h: 'What is Drawdown?',
    },
    'Drawdown refers to the decline in the value of an investment from its peak to its lowest point before a new peak is achieved. It measures the downside risk or potential loss an investor might experience during a specific period. Drawdown is commonly expressed as a percentage and is an important indicator of volatility and investment risk.',
    'For example, if your portfolio value peaks at PKR 100,000 and later falls to PKR 80,000, the drawdown is 20%. This helps investors understand how much value their investment lost during a downturn.',
    {
      h: 'Why Drawdown Matters',
    },
    'Monitoring drawdown helps investors assess how resilient their portfolio is during market corrections. A smaller drawdown means the investment is less volatile and recovers faster from losses, while a larger drawdown indicates higher risk and potential stress for the investor.',
    {
      h: 'Drawdown Formula',
    },
    {
      f: 'Drawdown (%) = ((Peak Value − Trough Value) / Peak Value) × 100',
    },
    'Where:',
    {
      ul: ['Peak Value — The highest value of the investment before decline', 'Trough Value — The lowest value reached during the decline'],
    },
    {
      h: 'Uses of the Drawdown Calculator',
    },
    {
      ul: [
        'Measure portfolio risk and assess historical performance',
        'Compare different investments based on volatility',
        'Determine recovery requirements after a market fall',
        'Improve risk management and investment decision-making',
      ],
    },
    "Use the Rallys Equities Drawdown Calculator to analyze the decline from peak to trough in your investments, understand your portfolio's resilience, and manage risk more effectively.",
  ],
};
