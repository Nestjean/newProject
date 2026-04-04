import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/test/")
      .then(res => setMessage(res.data.message))
      .catch(err => console.log(err));
  }, []);

  return <div className="text-3xl font-bold text-blue-500">{message}</div>;
}

export default App
