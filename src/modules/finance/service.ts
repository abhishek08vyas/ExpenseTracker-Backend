import { PrismaClient, Prisma } from '@prisma/client';

// Define interfaces that were previously imported from '../../model/expense'
interface ExpenseByCategory {
  category: string;
  amount: number | Prisma.Decimal;
  month: string;
}

interface TopSpending {
  category: string;
  amount: number | Prisma.Decimal;
  percentage: number;
}

interface MonthlySummary {
  month: string;
  totalIncome: number | Prisma.Decimal;
  totalExpense: number | Prisma.Decimal;
  balance: number | Prisma.Decimal;
  savingsRate: number;
}

interface OverallSummary {
  totalIncome: number | Prisma.Decimal;
  totalExpense: number | Prisma.Decimal;
  balance: number | Prisma.Decimal;
  savingsRate: number;
  mostExpensiveCategory: string;
  mostFrequentCategory: string;
  averageMonthlyExpense: number | Prisma.Decimal;
  averageMonthlyIncome: number | Prisma.Decimal;
}

interface IncomeExpenseTrend {
  month: string;
  income: number | Prisma.Decimal;
  expense: number | Prisma.Decimal;
}

const prisma = new PrismaClient();

export class FinanceService {
  
  async getExpenseByCategory(userId: string): Promise<ExpenseByCategory[]> {
    // Get last 6 months date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    // Query database for expense data grouped by category and month
    const expenses = await prisma.$queryRaw`
      SELECT 
        c.name as category,
        SUM(t.amount) as amount,
        TO_CHAR(t."transactionDate", 'YYYY-MM') as month
      FROM "Transaction" t
      LEFT JOIN "Category" c ON t."categoryId" = c.id
      WHERE 
        t."userId" = ${userId}
        AND t."transactionDate" >= ${startDate}
        AND t."transactionDate" <= ${endDate}
        AND t."transactionType" = 'expense'
      GROUP BY c.name, TO_CHAR(t."transactionDate", 'YYYY-MM')
      ORDER BY TO_CHAR(t."transactionDate", 'YYYY-MM'), c.name
    `;
    
    return expenses as ExpenseByCategory[];
  }
  
  async getTopSpendingByCategory(userId: string): Promise<TopSpending[]> {
    // Get last 6 months date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    // Get total expenses in the period
    const totalResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lte: endDate
        },
        transactionType: 'expense'
      }
    });
    
    const totalAmount = totalResult._sum.amount || 0;
    
    // Get expenses grouped by category
    const categoryExpenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: {
        amount: true
      },
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lte: endDate
        },
        transactionType: 'expense'
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    });
    
    // Get category names
    const categoryIds = categoryExpenses.map(item => item.categoryId).filter(id => id !== null) as number[];
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        name: true
      }
    });
    
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    
    // Calculate percentage for each category
    return categoryExpenses.map(item => ({
      category: item.categoryId ? categoryMap.get(item.categoryId) || 'Uncategorized' : 'Uncategorized',
      amount: item._sum.amount || 0,
      percentage: Number(totalAmount) > 0 ? (Number(item._sum.amount || 0) / Number(totalAmount)) * 100 : 0
    }));
  }
  
  async getMonthlySummary(userId: string, month: string): Promise<MonthlySummary> {
    // Parse the month string to create date range
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of the month
    
    // Get total income for the month
    const incomeResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lte: endDate
        },
        transactionType: 'income'
      }
    });
    
    // Get total expenses for the month
    const expenseResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lte: endDate
        },
        transactionType: 'expense'
      }
    });
    
    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;
    const balance = Number(totalIncome) - Number(totalExpense);
    const savingsRate = Number(totalIncome) > 0 ? (balance / Number(totalIncome)) * 100 : 0;
    
    return {
      month,
      totalIncome,
      totalExpense,
      balance,
      savingsRate
    };
  }
  
  async getOverallSummary(userId: string): Promise<OverallSummary> {
    // Get total income
    const incomeResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      _avg: {
        amount: true
      },
      where: {
        userId,
        transactionType: 'income'
      }
    });
    
    // Get total expenses
    const expenseResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      _avg: {
        amount: true
      },
      where: {
        userId,
        transactionType: 'expense'
      }
    });
    
    // Get most expensive category
    const expensiveCategoryResults = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: {
        amount: true
      },
      where: {
        userId,
        transactionType: 'expense',
        categoryId: {
          not: null
        }
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 1
    });
    
    let mostExpensiveCategory = "None";
    if (expensiveCategoryResults.length > 0 && expensiveCategoryResults[0].categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: expensiveCategoryResults[0].categoryId }
      });
      if (category) {
        mostExpensiveCategory = category.name;
      }
    }
    
    // Get most frequent category
    const frequentCategoryResults = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      },
      where: {
        userId,
        transactionType: 'expense',
        categoryId: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 1
    });
    
    let mostFrequentCategory = "None";
    if (frequentCategoryResults.length > 0 && frequentCategoryResults[0].categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: frequentCategoryResults[0].categoryId }
      });
      if (category) {
        mostFrequentCategory = category.name;
      }
    }
    
    // Calculate monthly averages
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyExpense = await prisma.$queryRaw`
      SELECT AVG(monthly_sum) as avg_monthly
      FROM (
        SELECT 
          TO_CHAR("transactionDate", 'YYYY-MM') as month,
          SUM(amount) as monthly_sum
        FROM "Transaction"
        WHERE 
          "userId" = ${userId}
          AND "transactionDate" >= ${sixMonthsAgo}
          AND "transactionDate" <= ${currentDate}
          AND "transactionType" = 'expense'
        GROUP BY TO_CHAR("transactionDate", 'YYYY-MM')
      ) as monthly_expenses
    `;
    
    const monthlyIncome = await prisma.$queryRaw`
      SELECT AVG(monthly_sum) as avg_monthly
      FROM (
        SELECT 
          TO_CHAR("transactionDate", 'YYYY-MM') as month,
          SUM(amount) as monthly_sum
        FROM "Transaction"
        WHERE 
          "userId" = ${userId}
          AND "transactionDate" >= ${sixMonthsAgo}
          AND "transactionDate" <= ${currentDate}
          AND "transactionType" = 'income'
        GROUP BY TO_CHAR("transactionDate", 'YYYY-MM')
      ) as monthly_incomes
    `;
    
    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;
    const balance = Number(totalIncome) - Number(totalExpense);
    const savingsRate = Number(totalIncome) > 0 ? (balance / Number(totalIncome)) * 100 : 0;
    
    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      mostExpensiveCategory,
      mostFrequentCategory,
      averageMonthlyExpense: (monthlyExpense as any)[0]?.avg_monthly || 0,
      averageMonthlyIncome: (monthlyIncome as any)[0]?.avg_monthly || 0
    };
  }
  
  async getIncomeExpenseTrend(userId: string): Promise<IncomeExpenseTrend[]> {
    // Get last 6 months date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    // Get expense data by month
    const expenses = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("transactionDate", 'YYYY-MM') as month,
        SUM(amount) as amount
      FROM "Transaction"
      WHERE 
        "userId" = ${userId}
        AND "transactionDate" >= ${startDate}
        AND "transactionDate" <= ${endDate}
        AND "transactionType" = 'expense'
      GROUP BY TO_CHAR("transactionDate", 'YYYY-MM')
      ORDER BY TO_CHAR("transactionDate", 'YYYY-MM')
    `;
    
    // Get income data by month
    const incomes = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("transactionDate", 'YYYY-MM') as month,
        SUM(amount) as amount
      FROM "Transaction"
      WHERE 
        "userId" = ${userId}
        AND "transactionDate" >= ${startDate}
        AND "transactionDate" <= ${endDate}
        AND "transactionType" = 'income'
      GROUP BY TO_CHAR("transactionDate", 'YYYY-MM')
      ORDER BY TO_CHAR("transactionDate", 'YYYY-MM')
    `;
    
    // Create a map of months for the last 6 months
    const months: string[] = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().substring(0, 7); // YYYY-MM format
      months.unshift(month);
    }
    
    // Create expense map
    const expenseMap = new Map();
    (expenses as any[]).forEach(exp => {
      expenseMap.set(exp.month, exp.amount);
    });
    
    // Create income map
    const incomeMap = new Map();
    (incomes as any[]).forEach(inc => {
      incomeMap.set(inc.month, inc.amount);
    });
    
    // Combine data
    return months.map(month => ({
      month,
      income: incomeMap.get(month) || 0,
      expense: expenseMap.get(month) || 0
    }));
  }
}

export default new FinanceService();