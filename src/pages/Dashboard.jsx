import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", due_date: "" });
  const [filter, setFilter] = useState("all");

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user.id)
      .order("due_date", { ascending: true });

    if (error) console.error(error);
    else setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title) return;

    const { error } = await supabase.from("tasks").insert({
      ...newTask,
      user_id: (await supabase.auth.getUser()).data.user.id,
      due_date: newTask.due_date ? new Date(newTask.due_date) : null,
    });

    if (error) console.error(error);
    else {
      setNewTask({ title: "", description: "", due_date: "" });
      fetchTasks();
    }
  };

  const toggleComplete = async (id, current) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !current })
      .eq("id", id);

    if (!error) fetchTasks();
  };

  const filteredTasks = tasks.filter((task) => {
    const now = new Date();
    if (filter === "overdue") return task.due_date && !task.completed && new Date(task.due_date) < now;
    if (filter === "upcoming") return task.due_date && !task.completed && new Date(task.due_date) >= now;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {["all", "overdue", "upcoming", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm capitalize border ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task Input */}
      <div className="space-y-2 mb-6">
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="datetime-local"
          value={newTask.due_date}
          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Add Task
        </button>
      </div>

      {/* Task List */}
      <ul className="space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No tasks in this view.</p>
        ) : (
          filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`p-4 rounded border flex justify-between items-start flex-col gap-1 ${
                task.completed ? "bg-green-100" : "bg-white"
              }`}
            >
              <div>
                <p className={`text-lg font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>
                  {task.title}
                </p>
                {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                {task.due_date && (
                  <p className="text-xs text-gray-400">
                    Due: {dayjs(task.due_date).format("MMM D, YYYY h:mm A")}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleComplete(task.id, task.completed)}
                className="text-sm text-blue-600 underline self-end"
              >
                {task.completed ? "Undo" : "Mark Complete"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
