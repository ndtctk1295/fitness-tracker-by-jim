"use client"

import { useEffect, useState } from "react"
import { PlusCircle, Trash2, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/lib/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { formatTime } from "@/lib/stores/timer-store"
import { timerStrategyService, TimerStrategy } from "@/lib/services/timer-strategy-service"
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog"

const timerStrategySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color code",
  }),
  restDuration: z.coerce
    .number()
    .min(5, { message: "Rest duration must be at least 5 seconds" })
    .max(600, { message: "Rest duration can't exceed 10 minutes" }),
  activeDuration: z.coerce
    .number()
    .min(5, { message: "Active duration must be at least 5 seconds" })
    .max(1800, { message: "Active duration can't exceed 30 minutes" }),
})

export default function TimerStrategiesPage() {
  const [open, setOpen] = useState(false)
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null)
  const [timerStrategies, setTimerStrategies] = useState<TimerStrategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [strategyToDelete, setStrategyToDelete] = useState<TimerStrategy | null>(null)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof timerStrategySchema>>({
    resolver: zodResolver(timerStrategySchema),
    defaultValues: {
      name: "",
      color: "#f59e0b",
      restDuration: 90,
      activeDuration: 60,
    },
  })

  const fetchTimerStrategies = async () => {
    try {
      setIsLoading(true)
      const strategies = await timerStrategyService.getAll()
      setTimerStrategies(strategies)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load timer strategies",
        variant: "destructive",
      })
      console.error("Error fetching timer strategies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTimerStrategies()
  }, [])

  const onSubmit = async (data: z.infer<typeof timerStrategySchema>) => {
    try {
      if (editingStrategyId) {
        await timerStrategyService.update(editingStrategyId, data)
        toast({
          title: "Success", 
          description: "Timer strategy updated successfully"
        })
      } else {
        await timerStrategyService.create(data)
        toast({
          title: "Success", 
          description: "Timer strategy created successfully"
        })
      }
      
      setOpen(false)
      form.reset()
      setEditingStrategyId(null)
      fetchTimerStrategies()
    } catch (error) {
      toast({
        title: "Error",
        description: editingStrategyId 
          ? "Failed to update timer strategy" 
          : "Failed to create timer strategy",
        variant: "destructive",
      })
      console.error("Error submitting form:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await timerStrategyService.delete(id)
      toast({
        title: "Success",
        description: "Timer strategy deleted successfully"
      })
      fetchTimerStrategies()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete timer strategy",
        variant: "destructive",
      })
      console.error("Error deleting timer strategy:", error)
    }
  }

  const handleDeleteClick = (strategy: TimerStrategy) => {
    setStrategyToDelete(strategy)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (strategyToDelete) {
      await handleDelete(strategyToDelete._id)
      setStrategyToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setStrategyToDelete(null)
  }

  const handleEdit = (id: string) => {
    const strategy = timerStrategies.find((s) => s._id === id)
    if (strategy) {
      form.reset({
        name: strategy.name,
        color: strategy.color,
        restDuration: strategy.restDuration,
        activeDuration: strategy.activeDuration,
      })
      setEditingStrategyId(id)
      setOpen(true)
    }
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Timer Strategy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStrategyId ? "Edit Timer Strategy" : "Add Timer Strategy"}
              </DialogTitle>
              <DialogDescription>
                Create a new timer strategy for your workouts
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Strategy name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <Input 
                          value={field.value} 
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="restDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rest Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Duration of rest periods in seconds
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="activeDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Duration of active workout periods in seconds
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : timerStrategies.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <p className="text-muted-foreground">No timer strategies found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timerStrategies.map((strategy) => (
            <Card key={strategy._id}>
              <div 
                className="h-2 w-full rounded-t-md" 
                style={{ backgroundColor: strategy.color }}
              />
              <CardHeader>
                <CardTitle>{strategy.name}</CardTitle>
                <CardDescription>Timer Strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rest Time:</span>
                    <span className="font-medium">{formatTime(strategy.restDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Time:</span>
                    <span className="font-medium">{formatTime(strategy.activeDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{new Date(strategy.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleEdit(strategy._id)}>
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteClick(strategy)}
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Timer Strategy"
        description="Are you sure you want to delete this timer strategy? This action cannot be undone."
        // itemToDelete={strategyToDelete?.name}
        confirmText="Delete Strategy"
      />
    </div>
  )
}
