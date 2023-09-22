import React, { useState } from 'react'
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
    [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://127.0.0.1:3001/api/register', formData)
      console.log(response.data)
    } catch (error) {
      console.log('Error during registration', error)
    }
  }

  return (
    <div className="w-full h-100vh">
      <form action="" onSubmit={handleSubmit} className="flex flex-col items-center bg-gray-200 p-10 rounded-lg shadow-lg w-96 mx-auto mt-20">
        <label htmlFor="username">
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            className="mb-5 p-3 w-80 bg-gray-200 rounded-md shadow-inner focus:outline-none"
            style={{
              boxShadow: '3px 3px 5px #babecc, -3px -3px 5px #ffffff'
            }} />
        </label>
        <label htmlFor="email">
          <input
            type="email"
            name="email"
            placeholder="adresse@email.com"
            value={formData.email}
            onChange={handleChange}
            className="mb-5 p-3 w-80 bg-gray-200 rounded-md shadow-inner focus:outline-none"
            style={{
              boxShadow: '3px 3px 5px #babecc, -3px -3px 5px #ffffff'
            }} />
        </label>
        <label htmlFor="password">
          <input
            type="password"
            name="password"
            placeholder="M0t2P44ssSuperSéCu%"
            value={formData.password}
            onChange={handleChange}
            className="mb-5 p-3 w-80 bg-gray-200 rounded-md shadow-inner focus:outline-none"
            style={{
              boxShadow: '3px 3px 5px #babecc, -3px -3px 5px #ffffff'
            }} />
        </label>
        <button
          type="submit"
          className="mt-5 p-3 w-80 bg-gray-200 rounded-md focus:outline-none"
          style={{
            boxShadow: '3px 3px 5px #babecc, -3px -3px 5px #ffffff'
          }} >Register</button>
      </form>
    </div>
  )
}

export default Register