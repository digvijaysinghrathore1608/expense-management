import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string | null;
  date: string;
}

interface MonthlyData {
  month: string;
  year: number;
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

const History = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;

        // Group transactions by month
        const grouped: { [key: string]: Transaction[] } = {};
        data?.forEach((transaction) => {
          const date = new Date(transaction.date);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(transaction);
        });

        // Calculate monthly summaries
        const monthNames = ["January", "February", "March", "April", "May", "June",
                           "July", "August", "September", "October", "November", "December"];
        
        const summaries: MonthlyData[] = Object.keys(grouped).map((key) => {
          const [year, month] = key.split("-").map(Number);
          const transactions = grouped[key];
          
          const totalIncome = transactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const totalExpenses = transactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

          return {
            month: monthNames[month],
            year,
            transactions,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
          };
        });

        // Sort by year and month (most recent first)
        summaries.sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
        });

        setMonthlyData(summaries);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => navigate("/")} variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">View all your past transactions by month</p>
          </div>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : monthlyData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No transaction history yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {monthlyData.map((monthData, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader className="bg-accent/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        {monthData.month} {monthData.year}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {monthData.transactions.length} transaction(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Balance</div>
                      <div className={`text-2xl font-bold ${
                        monthData.balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        ${monthData.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Income</div>
                      <div className="text-lg font-semibold text-green-600">
                        +${monthData.totalIncome.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Expenses</div>
                      <div className="text-lg font-semibold text-red-600">
                        -${monthData.totalExpenses.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {monthData.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}>
                              {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                            </span>
                            {transaction.category && (
                              <span className="text-xs bg-secondary px-2 py-1 rounded">
                                {transaction.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
