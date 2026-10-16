import React, { useState, useEffect, useRef } from "react";
import {
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   ShieldDone as IconlyShieldDone,
   Graph as IconlyGraph,
   TimeSquare as IconlyTimeSquare
} from "react-iconly";


import { motion, AnimatePresence } from "framer-motion";

import DashboardLayout from "@/components/DashboardLayout";

import {

   Shield,

   Zap,

   Power,

   AlertTriangle,

   Target,

   ArrowUpRight,

   TrendingDown,

   ShieldCheck,

   Link2,

   Activity,

   History,

   Lock,

   Clock,

   Calendar,

   ChevronDown,

   Brain,

   Timer,

   Trophy,

   Check,

   AlertOctagon,

   Star,

   Sparkles,

   ShieldAlert,

   Settings,

         if (dbConfig.target_capital !== null) setTargetCapital(dbConfig.target_capital);

         if (dbConfig.max_daily_loss_percent !== null) setMaxDrawdown(dbConfig.max_daily_loss_percent);

         if (dbConfig.max_open_trades !== null) setTradeLimit(dbConfig.max_open_trades);

      }

   }, [dbConfig]);



   // --- Load Persisted Settings ---

   useEffect(() => {

      const saved = localStorage.getItem('fialgo_risk_config');

      if (saved) {

         const config = JSON.parse(saved);

         if (config.maxDrawdown) setMaxDrawdown(config.maxDrawdown);

         if (config.weeklyDrawdown !== undefined) setWeeklyDrawdown(config.weeklyDrawdown);

         if (config.monthlyDrawdown !== undefined) setMonthlyDrawdown(config.monthlyDrawdown);

         if (config.stopAfterLoss !== undefined) setStopAfterLoss(config.stopAfterLoss);

         if (config.autoTrading !== undefined) setAutoTrading(config.autoTrading);

         if (config.tradeFreq) setTradeFreq(config.tradeFreq);

         if (config.allowHedging !== undefined) setAllowHedging(config.allowHedging);

         if (config.revengeGuard !== undefined) setRevengeGuard(config.revengeGuard);

         if (config.tradeLimit) setTradeLimit(config.tradeLimit);

         if (config.waitPeriod) setWaitPeriod(config.waitPeriod);

         if (config.selectedSessions) setSelectedSessions(config.selectedSessions);

         if (config.sessionTimes) setSessionTimes(config.sessionTimes);

         if (config.maxLot) setMaxLot(config.maxLot);

         if (config.targetCapital) setTargetCapital(config.targetCapital);

      }

   }, []);



   const handleSave = async () => {

      // 1. Sync core configs to Supabase Postgres table

      if (user?.id) {

         await saveConfig({

            max_lot_size: maxLotActive ? maxLot : 0,

            target_capital: targetCapital,

            max_daily_loss_percent: drawdownGuardActive ? maxDrawdown : 0,

            max_open_trades: disciplineActive ? tradeLimit : 0

         }).catch(console.error);

      }



      // 2. Persist interactive settings in localStorage

      const config = {

         maxLotActive,

         drawdownGuardActive,

         disciplineActive,

         sessionActive,

         maxDrawdown,

         weeklyDrawdown,

         monthlyDrawdown,

         stopAfterLoss,

         autoTrading,

         tradeFreq,

         allowHedging,

         revengeGuard,

         tradeLimit,

         waitPeriod,

         selectedSessions,

         sessionTimes,

         maxLot,

         targetCapital

      };

      localStorage.setItem('fialgo_risk_config', JSON.stringify(config));



      toast.success("Risk Guard Settings Synchronized", {

         description: "All automated safety brackets are now live on MT5 Bridge #28120136.",

// MISSING LINE 101
// MISSING LINE 102
// MISSING LINE 103
// MISSING LINE 104
// MISSING LINE 105
// MISSING LINE 106
// MISSING LINE 107
// MISSING LINE 108
// MISSING LINE 109
// MISSING LINE 110
// MISSING LINE 111
// MISSING LINE 112
// MISSING LINE 113
// MISSING LINE 114
// MISSING LINE 115
// MISSING LINE 116
// MISSING LINE 117
// MISSING LINE 118
// MISSING LINE 119
// MISSING LINE 120
// MISSING LINE 121
// MISSING LINE 122
// MISSING LINE 123
// MISSING LINE 124
// MISSING LINE 125
// MISSING LINE 126
// MISSING LINE 127
// MISSING LINE 128
// MISSING LINE 129
// MISSING LINE 130
// MISSING LINE 131
// MISSING LINE 132
// MISSING LINE 133
// MISSING LINE 134
// MISSING LINE 135
// MISSING LINE 136
// MISSING LINE 137
// MISSING LINE 138
// MISSING LINE 139
// MISSING LINE 140
// MISSING LINE 141
// MISSING LINE 142
// MISSING LINE 143
// MISSING LINE 144
// MISSING LINE 145
// MISSING LINE 146
// MISSING LINE 147
// MISSING LINE 148
// MISSING LINE 149
        .custom-ind-switch input[type="checkbox"] + label i:after {

          left: 5px;

        }

        .custom-ind-switch input[type="checkbox"]:checked + label {

          left: 50%;

        }

        .custom-ind-switch input[type="checkbox"]:checked + label:before {

          background: #fff;

          box-shadow:

            0 0 5px 2px rgba(255, 255, 255, 0.95),

            0 0 3px 1px rgba(255, 255, 255, 0.75);

        }



        /* LIGHT THEME SWITCH (Uiverse by ashif_6672) */

        .custom-ui-switch {

          font-size: 3px;

          position: relative;

          align-items: center;

          justify-content: center;

          width: 20em;

          height: 10em;

          background: linear-gradient(0deg, #ededed, #bdbdbd);

          border-radius: 5em;

          box-shadow:

            0 0.05em 0.5em 0.01em #ffffff80,

            0 0px 5em 0.5em #ffffff,

            0 -0.25em 0.25em 0.125em #15182f44;

          cursor: pointer;

          flex-shrink: 0;

        }



        .custom-ui-switch *,

        .custom-ui-switch *:before,

        .custom-ui-switch *:after {

          box-sizing: border-box;

        }



        .custom-ui-switch input[type="checkbox"] {

          display: none;

        }



        .custom-ui-switch .rail {

          position: absolute;

          top: 0;

          left: 0;

          width: 100%;

          height: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 5em;

          box-shadow:

            -0.05em 0.26em 0.2em -0.05em #fff,

            0.05em 0.125em 0.2em -0.125em #0004 inset;

          pointer-events: none;

        }



        .custom-ui-switch .rail:before,

        .custom-ui-switch .rail:after {

          content: "";

          position: absolute;

          width: 5em;

          height: 5em;

          border-radius: 5em;

        }



        .custom-ui-switch .rail:before {

          left: 2.5em;

          background: linear-gradient(175deg, #00000077, #0001, #fff2), #2196f3;

          box-shadow:

            -0.05em 0.26em 0.2em -0.05em #fff8,

            0.05em 0.125em 0.2em -0.125em #0008 inset;

        }



        .custom-ui-switch .rail:after {

          right: 2.5em;

          background: linear-gradient(180deg, #858585, #a8a8a8, #e3e3e3);

          box-shadow:

            0 0.25em 0.2em -0.033em #fff8,

            -0.0625em 0.0625em 0.2em -0.125em #000 inset;

        }



        .custom-ui-switch .rail span {

          width: calc(5em + 1px);

          height: 0.5em;

          z-index: 1;

          background: linear-gradient(180deg, #0004, #fff0 0.175em),

            linear-gradient(90deg, #2196f3 50%, #aaaaaa 50%);

          background-size: 200% 100%;

          background-position: 55% 50%;

          box-shadow: 0 0.125em 0.075em -0.05em #fff8;

          transition: all 0.5s ease 0s;

        }



        .custom-ui-switch input[type="checkbox"]:checked ~ .rail span {

          background-position: 35% 50%;

        }



        .custom-ui-switch .slider {

          position: absolute;

          width: 9.375em;

// MISSING LINE 251
// MISSING LINE 252
// MISSING LINE 253
// MISSING LINE 254
// MISSING LINE 255
// MISSING LINE 256
// MISSING LINE 257
// MISSING LINE 258
// MISSING LINE 259
// MISSING LINE 260
// MISSING LINE 261
// MISSING LINE 262
// MISSING LINE 263
// MISSING LINE 264
// MISSING LINE 265
// MISSING LINE 266
// MISSING LINE 267
// MISSING LINE 268
// MISSING LINE 269
// MISSING LINE 270
// MISSING LINE 271
// MISSING LINE 272
// MISSING LINE 273
// MISSING LINE 274
// MISSING LINE 275
// MISSING LINE 276
// MISSING LINE 277
// MISSING LINE 278
// MISSING LINE 279
// MISSING LINE 280
// MISSING LINE 281
// MISSING LINE 282
// MISSING LINE 283
// MISSING LINE 284
// MISSING LINE 285
// MISSING LINE 286
// MISSING LINE 287
// MISSING LINE 288
// MISSING LINE 289
// MISSING LINE 290
// MISSING LINE 291
// MISSING LINE 292
// MISSING LINE 293
// MISSING LINE 294
// MISSING LINE 295
// MISSING LINE 296
// MISSING LINE 297
// MISSING LINE 298
// MISSING LINE 299
// MISSING LINE 300
// MISSING LINE 301
// MISSING LINE 302
// MISSING LINE 303
// MISSING LINE 304
// MISSING LINE 305
// MISSING LINE 306
// MISSING LINE 307
// MISSING LINE 308
// MISSING LINE 309
// MISSING LINE 310
// MISSING LINE 311
// MISSING LINE 312
// MISSING LINE 313
// MISSING LINE 314
// MISSING LINE 315
// MISSING LINE 316
// MISSING LINE 317
// MISSING LINE 318
// MISSING LINE 319
// MISSING LINE 320
// MISSING LINE 321
// MISSING LINE 322
// MISSING LINE 323
// MISSING LINE 324
// MISSING LINE 325
// MISSING LINE 326
// MISSING LINE 327
// MISSING LINE 328
// MISSING LINE 329
// MISSING LINE 330
// MISSING LINE 331
// MISSING LINE 332
// MISSING LINE 333
// MISSING LINE 334
// MISSING LINE 335
// MISSING LINE 336
// MISSING LINE 337
// MISSING LINE 338
// MISSING LINE 339
// MISSING LINE 340
// MISSING LINE 341
// MISSING LINE 342
// MISSING LINE 343
// MISSING LINE 344
// MISSING LINE 345
// MISSING LINE 346
// MISSING LINE 347
// MISSING LINE 348
// MISSING LINE 349
      <div className="flex flex-col items-center gap-2 select-none">

         <div className="relative" style={{ width: 140, height: 70 }}>

            <svg width="140" height="70" viewBox="0 0 140 70">

               <defs>

                  <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">

                     <stop offset="0%" stopColor="#10b981" />

                     <stop offset="50%" stopColor="#f59e0b" />

                     <stop offset="100%" stopColor="#ef4444" />

                  </linearGradient>

               </defs>

               {/* Background Track */}

               <path

                  d="M 10 65 A 60 60 0 0 1 130 65"

                  fill="none"

                  className="stroke-slate-200 dark:stroke-slate-800/80"

                  strokeWidth="8"

                  strokeLinecap="round"

               />

               {/* Active Gradient Fill */}

               <motion.path

                  d="M 10 65 A 60 60 0 0 1 130 65"

                  fill="none"

                  stroke="url(#gaugeGradient)"

                  strokeWidth="8"

                  strokeLinecap="round"

                  strokeDasharray="188"

                  initial={{ strokeDashoffset: 188 }}

                  animate={{ strokeDashoffset: 188 - (188 * percentage / 100) }}

                  transition={{ duration: 1.2, ease: "easeOut" }}

               />

            </svg>



            {/* Rotating Needle */}

            <motion.div

               className="absolute bottom-[2px] left-1/2 origin-bottom"

               style={{ width: 2.5, height: 45, marginLeft: -1.25 }}

               initial={{ rotate: -90 }}

               animate={{ rotate: needleAngle }}

               transition={{ type: "spring", stiffness: 45, damping: 13 }}

            >

               <div className="w-full h-full bg-slate-800 dark:bg-white rounded-full" />

               <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] bg-white rounded-full border border-slate-900 shadow-sm" />

            </motion.div>



            {/* Pivot dot */}

            <div className="absolute bottom-[1px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] bg-slate-900 dark:bg-white rounded-full border border-white dark:border-slate-800 shadow-sm z-10" />

         </div>



         {/* Aligned metrics numbers */}

         <div className="flex items-center justify-between w-[130px] mt-0.5">

            <span className="text-[10px] font-semibold text-slate-400 tabular-nums">0</span>

            <span className="text-[14px] font-bold text-slate-800 dark:text-white tabular-nums">{value.toFixed(1)}</span>

            <span className="text-[10px] font-semibold text-slate-400 tabular-nums">{max.toFixed(1)}</span>

         </div>

      </div>

   );

};



export default function RiskGuard() {

   const navigate = useNavigate();

   const [user, setUser] = useState<any>(null);

   const [authChecked, setAuthChecked] = useState(false);



   useEffect(() => {

      const checkUser = async () => {

         const { data: { session } } = await supabase.auth.getSession();

         if (!session?.user) {

            navigate("/login");

         } else {

            setUser(session.user);

            setAuthChecked(true);

         }

      };

      checkUser();

   }, [navigate]);



   // A. Risk Framework States

   const [maxLotActive, setMaxLotActive] = useState(false);

   const [drawdownGuardActive, setDrawdownGuardActive] = useState(false);

   const [maxDrawdown, setMaxDrawdown] = useState(15);

   const [weeklyDrawdown, setWeeklyDrawdown] = useState(20);

   const [monthlyDrawdown, setMonthlyDrawdown] = useState(25);

   const [stopAfterLoss, setStopAfterLoss] = useState(false);



   // B. AI Bot Engine States

   const [autoTrading, setAutoTrading] = useState(() => {

      try {

         const saved = localStorage.getItem('fialgo_risk_config');

         if (saved) {

            const config = JSON.parse(saved);

            return config.autoTrading === true;

         }

      } catch (e) { }

      return false;

   });

   const [tradeFreq, setTradeFreq] = useState("Medium");

   const [allowHedging, setAllowHedging] = useState(false);





   // Sync autoTrading state change to fialgo_risk_config instantly for layout warning banner

   useEffect(() => {

// MISSING LINE 451
// MISSING LINE 452
// MISSING LINE 453
// MISSING LINE 454
// MISSING LINE 455
// MISSING LINE 456
// MISSING LINE 457
// MISSING LINE 458
// MISSING LINE 459
// MISSING LINE 460
// MISSING LINE 461
// MISSING LINE 462
// MISSING LINE 463
// MISSING LINE 464
// MISSING LINE 465
// MISSING LINE 466
// MISSING LINE 467
// MISSING LINE 468
// MISSING LINE 469
// MISSING LINE 470
// MISSING LINE 471
// MISSING LINE 472
// MISSING LINE 473
// MISSING LINE 474
// MISSING LINE 475
// MISSING LINE 476
// MISSING LINE 477
// MISSING LINE 478
// MISSING LINE 479
// MISSING LINE 480
// MISSING LINE 481
// MISSING LINE 482
// MISSING LINE 483
// MISSING LINE 484
// MISSING LINE 485
// MISSING LINE 486
// MISSING LINE 487
// MISSING LINE 488
// MISSING LINE 489
// MISSING LINE 490
// MISSING LINE 491
// MISSING LINE 492
// MISSING LINE 493
// MISSING LINE 494
// MISSING LINE 495
// MISSING LINE 496
// MISSING LINE 497
// MISSING LINE 498
// MISSING LINE 499
// MISSING LINE 500
// MISSING LINE 501
// MISSING LINE 502
// MISSING LINE 503
// MISSING LINE 504
// MISSING LINE 505
// MISSING LINE 506
// MISSING LINE 507
// MISSING LINE 508
// MISSING LINE 509
// MISSING LINE 510
// MISSING LINE 511
// MISSING LINE 512
// MISSING LINE 513
// MISSING LINE 514
// MISSING LINE 515
// MISSING LINE 516
// MISSING LINE 517
// MISSING LINE 518
// MISSING LINE 519
// MISSING LINE 520
// MISSING LINE 521
// MISSING LINE 522
// MISSING LINE 523
// MISSING LINE 524
// MISSING LINE 525
// MISSING LINE 526
// MISSING LINE 527
// MISSING LINE 528
// MISSING LINE 529
// MISSING LINE 530
// MISSING LINE 531
// MISSING LINE 532
// MISSING LINE 533
// MISSING LINE 534
// MISSING LINE 535
// MISSING LINE 536
// MISSING LINE 537
// MISSING LINE 538
// MISSING LINE 539
// MISSING LINE 540
// MISSING LINE 541
// MISSING LINE 542
// MISSING LINE 543
// MISSING LINE 544
// MISSING LINE 545
// MISSING LINE 546
// MISSING LINE 547
// MISSING LINE 548
// MISSING LINE 549
// MISSING LINE 550
// MISSING LINE 551
// MISSING LINE 552
// MISSING LINE 553
// MISSING LINE 554
// MISSING LINE 555
// MISSING LINE 556
// MISSING LINE 557
// MISSING LINE 558
// MISSING LINE 559
// MISSING LINE 560
// MISSING LINE 561
// MISSING LINE 562
// MISSING LINE 563
// MISSING LINE 564
// MISSING LINE 565
// MISSING LINE 566
// MISSING LINE 567
// MISSING LINE 568
// MISSING LINE 569
// MISSING LINE 570
// MISSING LINE 571
// MISSING LINE 572
// MISSING LINE 573
// MISSING LINE 574
// MISSING LINE 575
// MISSING LINE 576
// MISSING LINE 577
// MISSING LINE 578
// MISSING LINE 579


   useEffect(() => {

      if (balance > 0 && startingCapital === 0) {

         setStartingCapital(balance);

         localStorage.setItem('fialgo_starting_capital', balance.toString());

      }

   }, [balance, startingCapital]);



   useEffect(() => {

      if (USE_DEMO_DATA) {

         setMaxDrawdown(DEMO_RISK_CONFIG.maxDrawdown);

         setWeeklyDrawdown(DEMO_RISK_CONFIG.weeklyDrawdown);

         setMonthlyDrawdown(DEMO_RISK_CONFIG.monthlyDrawdown);

         setStopAfterLoss(DEMO_RISK_CONFIG.stopAfterLoss);

         setTradeLimit(DEMO_RISK_CONFIG.tradeLimit);

         setRevengeGuard(DEMO_RISK_CONFIG.revengeGuard);

         setCooldownActive(DEMO_RISK_CONFIG.cooldownActive);

         setTargetCapital(DEMO_RISK_CONFIG.targetCapital);

         setStartingCapital(DEMO_RISK_CONFIG.startingCapital);

         setAutoTrading(DEMO_RISK_CONFIG.autoTrading);

         setMaxLot(DEMO_RISK_CONFIG.maxLot);

         setMaxLotActive(DEMO_RISK_CONFIG.maxLotActive);

         setDrawdownGuardActive(DEMO_RISK_CONFIG.drawdownGuardActive);

         setDisciplineActive(DEMO_RISK_CONFIG.disciplineActive);

      }

   }, []);



   const { userSubscription } = useTrading();

   const { canAccess } = usePlan();



   const currentProfit = Math.max(0, balance - (startingCapital || balance || 0));

   const progressPercent = targetCapital > 0 ? Math.min(100, (currentProfit / targetCapital) * 100) : 0;

   const xpValue = Math.floor(targetCapital / 8);

   const {

      config: dbConfig,

      saveConfig

   } = useRiskConfig(user?.id);



   // Sync database profile config

   useEffect(() => {

      if (dbConfig) {

