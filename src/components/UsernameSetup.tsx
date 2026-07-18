import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, AlertCircle, Loader2, Globe, TrendingUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/contexts/MarketContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface UsernameSetupProps {
  user: User;
  initialStep?: 'username' | 'market';
  onComplete: () => void;
}

export const UsernameSetup = ({ user, initialStep = 'username', onComplete }: UsernameSetupProps) => {
  const [step, setStep] = useState<'username' | 'market'>(initialStep);
  const { setActiveMarket } = useMarket();

  // Username State
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Market State
  const [isSavingMarket, setIsSavingMarket] = useState(false);

  // Debounce validation timer
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const checkAvailability = async (value: string) => {
    if (!value) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    if (value.length < 3) {
      setIsAvailable(false);
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setIsAvailable(false);
      setError("Only letters, numbers, and underscores allowed.");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', value)
        .maybeSingle();

      if (error) throw error;

      if (data && data.id !== user.id) {
        setIsAvailable(false);
        setError("This username is already taken.");
      } else {
        setIsAvailable(true);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to check username.");
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);

    setIsAvailable(null);
    setError(null);

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(
      setTimeout(() => {
        checkAvailability(value);
      }, 500)
    );
  };

  const handleSubmitUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || isSaving) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          has_chosen_username: true
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local cache and notify app
      localStorage.setItem("tradifive_cached_username", username);
      window.dispatchEvent(new Event("tradifive_profile_update"));

      setStep('market');
    } catch (err) {
      console.error(err);
      setError("Failed to save username. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectMarket = async (market: 'forex' | 'indian') => {
    setIsSavingMarket(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_market: market })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setActiveMarket(market);
      onComplete();
    } catch (err) {
      console.error(err);
      setError("Failed to save market preference.");
      setIsSavingMarket(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-[425px]"
      >
        {step === 'username' ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Claim Your Username</DialogTitle>
                <span className="text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Step 1 of 2</span>
              </div>
              <DialogDescription>
                Choose a unique handle so other traders can find you and follow your trades.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitUsername}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={username}
                      onChange={handleUsernameChange}
                      placeholder="@trader_name"
                      className={
                        isAvailable === true
                          ? 'border-green-500/50 focus-visible:ring-green-500'
                          : isAvailable === false
                            ? 'border-red-500/50 focus-visible:ring-red-500'
                            : 'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-500 dark:focus-visible:border-slate-600'
                      }
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isChecking && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                      {!isChecking && isAvailable === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {!isChecking && isAvailable === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  {error && (
                    <p className="text-[13px] font-medium text-red-500">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" disabled={isSaving} onClick={async () => {
                  setIsSaving(true);
                  try {
                    // Call RPC to completely delete the un-setup account
                    await supabase.rpc('delete_my_account');
                  } catch (e) {
                    console.error("Failed to delete account", e);
                  } finally {
                    await supabase.auth.signOut();
                    setIsSaving(false);
                  }
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isAvailable || isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Choose Your Arena</DialogTitle>
                <span className="text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Step 2 of 2</span>
              </div>
              <DialogDescription>
                Select your primary market to personalize your experience. You can always switch later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  disabled={isSavingMarket}
                  className="h-auto flex-col p-4 items-center justify-center gap-2 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-colors"
                  onClick={() => handleSelectMarket('forex')}
                >
                  <Globe className="h-6 w-6 text-indigo-500 mb-1" />
                  <span className="font-semibold text-[15px]">Global Market</span>
                  <span className="text-[11px] text-muted-foreground text-center font-normal">Forex, Crypto & Indices</span>
                </Button>
                <Button 
                  variant="outline" 
                  disabled={isSavingMarket}
                  className="h-auto flex-col p-4 items-center justify-center gap-2 rounded-2xl hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-500/10 transition-colors"
                  onClick={() => handleSelectMarket('indian')}
                >
                  <TrendingUp className="h-6 w-6 text-orange-500 mb-1" />
                  <span className="font-semibold text-[15px]">Indian Market</span>
                  <span className="text-[11px] text-muted-foreground text-center font-normal">NSE, BSE & F&O</span>
                </Button>
              </div>
              {error && (
                <p className="text-[13px] font-medium text-red-500 text-center mt-2">
                  {error}
                </p>
              )}
            </div>
            {isSavingMarket && (
              <div className="flex justify-center mt-2 pb-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
