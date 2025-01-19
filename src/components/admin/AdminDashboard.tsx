import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserManagement } from './UserManagement';
import { ProgramManagement } from './ProgramManagement';
import { SystemSettings } from './SystemSettings';
import { AdminHeader } from './AdminHeader';
import { StatsOverview } from './StatsOverview';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminHeader />
      
      <Routes>
        <Route index element={
          <>
            <StatsOverview />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
                {/* Add recent users component */}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Popular Programs</h3>
                {/* Add popular programs component */}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                {/* Add system status component */}
              </div>
            </div>
          </>
        } />
        <Route path="programs" element={<ProgramManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};