import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const fetchTasks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });

    if (!error) setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("tasks").insert({
      ...newTask,
      user_id: user.id,
      due_date: newTask.due_date ? new Date(newTask.due_date) : null,
    });

    if (!error) {
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

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>

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
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          value={newTask.due_date}
          onChange={(e) =>
            setNewTask({ ...newTask, due_date: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`p-4 rounded border flex justify-between items-center ${
              task.completed ? "bg-green-100" : "bg-white"
            }`}
          >
            <div>
              <p
                className={`text-lg ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
              {task.due_date && (
                <p className="text-xs text-gray-400">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => toggleComplete(task.id, task.completed)}
              className="text-sm text-blue-600 underline"
            >
              {task.completed ? "Undo" : "Complete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
