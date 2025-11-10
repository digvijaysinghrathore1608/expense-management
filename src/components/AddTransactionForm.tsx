import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const transactionSchema = z.object({
  amount: z.number().positive("Amount must be positive").max(999999999.99),
  description: z.string().min(1, "Description is required").max(200),
  category: z.string().max(100).optional(),
});

interface AddTransactionFormProps {
  onSuccess: () => void;
}

export const AddTransactionForm = ({ onSuccess }: AddTransactionFormProps) => {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = transactionSchema.parse({
        amount: parseFloat(amount),
        description: description.trim(),
        category: category.trim() || undefined,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type,
        amount: validated.amount,
        description: validated.description,
        category: validated.category,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      toast.success(`${type === "income" ? "Income" : "Expense"} added successfully!`);
      setAmount("");
      setDescription("");
      setCategory("");
      onSuccess();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to add transaction");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setType("income")}
            >
              Income
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setType("expense")}
            >
              Expense
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              type="text"
              placeholder="e.g., Food, Transport, Salary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : `Add ${type === "income" ? "Income" : "Expense"}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
