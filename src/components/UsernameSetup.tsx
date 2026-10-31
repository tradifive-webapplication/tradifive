import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, AlertCircle, Loader2, AtSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

export const UsernameSetup = ({ user, onComplete }: UsernameSetupProps) => {
  // Username State
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce validation timer
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

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
    const value = e.target.value.toLowerCase().replace(/\s+/g, '');
    setUsername(value);

    setIsAvailable(null);
    setError(null);

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(
      setTimeout(() => {
        checkAvailability(value);
      }, 300)
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
          has_chosen_username: true,
          preferred_market: 'forex'
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local cache and notify app
      localStorage.setItem("tradifive_cached_username", username);
      window.dispatchEvent(new Event("tradifive_profile_update"));

      toast.success(`Welcome to TradiFive, @${username}!`);
      onComplete();
    } catch (err) {
      console.error(err);
      setError("Failed to save username. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-[420px] rounded-2xl p-6"
      >
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <AtSign size={18} />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Choose Your Username
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Pick your unique trader handle so other traders and community members can recognize you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitUsername}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Trader Handle
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-bold text-sm pointer-events-none">
                  @
                </span>
                <Input
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="your_handle"
                  className={`pl-8 pr-10 text-sm font-semibold rounded-xl ${
                    isAvailable === true
                      ? 'border-green-500/60 focus-visible:ring-green-500'
                      : isAvailable === false
                        ? 'border-red-500/60 focus-visible:ring-red-500'
                        : 'border-slate-200 dark:border-white/10'
                  }`}
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isChecking && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                  {!isChecking && isAvailable === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {!isChecking && isAvailable === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {error && (
                <p className="text-[12px] font-medium text-red-500">
                  {error}
                </p>
              )}
              {isAvailable && (
                <p className="text-[12px] font-medium text-green-600">
                  @{username} is available!
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="submit"
              disabled={!isAvailable || isSaving}
              className="w-full rounded-xl py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Handle...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
