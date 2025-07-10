'use client';

import { AdminApiTester } from '@/components/admin/admin-api-tester';
import { Separator } from '@/components/ui/separator';

export default function ScheduledExercisesAdminPage() {
  return (
    <div className="max-w-5xl py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scheduled Exercises Admin</h1>
        <p className="text-muted-foreground">Manage user scheduled exercises</p>
      </div>
      
      <Separator />
      
      <AdminApiTester />
    </div>
  );
}
