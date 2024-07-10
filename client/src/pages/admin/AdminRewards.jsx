import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${apiUrl}/rewards`);
      setRewards(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des trophées:', error);
    }
  };

  const handleEdit = (reward) => {
    setSelectedReward(reward);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/rewards/${id}`);
      fetchRewards();
    } catch (error) {
      console.error('Erreur lors de la suppression du trophée:', error);
    }
  };

  return (
    <div>
      <h1>Administration des Trophées</h1>
      <Link to="/admin">Retour à l'administration</Link>
      <button onClick={() => { setSelectedReward(null); setShowForm(true); }}>Ajouter un Trophée</button>
      <ul>
        {rewards.map((reward) => (
          <li key={reward.id}>
            <img src={`${apiUrl}/img/trophies/${reward.image}`} alt={reward.name} width="50" />
            <p>{reward.name}</p>
            <button onClick={() => handleEdit(reward)}>Éditer</button>
            <button onClick={() => handleDelete(reward.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
      {showForm && <RewardForm reward={selectedReward} onClose={() => { setShowForm(false); fetchRewards(); }} />}
    </div>
  );
};

const RewardForm = ({ reward, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: null,
    rank: '',
    type: false
  });

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        slug: reward.slug,
        description: reward.description,
        image: reward.image,
        rank: reward.rank,
        type: reward.type
      });
    }
  }, [reward]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    try {
      if (reward) {
        await axios.put(`${apiUrl}/rewards/${reward.id}`, data);
      } else {
        await axios.post(`${apiUrl}/rewards`, data);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du trophée:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom" required />
      <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug" required />
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
      <input type="file" name="image" onChange={handleFileChange} />
      <input type="text" name="rank" value={formData.rank} onChange={handleChange} placeholder="Rank" required />
      <label>
        Type:
        <input type="checkbox" name="type" checked={formData.type} onChange={handleChange} />
      </label>
      <button type="submit">Sauvegarder</button>
      <button type="button" onClick={onClose}>Annuler</button>
    </form>
  );
};

export default AdminRewards;
