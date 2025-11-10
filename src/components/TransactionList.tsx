import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string | null;
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: () => void;
}

export const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  const today = new Date().toISOString().split('T')[0];

  const handleDelete = async (id: string, date: string) => {
    if (date !== today) {
      toast.error("You can only delete today's transactions");
      return;
    }

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Transaction deleted");
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete transaction");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
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
                  <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                {transaction.date === today && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(transaction.id, transaction.date)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
