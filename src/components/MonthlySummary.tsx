import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Transaction {
  type: string;
  amount: number;
  date: string;
}

interface MonthlySummaryProps {
  transactions: Transaction[];
}

export const MonthlySummary = ({ transactions }: MonthlySummaryProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === selectedMonth && transactionDate.getFullYear() === selectedYear;
  });

  const previousMonth = () => {
    setSelectedDate(new Date(selectedYear, selectedMonth - 1, 1));
  };

  const nextMonth = () => {
    const today = new Date();
    if (selectedYear < today.getFullYear() || 
        (selectedYear === today.getFullYear() && selectedMonth < today.getMonth())) {
      setSelectedDate(new Date(selectedYear, selectedMonth + 1, 1));
    }
  };

  const isCurrentMonth = selectedMonth === new Date().getMonth() && 
                         selectedYear === new Date().getFullYear();

  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={previousMonth} variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[200px]">
          <h2 className="text-2xl font-bold">{monthNames[selectedMonth]} {selectedYear}</h2>
          <p className="text-sm text-muted-foreground">
            {isCurrentMonth ? "Current Month" : "Historical Data"}
          </p>
        </div>
        <Button 
          onClick={nextMonth} 
          variant="outline" 
          size="icon"
          disabled={isCurrentMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${balance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
