import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createInitialVessels, createInitialTrackPoints, createInitialPatrols, createInitialIncidents, createInitialFindings, createInitialVesselTypes, createInitialVesselSubtypes, createInitialViolationTypes, createInitialFindingViolationItems, createInitialMediaFiles, createInitialConservationAreas, createInitialGearTypes, createInitialPatrolEquipment, createInitialNonPermanentResources, createInitialPermanentResources, createInitialMegafaunaObservations, createInitialMonitoringHabitats, createInitialHabitatVisits, createInitialHabitatVisitViolationItems, createInitialCrew, createInitialGuardPosts, createInitialCrewAssignments, updateVesselPosition, generateTrackPoint, } from '@/data/mockData';
const DataContext = createContext(undefined);
export const DataProvider = ({ children }) => {
    const [vessels, setVessels] = useState(createInitialVessels);
    const [trackPoints, setTrackPoints] = useState(createInitialTrackPoints);
    const [patrols, setPatrols] = useState(createInitialPatrols);
    const [incidents, setIncidents] = useState(createInitialIncidents);
    const [findings, setFindings] = useState(createInitialFindings);
    const [vesselTypes] = useState(createInitialVesselTypes);
    const [vesselSubtypes] = useState(createInitialVesselSubtypes);
    const [violationTypes] = useState(createInitialViolationTypes);
    const [findingViolationItems] = useState(createInitialFindingViolationItems);
    const [mediaFiles] = useState(createInitialMediaFiles);
    const [conservationAreas] = useState(createInitialConservationAreas);
    const [gearTypes] = useState(createInitialGearTypes);
    const [patrolEquipment] = useState(createInitialPatrolEquipment);
    const [nonPermanentResources, setNonPermanentResources] = useState(createInitialNonPermanentResources);
    const [permanentResources, setPermanentResources] = useState(createInitialPermanentResources);
    const [megafaunaObservations, setMegafaunaObservations] = useState(createInitialMegafaunaObservations);
    const [monitoringHabitats, setMonitoringHabitats] = useState(createInitialMonitoringHabitats);
    const [habitatVisits, setHabitatVisits] = useState(createInitialHabitatVisits);
    const [habitatVisitViolationItems, setHabitatVisitViolationItems] = useState(createInitialHabitatVisitViolationItems);
    const [crew, setCrew] = useState(createInitialCrew);
    const [guardPosts, setGuardPosts] = useState(createInitialGuardPosts);
    const [crewAssignments, setCrewAssignments] = useState(createInitialCrewAssignments);
    const [selectedVesselId, setSelectedVesselId] = useState(null);
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
    const addIncident = useCallback((incidentData) => {
        const newIncident = {
            ...incidentData,
            id: `i-${Date.now()}`,
        };
        setIncidents(prev => [newIncident, ...prev]);
        return newIncident;
    }, []);
    const addVessel = useCallback((vesselData) => {
        const newVessel = {
            ...vesselData,
            id: `v-${Date.now()}`,
        };
        setVessels(prev => [newVessel, ...prev]);
        setTrackPoints(prev => [
            ...prev,
            {
                vesselId: newVessel.id,
                lat: newVessel.lastPosition.lat,
                lon: newVessel.lastPosition.lon,
                timestamp: newVessel.lastPosition.timestamp,
            },
        ]);
        return newVessel;
    }, []);
    const addPatrol = useCallback((patrolData) => {
        const newPatrol = {
            ...patrolData,
            id: `p-${Date.now()}`,
        };
        setPatrols(prev => [newPatrol, ...prev]);
        if (newPatrol.status === 'active') {
            setVessels(prev => prev.map(vessel => vessel.id === newPatrol.vesselId
                ? { ...vessel, patrolId: newPatrol.id }
                : vessel));
        }
        return newPatrol;
    }, []);
    const addCrew = useCallback((crewData) => {
        const newCrew = {
            ...crewData,
            id: `c-${Date.now()}`,
        };
        setCrew(prev => [newCrew, ...prev]);
        return newCrew;
    }, []);
    const addGuardPost = useCallback((postData) => {
        const newPost = {
            ...postData,
            id: `gp-${Date.now()}`,
        };
        setGuardPosts(prev => [newPost, ...prev]);
        return newPost;
    }, []);
    const addCrewAssignment = useCallback((assignmentData) => {
        const newAssignment = {
            ...assignmentData,
            id: `ca-${Date.now()}`,
        };
        setCrewAssignments(prev => [newAssignment, ...prev]);
        return newAssignment;
    }, []);
    const updateFinding = useCallback((id, updates) => {
        setFindings(prev => prev.map(finding => (finding.id === id ? { ...finding, ...updates } : finding)));
    }, []);
    const deleteFinding = useCallback((id) => {
        setFindings(prev => prev.filter(finding => finding.id !== id));
    }, []);
    const updateNonPermanentResource = useCallback((id, updates) => {
        setNonPermanentResources(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    }, []);
    const deleteNonPermanentResource = useCallback((id) => {
        setNonPermanentResources(prev => prev.filter(item => item.id !== id));
    }, []);
    const updatePermanentResource = useCallback((id, updates) => {
        setPermanentResources(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    }, []);
    const deletePermanentResource = useCallback((id) => {
        setPermanentResources(prev => prev.filter(item => item.id !== id));
    }, []);
    const updateMegafaunaObservation = useCallback((id, updates) => {
        setMegafaunaObservations(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    }, []);
    const deleteMegafaunaObservation = useCallback((id) => {
        setMegafaunaObservations(prev => prev.filter(item => item.id !== id));
    }, []);
    const updateMonitoringHabitat = useCallback((id, updates) => {
        setMonitoringHabitats(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    }, []);
    const deleteMonitoringHabitat = useCallback((id) => {
        setMonitoringHabitats(prev => prev.filter(item => item.id !== id));
        setHabitatVisits(prev => prev.filter(item => item.monitoringId !== id));
        setHabitatVisitViolationItems(prev => prev.filter(item => {
            const visit = habitatVisits.find(visitItem => visitItem.id === item.habitatVisitId);
            return visit ? visit.monitoringId !== id : true;
        }));
    }, [habitatVisits]);
    const updateCrew = useCallback((id, updates) => {
        setCrew(prev => prev.map(member => (member.id === id ? { ...member, ...updates } : member)));
    }, []);
    const updateGuardPost = useCallback((id, updates) => {
        setGuardPosts(prev => prev.map(post => (post.id === id ? { ...post, ...updates } : post)));
    }, []);
    const updateCrewAssignment = useCallback((id, updates) => {
        setCrewAssignments(prev => prev.map(assignment => (assignment.id === id ? { ...assignment, ...updates } : assignment)));
    }, []);
    const deleteCrew = useCallback((id) => {
        setCrew(prev => prev.filter(member => member.id !== id));
        setCrewAssignments(prev => prev.filter(assignment => assignment.crewId !== id));
    }, []);
    const deleteGuardPost = useCallback((id) => {
        setGuardPosts(prev => prev.filter(post => post.id !== id));
        setCrew(prev => prev.map(member => member.basePostId === id ? { ...member, basePostId: null } : member));
    }, []);
    const deleteCrewAssignment = useCallback((id) => {
        setCrewAssignments(prev => prev.filter(assignment => assignment.id !== id));
    }, []);
    const getVesselById = useCallback((id) => {
        return vessels.find(v => v.id === id);
    }, [vessels]);
    const getPatrolById = useCallback((id) => {
        return patrols.find(p => p.id === id);
    }, [patrols]);
    const getIncidentById = useCallback((id) => {
        return incidents.find(i => i.id === id);
    }, [incidents]);
    const getFindingById = useCallback((id) => {
        return findings.find(finding => finding.id === id);
    }, [findings]);
    const getNonPermanentResourceById = useCallback((id) => {
        return nonPermanentResources.find(item => item.id === id);
    }, [nonPermanentResources]);
    const getPermanentResourceById = useCallback((id) => {
        return permanentResources.find(item => item.id === id);
    }, [permanentResources]);
    const getMegafaunaObservationById = useCallback((id) => {
        return megafaunaObservations.find(item => item.id === id);
    }, [megafaunaObservations]);
    const getMonitoringHabitatById = useCallback((id) => {
        return monitoringHabitats.find(item => item.id === id);
    }, [monitoringHabitats]);
    const getCrewById = useCallback((id) => {
        return crew.find(member => member.id === id);
    }, [crew]);
    const getGuardPostById = useCallback((id) => {
        return guardPosts.find(post => post.id === id);
    }, [guardPosts]);
    const getPatrolsByVesselId = useCallback((vesselId) => {
        return patrols.filter(p => p.vesselId === vesselId);
    }, [patrols]);
    const getIncidentsByPatrolId = useCallback((patrolId) => {
        return incidents.filter(i => i.patrolId === patrolId);
    }, [incidents]);
    const getIncidentsByVesselId = useCallback((vesselId) => {
        return incidents.filter(i => i.vesselId === vesselId);
    }, [incidents]);
    const getAssignmentsByPatrolId = useCallback((patrolId) => {
        return crewAssignments.filter(a => a.patrolId === patrolId);
    }, [crewAssignments]);
    const getAssignmentsByCrewId = useCallback((crewId) => {
        return crewAssignments.filter(a => a.crewId === crewId);
    }, [crewAssignments]);
    return (<DataContext.Provider value={{
            vessels,
            trackPoints,
            patrols,
            incidents,
            findings,
            vesselTypes,
            vesselSubtypes,
            violationTypes,
            findingViolationItems,
            mediaFiles,
            conservationAreas,
            gearTypes,
            patrolEquipment,
            nonPermanentResources,
            permanentResources,
            megafaunaObservations,
            monitoringHabitats,
            habitatVisits,
            habitatVisitViolationItems,
            crew,
            guardPosts,
            crewAssignments,
            selectedVesselId,
            setSelectedVesselId,
            addIncident,
            addVessel,
            addPatrol,
            addCrew,
            addGuardPost,
            addCrewAssignment,
            updateFinding,
            deleteFinding,
            updateNonPermanentResource,
            deleteNonPermanentResource,
            updatePermanentResource,
            deletePermanentResource,
            updateMegafaunaObservation,
            deleteMegafaunaObservation,
            updateMonitoringHabitat,
            deleteMonitoringHabitat,
            updateCrew,
            updateGuardPost,
            updateCrewAssignment,
            deleteCrew,
            deleteGuardPost,
            deleteCrewAssignment,
            getVesselById,
            getPatrolById,
            getIncidentById,
            getFindingById,
            getNonPermanentResourceById,
            getPermanentResourceById,
            getMegafaunaObservationById,
            getMonitoringHabitatById,
            getCrewById,
            getGuardPostById,
            getPatrolsByVesselId,
            getIncidentsByPatrolId,
            getIncidentsByVesselId,
            getAssignmentsByPatrolId,
            getAssignmentsByCrewId,
        }}>
      {children}
    </DataContext.Provider>);
};
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
