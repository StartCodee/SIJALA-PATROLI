import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Vessel,
  TrackPoint,
  Patrol,
  Incident,
  createInitialVessels,
  createInitialTrackPoints,
  createInitialPatrols,
  createInitialIncidents,
  updateVesselPosition,
  generateTrackPoint,
} from '@/data/mockData';

interface DataContextType {
  vessels: Vessel[];
  trackPoints: TrackPoint[];
  patrols: Patrol[];
  incidents: Incident[];
  selectedVesselId: string | null;
  setSelectedVesselId: (id: string | null) => void;
  addIncident: (incident: Omit<Incident, 'id'>) => Incident;
  getVesselById: (id: string) => Vessel | undefined;
  getPatrolById: (id: string) => Patrol | undefined;
  getIncidentById: (id: string) => Incident | undefined;
  getPatrolsByVesselId: (vesselId: string) => Patrol[];
  getIncidentsByPatrolId: (patrolId: string) => Incident[];
  getIncidentsByVesselId: (vesselId: string) => Incident[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vessels, setVessels] = useState<Vessel[]>(createInitialVessels);
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>(createInitialTrackPoints);
  const [patrols] = useState<Patrol[]>(createInitialPatrols);
  const [incidents, setIncidents] = useState<Incident[]>(createInitialIncidents);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);

  // Simulate real-time updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVessels(prevVessels => {
        const updatedVessels = prevVessels.map(updateVesselPosition);
        
        // Generate new track points for active vessels
        const newTrackPoints = updatedVessels
          .filter(v => v.status === 'aktif')
          .map(generateTrackPoint);
        
        if (newTrackPoints.length > 0) {
          setTrackPoints(prev => [...prev, ...newTrackPoints]);
        }
        
        return updatedVessels;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const addIncident = useCallback((incidentData: Omit<Incident, 'id'>): Incident => {
    const newIncident: Incident = {
      ...incidentData,
      id: `i-${Date.now()}`,
    };
    setIncidents(prev => [newIncident, ...prev]);
    return newIncident;
  }, []);

  const getVesselById = useCallback((id: string) => {
    return vessels.find(v => v.id === id);
  }, [vessels]);

  const getPatrolById = useCallback((id: string) => {
    return patrols.find(p => p.id === id);
  }, [patrols]);

  const getIncidentById = useCallback((id: string) => {
    return incidents.find(i => i.id === id);
  }, [incidents]);

  const getPatrolsByVesselId = useCallback((vesselId: string) => {
    return patrols.filter(p => p.vesselId === vesselId);
  }, [patrols]);

  const getIncidentsByPatrolId = useCallback((patrolId: string) => {
    return incidents.filter(i => i.patrolId === patrolId);
  }, [incidents]);

  const getIncidentsByVesselId = useCallback((vesselId: string) => {
    return incidents.filter(i => i.vesselId === vesselId);
  }, [incidents]);

  return (
    <DataContext.Provider
      value={{
        vessels,
        trackPoints,
        patrols,
        incidents,
        selectedVesselId,
        setSelectedVesselId,
        addIncident,
        getVesselById,
        getPatrolById,
        getIncidentById,
        getPatrolsByVesselId,
        getIncidentsByPatrolId,
        getIncidentsByVesselId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
