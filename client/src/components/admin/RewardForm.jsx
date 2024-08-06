import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const RewardForm = ({ reward, onClose }) => {
    const [cookies] = useCookies(['token']);
    const token = localStorage.getItem('token') || cookies.token;
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: "",
        slug: '',
        rank: 'bronze',
        type: 'trophy'
    });

    useEffect(() => {
        if (reward) {
            setFormData({
                name: reward.name,
                description: reward.description,
                image: reward.image,
                slug: reward.slug,
                rank: reward.rank,
                type: reward.type || 'trophy'
            });
        }
    }, [reward]);

    const formatSlug = (value) => {
        return value
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'slug') {
            setFormData({
                ...formData,
                [name]: formatSlug(value)
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            image: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedSlug = formatSlug(formData.slug);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('slug', formattedSlug);
        data.append('rank', formData.rank);
        data.append('type', formData.type);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (reward) {
                await axios.put(`${apiUrl}/api/rewards/${reward.id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${apiUrl}/api/rewards`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            onClose();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du trophée:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nom"
                required
                className="w-full px-4 py-2 border rounded"
            />
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                required
                className="w-full px-4 py-2 border rounded"
            />
            <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="slug_du_trophee"
                required
                className="w-full px-4 py-2 border rounded"
            />
            <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded"
            />
            <select
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
            >
                <option value="bronze">Bronze</option>
                <option value="silver">Argent</option>
                <option value="gold">Or</option>
                <option value="legendary">Légendaire</option>
            </select>
            <div className="flex justify-between">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Sauvegarder
                </button>
                <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
                    Annuler
                </button>
            </div>
        </form>
    );
};

export default RewardForm;
