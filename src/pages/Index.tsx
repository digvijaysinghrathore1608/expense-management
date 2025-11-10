import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { MonthlySummary } from "@/components/MonthlySummary";
import { LogOut, History } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string | null;
  date: string;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Day Wise Ledger</h1>
            <p className="text-muted-foreground">Track your daily finances</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/history")} variant="outline">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <MonthlySummary transactions={transactions} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AddTransactionForm onSuccess={fetchTransactions} />
          <TransactionList transactions={transactions} onDelete={fetchTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;
