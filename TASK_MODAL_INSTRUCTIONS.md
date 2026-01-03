// Add this onClick handler to your task card div in the Kanban board
// Find the task card div and add: onClick={() => setSelectedTask(task)}

// Then add this at the end of your component, before the closing </div>:

{selectedTask && (
  <TaskDetailModal
    task={selectedTask}
    projectKey={project.key}
    onClose={() => setSelectedTask(null)}
  />
)}
