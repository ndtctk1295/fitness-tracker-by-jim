'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Users, FolderOpen, Dumbbell, Loader2, Weight, Clock } from 'lucide-react';
import { UserManagement } from '@/components/admin/user-management';
import { CategoryManagement } from '@/components/admin/category-management';
import { ExerciseManagement } from '@/components/admin/exercise-management';
import { WeightManagement } from '@/components/admin/weight-management';
import { TimerStrategyManagement } from '@/components/admin/timer-strategy-management';
import { userClientService } from '@/lib/services/user-client-service';
import { categoryService } from '@/lib/services/category-service';
import { exerciseService } from '@/lib/services/exercise-service';
import { weightPlateService } from '@/lib/services/weight-plate-service';

export default function AdminPage() {
  const { data: session } = useSession();  const [stats, setStats] = useState({
    users: 0,
    categories: 0,
    exercises: 0,
    weights: 0,
    timerStrategies: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, categories, exercises, weights, timerStrategies] = await Promise.all([
          userClientService.getAll(),
          categoryService.getAll(),
          exerciseService.getAll(),
          fetch('/api/admin/weights').then(res => res.json()),
          fetch('/api/admin/timer-strategies').then(res => res.json())
        ]);
        
        setStats({
          users: users.length,
          categories: categories.length,
          exercises: exercises.length,
          weights: weights.length,
          timerStrategies: timerStrategies.length,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}. Manage your fitness app content here.
        </p>
      </div>
      <Separator />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.users}</div>
                <p className="text-xs text-muted-foreground">Total registered users</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.categories}</div>
                <p className="text-xs text-muted-foreground">Total exercise categories</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercises</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.exercises}</div>
                <p className="text-xs text-muted-foreground">Total exercises created</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight Plates</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.weights}</div>
                <p className="text-xs text-muted-foreground">Total weight plates</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timer Strategies</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.timerStrategies}</div>
                <p className="text-xs text-muted-foreground">Total timer strategies</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
        <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="weights">Weight Plates</TabsTrigger>
          <TabsTrigger value="timerStrategies">Timer Strategies</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories Management</CardTitle>
              <CardDescription>
                Create and manage exercise categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exercises Management</CardTitle>
              <CardDescription>
                Create and manage exercises available to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExerciseManagement />            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weight Plates Management</CardTitle>
              <CardDescription>
                Manage weight plates for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeightManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timerStrategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timer Strategies Management</CardTitle>
              <CardDescription>
                Manage workout timer strategies for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimerStrategyManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
