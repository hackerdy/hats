// // components/TasksList.tsx
// 'use client'
// import { useEffect, useState } from 'react';
// import { useUser } from '@/context/UserContext';
// import Card from '@/components/ui/Card'; // Adjust the import path as necessary

// export default function TasksList() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       try {
//         const response = await fetch('/api/tasks/user-tasks');
//         const data = await response.json();
//         setTasks(data);
//       } catch (error) {
//         console.error('Failed to fetch tasks:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTasks();
//   }, [user]);

//   if (loading) return <div>Loading tasks...</div>;

//   return (
//     <div className="space-y-4">
//       {tasks.map(task => (
//         <TaskCard 
//           key={task.taskId}
//           task={task}
//           completed={task.completed}
//         />
//       ))}
//     </div>
//   );
// }