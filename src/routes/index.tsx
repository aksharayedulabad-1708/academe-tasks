import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, Circle, Clock, ListTodo, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo.png.asset.json";

type Task = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "pending" | "completed";

const STORAGE_KEY = "student-task-tracker-tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Task Tracker" },
      { name: "description", content: "A simple, clean task tracker for students." },
      { property: "og:title", content: "Student Task Tracker" },
      { property: "og:description", content: "A simple, clean task tracker for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentTaskTracker,
});

function StudentTaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        setTasks(parsed);
      }
    } catch {
      // Ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, hydrated]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError("Please enter a task title.");
      return;
    }
    setTitleError(null);
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      dueDate,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDueDate("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "pending":
        return tasks.filter((t) => !t.completed);
      case "completed":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const formatDate = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (!dueDate || completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <img
            src={logoAsset.url}
            alt="Student Task Tracker"
            className="mx-auto mb-3 h-20 w-20 rounded-2xl object-contain"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Student Task Tracker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay on top of assignments, readings, and deadlines.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<ChecklistIcon className="h-4 w-4" />}
            label="Total Tasks"
            value={total}
            color="primary"
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Completed"
            value={completed}
            color="success"
          />
          <SummaryCard
            icon={<Clock className="h-4 w-4" />}
            label="Pending"
            value={pending}
            color="warning"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a new task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTask} className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-1 space-y-2">
                <Input
                  type="text"
                  placeholder="What do you need to do?"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setTitleError(null);
                  }}
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? "title-error" : undefined}
                  className={cn(titleError && "border-destructive focus-visible:ring-destructive")}
                />
                {titleError && (
                  <p id="title-error" className="text-xs text-destructive">
                    {titleError}
                  </p>
                )}
              </div>
              <div className="w-full sm:w-auto">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full sm:w-44"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </form>
          </CardContent>
        </Card>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {!hydrated ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading tasks…</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "transition-colors",
                  task.completed && "bg-muted/30",
                )}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                    aria-label={task.completed ? "Mark as pending" : "Mark as completed"}
                  />
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        "block cursor-pointer text-sm font-medium leading-5",
                        task.completed && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </label>
                    {task.dueDate && (
                      <div
                        className={cn(
                          "mt-1 flex items-center gap-1 text-xs",
                          isOverdue(task.dueDate, task.completed)
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>
                          {isOverdue(task.dueDate, task.completed) ? "Overdue: " : "Due: "}
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "primary" | "success" | "warning";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className={cn("rounded-lg p-1.5", colorClasses[color])}>{icon}</span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const messages = {
    all: {
      title: "No tasks yet",
      description: "Add your first task above and start making progress.",
      icon: <BookOpen className="h-8 w-8 text-muted-foreground" />,
    },
    pending: {
      title: "All caught up!",
      description: "You have no pending tasks. Great job!",
      icon: <CheckCircle2 className="h-8 w-8 text-emerald-500" />,
    },
    completed: {
      title: "No completed tasks",
      description: "Finish a task and it will show up here.",
      icon: <Circle className="h-8 w-8 text-muted-foreground" />,
    },
  };

  const { title, description, icon } = messages[filter];

  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
