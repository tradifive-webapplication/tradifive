-- Migration: Payroll History & Payslips
-- 0004_payroll_history.sql

CREATE TYPE public.hr_payslip_status AS ENUM ('pending', 'paid', 'failed');

-- Payslips Table
CREATE TABLE IF NOT EXISTS public.hr_payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    base_amount NUMERIC NOT NULL,
    bonus_amount NUMERIC DEFAULT 0,
    deductions NUMERIC DEFAULT 0,
    net_amount NUMERIC NOT NULL,
    status public.hr_payslip_status DEFAULT 'paid',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.hr_payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payslips" ON public.hr_payslips FOR SELECT USING (true);
CREATE POLICY "Admins can manage payslips" ON public.hr_payslips FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

-- Generate some mock history for existing employees
-- Assuming the employees created in 0003_seed_hr_data.sql have some IDs, we will write a PL/pgSQL block to populate past 3 months.
DO $$
DECLARE
    emp RECORD;
    month_start DATE;
    month_end DATE;
    pay_date TIMESTAMPTZ;
    bonus NUMERIC;
    deduct NUMERIC;
    base_monthly NUMERIC;
    net NUMERIC;
BEGIN
    FOR emp IN SELECT id, salary FROM public.hr_employees WHERE salary IS NOT NULL LOOP
        base_monthly := round(emp.salary / 12);
        
        -- Last 3 months payslips
        FOR i IN 1..3 LOOP
            month_start := date_trunc('month', current_date - (i || ' months')::interval)::date;
            month_end := (date_trunc('month', current_date - ((i - 1) || ' months')::interval) - interval '1 day')::date;
            pay_date := (month_end + interval '1 day' + interval '9 hours')::timestamptz;
            
            -- Randomize a bit of bonus and deductions
            IF random() > 0.7 THEN
                bonus := round((random() * 5000)::numeric, 2);
            ELSE
                bonus := 0;
            END IF;
            
            deduct := round(base_monthly * 0.25); -- 25% tax/deductions
            net := base_monthly + bonus - deduct;
            
            INSERT INTO public.hr_payslips (
                employee_id, pay_period_start, pay_period_end, base_amount, bonus_amount, deductions, net_amount, status, paid_at
            ) VALUES (
                emp.id, month_start, month_end, base_monthly, bonus, deduct, net, 'paid', pay_date
            );
        END LOOP;
        
        -- Add one pending payslip for the current month
        month_start := date_trunc('month', current_date)::date;
        month_end := (date_trunc('month', current_date + interval '1 month') - interval '1 day')::date;
        deduct := round(base_monthly * 0.25);
        net := base_monthly - deduct;
        
        INSERT INTO public.hr_payslips (
            employee_id, pay_period_start, pay_period_end, base_amount, bonus_amount, deductions, net_amount, status, paid_at
        ) VALUES (
            emp.id, month_start, month_end, base_monthly, 0, deduct, net, 'pending', NULL
        );
        
    END LOOP;
END $$;
