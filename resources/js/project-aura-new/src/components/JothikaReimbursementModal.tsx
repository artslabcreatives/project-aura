import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, DollarSign, Building2, CheckCircle2, Loader2, AlertCircle, Link2 } from 'lucide-react';
import { ProjectExpense } from '@/types/projectExpense';
import { projectExpenseService } from '@/services/projectExpenseService';
import { jothikaService } from '@/services/jothikaService';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface JothikaReimbursementModalProps {
  open: boolean;
  onClose: () => void;
  expense: ProjectExpense;
  clientName: string;
  projectId: number;
  onNoted: (updated: ProjectExpense) => void;
}

export function JothikaReimbursementModal({
  open,
  onClose,
  expense,
  clientName,
  projectId,
  onNoted,
}: JothikaReimbursementModalProps) {
  const { toast } = useToast();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);

  useEffect(() => {
    if (open) {
      checkTokenStatus();
    }
  }, [open]);

  const checkTokenStatus = async () => {
    setIsCheckingToken(true);
    try {
      const status = await jothikaService.getTokenStatus();
      setHasToken(status.has_token && status.is_valid);
    } catch (error) {
      console.error('Failed to check token status:', error);
      setHasToken(false);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      toast({ 
        title: 'Token required', 
        description: 'Please enter your Jothika API token',
        variant: 'destructive' 
      });
      return;
    }

    setIsSavingToken(true);
    try {
      await jothikaService.storeToken(tokenInput.trim());
      toast({ 
        title: 'Connected', 
        description: 'Jothika account connected successfully' 
      });
      setHasToken(true);
      setShowTokenInput(false);
      setTokenInput('');
    } catch (error: any) {
      toast({ 
        title: 'Connection failed', 
        description: error.response?.data?.message || 'Failed to connect Jothika account',
        variant: 'destructive' 
      });
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleCreateReimbursement = async () => {
    setIsCreating(true);
    try {
      const response = await jothikaService.createReimbursementFromExpense(projectId, expense.id);
      
      toast({ 
        title: 'Success', 
        description: `Reimbursement created in Jothika (ID: ${response.jothika_id})` 
      });
      
      // Mark as noted and close
      const updated = await projectExpenseService.markReimbursementNoted(projectId, expense.id);
      onNoted(updated);
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create reimbursement';
      toast({ 
        title: 'Error', 
        description: errorMsg,
        variant: 'destructive' 
      });
      
      // If token is invalid, reset status
      if (errorMsg.includes('token') || errorMsg.includes('connect')) {
        setHasToken(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenJothika = () => {
    window.open('https://jothika.artslabcreatives.com', '_blank', 'noopener,noreferrer');
  };

  const handleMarkNoted = async () => {
    try {
      const updated = await projectExpenseService.markReimbursementNoted(projectId, expense.id);
      onNoted(updated);
      toast({ title: 'Noted', description: 'Reimbursement reminder dismissed.' });
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to save status.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-500" />
            Create Reimbursement in Jothika
          </DialogTitle>
          <DialogDescription>
            This expense was paid personally. Create a reimbursement entry in Jothika automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Expense Details */}
          <div className="rounded-md border bg-muted/40 p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">
                {expense.currency} {parseFloat(expense.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="outline" className="capitalize">{expense.type}</Badge>
            </div>
            {expense.description && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Description</span>
                <span className="text-right text-xs">{expense.description}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Client</span>
              <span className="flex items-center gap-1 font-medium">
                <Building2 className="h-3 w-3" />
                {clientName}
              </span>
            </div>
          </div>

          {/* Token Status & Connection */}
          {isCheckingToken ? (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Checking connection...</AlertDescription>
            </Alert>
          ) : hasToken === false ? (
            <div className="space-y-3">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect your Jothika account to automatically create reimbursements
                </AlertDescription>
              </Alert>
              
              {showTokenInput ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="token">Jothika API Token</Label>
                    <Input
                      id="token"
                      type="password"
                      placeholder="Paste your token here"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your token from Jothika &rarr; Settings &rarr; API Tokens
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleSaveToken} 
                      disabled={isSavingToken}
                      className="flex-1"
                    >
                      {isSavingToken ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Connect Account
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowTokenInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowTokenInput(true)}
                  className="w-full"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect Jothika Account
                </Button>
              )}
            </div>
          ) : hasToken === true ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Ready to create reimbursement automatically
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={handleMarkNoted} 
            className="sm:order-1"
            size="sm"
          >
            Skip / Already done
          </Button>
          
          {hasToken ? (
            <Button 
              onClick={handleCreateReimbursement} 
              disabled={isCreating}
              className="sm:order-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Reimbursement
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleOpenJothika} 
              variant="outline"
              className="sm:order-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Jothika Manually
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
