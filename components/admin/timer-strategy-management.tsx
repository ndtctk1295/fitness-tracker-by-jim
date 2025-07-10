'use client';

import { useState, useEffect } from 'react';
import {
  AlarmClock,
  Loader2,
  Plus,
  Pencil,
  Trash,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatTime } from '@/lib/stores/timer-store';

// Types for the admin component
interface AdminTimerStrategy {
  _id: string;
  userId: string;
  userName?: string;
  name: string;
  color: string;
  restDuration: number;
  activeDuration: number;
  createdAt: string;
  updatedAt: string;
}

export function TimerStrategyManagement() {
  const [timerStrategies, setTimerStrategies] = useState<AdminTimerStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<AdminTimerStrategy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#f59e0b',
    restDuration: 90,
    activeDuration: 60,
    userId: '',
  });
  const [deletingStrategyId, setDeletingStrategyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userFilter, setUserFilter] = useState('');

  const loadTimerStrategies = async () => {
    try {
      setLoading(true);
      // For admin, we'll need a different API endpoint that gets all timer strategies
      const response = await fetch('/api/admin/timer-strategies');
      if (!response.ok) {
        throw new Error('Failed to fetch timer strategies');
      }
      const data = await response.json();
      setTimerStrategies(data);
    } catch (error) {
      toast.error('Failed to load timer strategies');
      console.error('Error loading timer strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimerStrategies();
  }, []);

  const handleOpenCreateDialog = () => {
    setCurrentStrategy(null);
    setFormData({
      name: '',
      color: '#f59e0b',
      restDuration: 90,
      activeDuration: 60,
      userId: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (strategy: AdminTimerStrategy) => {
    setCurrentStrategy(strategy);
    setFormData({
      name: strategy.name,
      color: strategy.color,
      restDuration: strategy.restDuration,
      activeDuration: strategy.activeDuration,
      userId: strategy.userId,
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'restDuration' || name === 'activeDuration' ? parseInt(value, 10) || 0 : value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!formData.name || !formData.color) {
        toast.error('Name and color are required');
        return;
      }

      if (formData.restDuration < 5 || formData.activeDuration < 5) {
        toast.error('Rest and active durations must be at least 5 seconds');
        return;
      }

      if (currentStrategy) {
        // Update existing timer strategy
        await fetch(`/api/admin/timer-strategies/${currentStrategy._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            color: formData.color,
            restDuration: formData.restDuration,
            activeDuration: formData.activeDuration,
          }),
        });
        toast.success('Timer strategy updated successfully');
      } else {
        // Create new timer strategy (for a specific user)
        if (!formData.userId) {
          toast.error('User ID is required to create a timer strategy');
          return;
        }

        await fetch('/api/admin/timer-strategies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData
          }),
        });
        toast.success('Timer strategy created successfully');
      }

      setIsDialogOpen(false);
      loadTimerStrategies();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (strategyId: string) => {
    setDeletingStrategyId(strategyId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingStrategyId) return;

    try {
      setSubmitting(true);
      await fetch(`/api/admin/timer-strategies/${deletingStrategyId}`, {
        method: 'DELETE',
      });
      
      toast.success('Timer strategy deleted successfully');
      setIsDeleteDialogOpen(false);
      loadTimerStrategies();
    } catch (error) {
      toast.error('Failed to delete timer strategy');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStrategies = timerStrategies.filter(strategy => {
    if (!userFilter) return true;
    return strategy.userId.includes(userFilter) || 
           (strategy.userName && strategy.userName.toLowerCase().includes(userFilter.toLowerCase())) ||
           strategy.name.toLowerCase().includes(userFilter.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Timer Strategies Management</h2>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Timer Strategy
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Label htmlFor="user-filter" className="w-20">Filter</Label>
        <Input
          id="user-filter"
          placeholder="Filter by user or strategy name"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading timer strategies...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Rest Duration</TableHead>
                <TableHead>Active Duration</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStrategies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No timer strategies found</TableCell>
                </TableRow>
              ) : (
                filteredStrategies.map((strategy) => (
                  <TableRow key={strategy._id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: strategy.color }}></div>
                        {strategy.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: strategy.color }}
                        ></div>
                        {strategy.color}
                      </div>
                    </TableCell>
                    <TableCell>{formatTime(strategy.restDuration)}</TableCell>
                    <TableCell>{formatTime(strategy.activeDuration)}</TableCell>
                    <TableCell>{strategy.userName || strategy.userId}</TableCell>
                    <TableCell>{new Date(strategy.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(strategy)}
                        disabled={submitting}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleOpenDeleteDialog(strategy._id)}
                        disabled={submitting}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Timer Strategy Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentStrategy ? 'Edit Timer Strategy' : 'Create New Timer Strategy'}
            </DialogTitle>
            <DialogDescription>
              {currentStrategy
                ? 'Update timer strategy details.'
                : 'Fill in the details to create a new timer strategy.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!currentStrategy && (
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Strategy Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-16 p-1 h-10"
                  disabled={submitting}
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="flex-1"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="restDuration">Rest Duration (seconds)</Label>
              <Input
                id="restDuration"
                name="restDuration"
                type="number"
                min="5"
                max="600"
                value={formData.restDuration}
                onChange={handleInputChange}
                disabled={submitting}
              />
              <p className="text-sm text-gray-500">{formatTime(formData.restDuration)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activeDuration">Active Duration (seconds)</Label>
              <Input
                id="activeDuration"
                name="activeDuration"
                type="number"
                min="5"
                max="1800"
                value={formData.activeDuration}
                onChange={handleInputChange}
                disabled={submitting}
              />
              <p className="text-sm text-gray-500">{formatTime(formData.activeDuration)}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {currentStrategy ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the timer strategy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
