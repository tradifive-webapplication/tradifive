Created At: 2026-05-26T06:28:30Z
Completed At: 2026-05-26T06:28:30Z
File Path: `file:///c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/src/pages/Settings.tsx`
Total Lines: 2036
Total Bytes: 131648
Showing lines 401 to 600
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
401: 
402:    const handleProfileChange = (field: string, value: string) => {
403:       setProfile(prev => ({ ...prev, [field]: value }));
404:    };
405: 
406:    const [riskMode, setRiskMode] = useState("Balanced");
407:    const [lotMode, setLotMode] = useState("Auto");
408:    const [maxDrawdown, setMaxDrawdown] = useState(15);
409:    const [stopAfterLoss, setStopAfterLoss] = useState(true);
410: 
411:    const [autoTrading, setAutoTrading] = useState(true);
412:    const [tradeFreq, setTradeFreq] = useState("Medium");
413:    const [allowHedging, setAllowHedging] = useState(false);
414: 
415:    const isHighRisk = riskMode === "Aggressive" && tradeFreq === "High";
416: 
417:     const SETTINGS_TABS = [
418:        { id: "general", label: "General", icon: User },
419:        { id: "security", label: "Account & Security", icon: Shield },
420:        { id: "ai", label: "AI Assistant", icon: Bot },
421:        { id: "trading", label: "Broker & Trading", icon: TrendingUp },
422:        { id: "privacy", label: "Privacy & Community", icon: Lock },
423:        { id: "notifications", label: "Notifications", icon: Bell },
424:        { id: "plan", label: "Billing & Plans", icon: CreditCard }
425:     ];
426: 
427:     const [searchQuery, setSearchQuery] = useState("");
428:     const [activeTab, setActiveTab] = useState("general");
429: 
430:     const filteredTabs = SETTINGS_TABS.filter(tab => 
431:        tab.label.toLowerCase().includes(searchQuery.toLowerCase())
432:     );
433: 
434:     useEffect(() => {
<truncated 5739 bytes>
  const { error } = await supabase
562:         .from('profiles')
563:         .update({ [dbField]: value })
564:         .eq('id', user.id);
565: 
566:       if (error) {
567:         toast.error("Failed to sync recovery vault");
568:       } else {
569:         setProfile(prev => ({ ...prev, [field]: value }));
570:         toast.success("Recovery vault updated", {
571:           description: `Your institutional ${field === 'recoveryEmail' ? 'email' : 'phone'} has been secured.`
572:         });
573:       }
574:    };
575: 
576:    const handleDeactivateAccount = async () => {
577:       if (!window.confirm("ARE YOU SURE? This will immediately suspend all trading sessions and platform access.")) return;
578:       
579:       toast.loading("Deactivating identity...");
580:       const { data: { user } } = await supabase.auth.getUser();
581:       if (user) {
582:         await supabase.from('profiles').update({ is_banned: true }).eq('id', user.id);
583:         await supabase.auth.signOut();
584:         navigate('/login');
585:         toast.success("Account Suspended", { description: "Institutional access revoked." });
586:       }
587:    };
588: 
589:    const handleDeleteAccount = async () => {
590:       if (!window.confirm("CRITICAL ACTION: This is IRREVERSIBLE. All data, MT5 links, and journals will be permanently purged. Proceed?")) return;
591:       
592:       toast.loading("Purging data...");
593:       const { data: { user } } = await supabase.auth.getUser();
594:       if (user) {
595:         await supabase.from('profiles').delete().eq('id', user.id);
596:         await supabase.auth.signOut();
597:         navigate('/login');
598:         toast.success("Identity Purged", { description: "Your data has been permanently removed from our servers." });
599:       }
600:    };
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
