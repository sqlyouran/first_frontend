import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('(loading)')

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
      .then(setMessage)
      .catch(() => setMessage('(backend offline)'))
  }, [])

  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>Backend says: {message}</h1>
    </main>
  )
}

export default App
