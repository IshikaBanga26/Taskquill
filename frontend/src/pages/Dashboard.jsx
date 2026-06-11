import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTasks from '../hooks/useTasks'
import TaskCard from '../components/TaskCard'
import { useTheme } from '../ThemeContext'

function Dashboard() {
  const { tasks, loading, error, addTask, deleteTask, toggleStatus, editTask } = useTasks()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { theme, toggleTheme } = useTheme()

  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const completedCount = tasks.filter(t => t.status === 'completed').length

  const handleAdd = async () => {
    if (!title.trim()) return
    await addTask(title, description)
    setTitle('')
    setDescription('')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'pending') return task.status === 'pending'
      if (filter === 'completed') return task.status === 'completed'
      return true
    })
    .filter(task => task.title.toLowerCase().includes(search.toLowerCase()))

  const pending = tasks.filter(t => t.status === 'pending').length
  const completed = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="dashboard">

        <nav className="navbar">
            <h1>TaskQuill</h1>
            <div className="nav-right">
                <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </nav>

      <div className="dashboard-body">

        <aside className="sidebar">
          <div className="greeting">
            {getGreeting()}.
            <span className="greeting-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="task-stats">
            <p className="section-label">Overview</p>
            <div className="stat-row">
              <span className="stat-label">Total</span>
              <span className="stat-val">{tasks.length}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Pending</span>
              <span className="stat-val">{pending}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Completed</span>
              <span className="stat-val">{completed}</span>
            </div>
          </div>

          <div className="add-task-box">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              maxLength={60}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="char-count">{title.length}/60</p>
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={handleAdd}>Add Task</button>
          </div>
        </aside>

        <main className="main-panel">
          {tasks.length > 0 && (
            <div className="progress-wrap">
              <div className="progress-top">
                <span>Today's progress</span>
                <span>{completedCount}/{tasks.length} done</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.round((completedCount / tasks.length) * 100)}%` }}
                />
              </div>
            </div>
          )}
          <div className="controls">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <div className="filter-btns">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                All ({tasks.length})
              </button>
              <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
                Pending ({pendingCount})
              </button>
              <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
                Completed ({completedCount})
              </button>
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          {loading ? (
            <p className="loading">Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="empty">No tasks yet — add one from the sidebar</p>
          ) : (
            <div className="task-list">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onDelete={deleteTask}
                  onToggle={toggleStatus}
                  onEdit={editTask}
                />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  )
}

export default Dashboard