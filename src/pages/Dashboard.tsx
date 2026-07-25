import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="max-w-[1600px] mx-auto min-h-[500px] flex items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-400">Dashboard is currently empty</h1>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
