import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-12 space-y-5 min-h-screen font-sans">
        {/* Empty Dashboard */}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
