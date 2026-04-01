import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, MapPin, Calendar, Car, Gauge, Bell, Shield, Trash2, LogOut, Award, CheckCircle2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { Button as NeonButton } from '../components/ui/neon-button';
import { useApp } from '../context/AppContext';
import { calculateCarAge } from '../services/ecoService';
import { CAR_MODELS } from '../constants';

export function Profile() {
  const { state, updateUser, resetData, logout } = useApp();
  const carAge = calculateCarAge(state.user.carPurchaseDate);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(state.user);

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900">User Profile</h1>
        <NeonButton 
          variant={isEditing ? 'solid' : 'default'} 
          size="sm" 
          className="h-10 px-6 rounded-xl text-white bg-[#065A82]"
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </NeonButton>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="flex flex-col items-center text-center py-12">
            <div className="w-32 h-32 bg-[#065A82] rounded-3xl flex items-center justify-center text-5xl text-white mb-6 shadow-xl">
              {state.user.name.charAt(0)}
            </div>
            {isEditing ? (
              <input 
                className="text-2xl font-black text-gray-900 text-center bg-gray-50 border-b-2 border-[#065A82] outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <h2 className="text-2xl font-black text-gray-900">{state.user.name}</h2>
            )}
            <p className="text-gray-500 font-bold mt-1">{state.user.email}</p>
            
            <div className="grid grid-cols-2 gap-4 w-full mt-12 pt-12 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900">12</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900">₹10.2k</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saved</div>
              </div>
            </div>
          </Card>

          <Card title="Badges Earned">
            <div className="grid grid-cols-4 gap-4 mt-2">
              {state.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    badge.earned ? 'bg-blue-50 grayscale-0' : 'bg-gray-50 grayscale opacity-30'
                  }`}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card title="Car Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-6">
                <ProfileItem 
                  icon={<Car size={18} />} 
                  label="Make/Model" 
                  value={state.user.carModel} 
                  isEditing={isEditing}
                  type="select"
                  options={CAR_MODELS}
                  onChange={(val) => setFormData({ ...formData, carModel: val })}
                />
                <ProfileItem 
                  icon={<Calendar size={18} />} 
                  label="Purchase Date" 
                  value={state.user.carPurchaseDate} 
                  isEditing={isEditing}
                  type="date"
                  onChange={(val) => setFormData({ ...formData, carPurchaseDate: val })}
                />
                <ProfileItem 
                  icon={<Gauge size={18} />} 
                  label="Current Mileage" 
                  value={`${state.user.mileage.toLocaleString()} km`} 
                  isEditing={isEditing}
                  type="number"
                  onChange={(val) => setFormData({ ...formData, mileage: parseInt(val) || 0 })}
                />
                <ProfileItem 
                  icon={<Calendar size={18} />} 
                  label="Last Tyre Change" 
                  value={state.user.lastTyreChangeYear || 'Not set'} 
                  isEditing={isEditing}
                  type="number"
                  onChange={(val) => setFormData({ ...formData, lastTyreChangeYear: parseInt(val) || 0 })}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-center">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Car Age Analysis</div>
                <div className="text-3xl font-black text-gray-900 mb-1">{carAge.displayText}</div>
                <p className={`text-sm font-bold mt-4 ${carAge.totalMonths > 72 ? 'text-red-500' : 'text-gray-600'}`}>
                  {carAge.tyreWarning}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recommended Action</div>
                  <div className="text-sm font-bold text-[#065A82]">{carAge.recommendedAction}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="App Settings">
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <Bell size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Notifications</div>
                    <div className="text-xs text-gray-500 font-bold">Weekly reports & maintenance alerts</div>
                  </div>
                </div>
                <div className="w-12 h-6 bg-[#065A82] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Privacy Mode</div>
                    <div className="text-xs text-gray-500 font-bold">Hide profile from leaderboards</div>
                  </div>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col md:flex-row gap-4">
            <Button variant="outline" className="flex-1 gap-2 text-red-500 border-red-100 hover:bg-red-50" onClick={resetData}>
              <Trash2 size={18} /> Reset All Data
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={logout}>
              <LogOut size={18} /> Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value, isEditing, type, options, onChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{icon}</div>
        <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
      {isEditing ? (
        type === 'select' ? (
          <select 
            className="bg-gray-50 p-2 rounded-lg font-bold text-gray-900 outline-none border border-gray-200"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={type}
            className="bg-gray-50 p-2 rounded-lg font-bold text-gray-900 outline-none border border-gray-200 text-right"
            value={value.toString().replace(' km', '')}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : (
        <div className="font-black text-gray-900">{value}</div>
      )}
    </div>
  );
}
