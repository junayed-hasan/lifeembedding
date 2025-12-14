import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import { OrbitView } from '@deck.gl/core';
import { getClusterColor } from '../utils/colors';

// Optimized initial view state - FIT TO SCREEN on load
const INITIAL_VIEW_STATE = {
  target: [0, 7, 11],         // Center on the data center point
  rotationX: 45,              // Better 3D perspective
  rotationOrbit: 30,          // Slight rotation for depth
  zoom: 4,                   // FILLS SCREEN - shows full extended starburst
  minZoom: -5,                // Can zoom far out to see full extent
  maxZoom: 12,                // Can zoom even closer for details
};

const VisualizationView = ({ persons, clusters, onPersonClick, selectedPersonId, selectedCluster, userEmbedding }) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [hoveredPerson, setHoveredPerson] = useState(null);

  // Data center point (approximate center of all person coordinates) - MUST BE DEFINED BEFORE useMemo
  const dataCenter = [0, 7, 11];
  const EXTENSION_FACTOR = 5;

  // Combine existing persons with user embedding if present
  const allPersons = React.useMemo(() => {
    if (!userEmbedding) return persons;
    
    try {
      // Validate user embedding has required fields
      if (!userEmbedding.coordinates || userEmbedding.coordinates.length !== 3) {
        console.error('Invalid user embedding coordinates:', userEmbedding);
        return persons;
      }
      
      // Log coordinates for debugging
      console.log('User embedding coordinates:', userEmbedding.coordinates);
      
      // Calculate what the extended position will be
      const rawX = userEmbedding.coordinates[0];
      const rawY = userEmbedding.coordinates[1];
      const rawZ = userEmbedding.coordinates[2];
      
      // Check if coordinates are too close to data center (would result in minimal extension)
      let offsetX = rawX - dataCenter[0];
      let offsetY = rawY - dataCenter[1];
      let offsetZ = rawZ - dataCenter[2];
      const distanceFromCenter = Math.sqrt(offsetX**2 + offsetY**2 + offsetZ**2);
      
      console.log('User raw coordinates:', [rawX, rawY, rawZ]);
      console.log('Distance from data center:', distanceFromCenter);
      
      // IMPORTANT: If the user point is too close to center, give it a minimum offset
      // so it's visible after the 5x extension
      const MIN_DISTANCE = 2.0; // Minimum distance from center to be visible
      let adjustedX = rawX;
      let adjustedY = rawY;
      let adjustedZ = rawZ;
      
      if (distanceFromCenter < MIN_DISTANCE && distanceFromCenter > 0) {
        // Scale up the offset to reach minimum distance
        const scale = MIN_DISTANCE / distanceFromCenter;
        adjustedX = dataCenter[0] + offsetX * scale;
        adjustedY = dataCenter[1] + offsetY * scale;
        adjustedZ = dataCenter[2] + offsetZ * scale;
        console.log('Adjusted coordinates (was too close to center):', [adjustedX, adjustedY, adjustedZ]);
      } else if (distanceFromCenter === 0) {
        // If exactly at center, offset in a visible direction
        adjustedX = dataCenter[0] + MIN_DISTANCE;
        adjustedY = dataCenter[1] + MIN_DISTANCE * 0.5;
        adjustedZ = dataCenter[2] + MIN_DISTANCE * 0.3;
        console.log('Adjusted coordinates (was at center):', [adjustedX, adjustedY, adjustedZ]);
      }
      
      const finalOffsetX = adjustedX - dataCenter[0];
      const finalOffsetY = adjustedY - dataCenter[1];
      const finalOffsetZ = adjustedZ - dataCenter[2];
      
      console.log('Extended position will be:', [
        dataCenter[0] + finalOffsetX * EXTENSION_FACTOR,
        dataCenter[1] + finalOffsetY * EXTENSION_FACTOR,
        dataCenter[2] + finalOffsetZ * EXTENSION_FACTOR
      ]);
      
      return [...persons, { 
        person_id: 'user-generated',
        name: userEmbedding.name || 'You',
        occupation: userEmbedding.occupation ? [userEmbedding.occupation] : [],
        x: adjustedX,
        y: adjustedY,
        z: adjustedZ,
        cluster_id: userEmbedding.cluster_id,
        cluster_label: userEmbedding.cluster_label,
        isUserGenerated: true,
      }];
    } catch (err) {
      console.error('Error processing user embedding:', err);
      return persons;
    }
  }, [persons, userEmbedding]);

  // Calculate number of unique clusters in current persons list
  const uniqueClusters = [...new Set(persons.map(p => p.cluster_id).filter(c => c !== null && c !== undefined))];
  const clusterCount = uniqueClusters.length;

  // Generate line data from origin to each person - EXTENDED 5X IN ALL DIRECTIONS
  // Calculate offset from center, extend it, then apply from origin
  const lineData = allPersons.map(person => {
    // Calculate direction vector from data center to this person
    const offsetX = person.x - dataCenter[0];
    const offsetY = person.y - dataCenter[1];
    const offsetZ = person.z - dataCenter[2];
    
    // Extend the offset by EXTENSION_FACTOR and apply from origin
    return {
      source: dataCenter, // Lines start from data center
      target: [
        dataCenter[0] + offsetX * EXTENSION_FACTOR,
        dataCenter[1] + offsetY * EXTENSION_FACTOR,
        dataCenter[2] + offsetZ * EXTENSION_FACTOR
      ],
      person: person,
    };
  });

  // Create line layer for trajectories - PROFESSIONAL DESIGN
  const lineLayer = new LineLayer({
    id: 'trajectories',
    data: lineData,
    pickable: false,
    getSourcePosition: d => d.source,
    getTargetPosition: d => d.target,
    getColor: d => {
      // USER GENERATED: Bright, pulsing golden line
      if (d.person.isUserGenerated) {
        return [255, 215, 0, 255]; // Pure gold, fully opaque
      }
      const color = getClusterColor(d.person.cluster_id);
      // More opaque lines so they're the star of the show
      return [...color, 120]; 
    },
    getWidth: d => {
      // USER GENERATED: Much thicker, highly visible
      if (d.person.isUserGenerated) return 6;
      // Thicker lines for selected person
      return d.person.person_id === selectedPersonId ? 3 : 1.5;
    },
    widthMinPixels: 1,
    widthMaxPixels: 8,
  });

  // Create scatterplot layer for persons - REFINED SPHERES
  const scatterLayer = new ScatterplotLayer({
    id: 'persons-scatterplot',
    data: allPersons,
    pickable: true,
    opacity: 0.95,
    stroked: true,
    filled: true,
    radiusScale: 0.08,             // MUCH smaller - spheres are endpoints, not focal points
    radiusMinPixels: 3,             // Tiny minimum (was 8)
    radiusMaxPixels: 20,            // Increased for user-generated
    lineWidthMinPixels: 1,          // Subtle border
    getPosition: (d) => {
      // Match the extended line endpoint positions
      const offsetX = d.x - dataCenter[0];
      const offsetY = d.y - dataCenter[1];
      const offsetZ = d.z - dataCenter[2];
      return [
        dataCenter[0] + offsetX * EXTENSION_FACTOR,
        dataCenter[1] + offsetY * EXTENSION_FACTOR,
        dataCenter[2] + offsetZ * EXTENSION_FACTOR
      ];
    },
    getRadius: (d) => {
      // USER GENERATED: Largest, most prominent
      if (d.isUserGenerated) return 0.35;
      // Selected person
      if (d.person_id === selectedPersonId) return 0.15;
      // Default
      return 0.05;
    },
    getFillColor: (d) => {
      // USER GENERATED: Brilliant gold with slight glow effect
      if (d.isUserGenerated) {
        return [255, 215, 0, 255]; // Pure gold
      }
      if (d.person_id === selectedPersonId) {
        return [255, 193, 7, 255]; // Vibrant amber for selected
      }
      const color = getClusterColor(d.cluster_id);
      // Spheres match line color - creating cohesive visual design
      return [...color, 255]; 
    },
    getLineColor: (d) => {
      // USER GENERATED: Bright white border for maximum visibility
      if (d.isUserGenerated) {
        return [255, 255, 255, 255];
      }
      if (d.person_id === selectedPersonId) {
        return [255, 255, 255, 255]; // White halo for selected
      }
      const color = getClusterColor(d.cluster_id);
      // Darker border of same color for 3D sphere effect
      return [...color.map(c => Math.max(0, c - 60)), 200];
    },
    onHover: (info) => {
      if (info.object) {
        setHoveredPerson(info.object);
      } else {
        setHoveredPerson(null);
      }
    },
    onClick: (info) => {
      if (info.object && onPersonClick) {
        onPersonClick(info.object);
      }
    },
    updateTriggers: {
      getRadius: [selectedPersonId],
      getFillColor: [selectedPersonId],
      getLineColor: [selectedPersonId],
    },
  });

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <DeckGL
        views={new OrbitView()}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={[lineLayer, scatterLayer]}
        getCursor={() => (hoveredPerson ? 'pointer' : 'grab')}
        style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0fe 50%, #f0f4f8 100%)',
        }}
      >
        {/* Professional Tooltip */}
        {hoveredPerson && (
          <div
            style={{
              position: 'absolute',
              zIndex: 1,
              pointerEvents: 'none',
              left: '50%',
              top: 20,
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.98)',
              color: '#1a202c',
              padding: '16px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              maxWidth: '380px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="font-bold text-lg mb-2 text-gray-900">{hoveredPerson.name}</div>
            <div className="text-gray-600 text-sm mb-3">
              {hoveredPerson.occupation?.join(', ') || 'Unknown occupation'}
            </div>
            {hoveredPerson.cluster_label && (
              <div 
                className="text-xs font-semibold inline-block px-3 py-1.5 rounded-full"
                style={{ 
                  backgroundColor: `rgba(${getClusterColor(hoveredPerson.cluster_id).join(',')}, 0.15)`,
                  border: `2px solid rgb(${getClusterColor(hoveredPerson.cluster_id).join(',')})`,
                  color: `rgb(${getClusterColor(hoveredPerson.cluster_id).map(c => Math.max(0, c - 40)).join(',')})`,
                }}
              >
                {hoveredPerson.cluster_label}
              </div>
            )}
          </div>
        )}
      </DeckGL>

      {/* Professional Controls Card */}
      <div className="absolute bottom-6 left-6 bg-white bg-opacity-95 backdrop-blur-md p-5 rounded-xl text-sm shadow-elevated border border-gray-200">
        <div className="font-bold mb-3 text-gray-900 flex items-center">
          <span className="text-lg mr-2">🎮</span>
          Controls
        </div>
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-center">
            <div className="w-24 font-medium text-gray-500">Left Drag</div>
            <div>Rotate view</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 font-medium text-gray-500">Right Drag</div>
            <div>Pan camera</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 font-medium text-gray-500">Scroll</div>
            <div>Zoom in/out</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 font-medium text-gray-500">Click</div>
            <div>View details</div>
          </div>
        </div>
      </div>

      {/* Professional Stats Card */}
      <div className="absolute top-6 left-6 bg-white bg-opacity-95 backdrop-blur-md p-6 rounded-xl shadow-elevated border border-gray-200">
        <div className="font-bold text-xl mb-4 text-gray-900 flex items-center">
          <span className="text-2xl mr-3">📊</span>
          Embedding Space
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-gray-600 font-medium">Persons</span>
            <span className="font-bold text-2xl text-blue-600">{allPersons.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Clusters</span>
            <span className="font-bold text-2xl text-purple-600">{clusterCount}</span>
          </div>
          {selectedCluster !== null && (
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200 bg-blue-50 -mx-2 px-2 py-2 rounded">
              🔍 Filtered to cluster {selectedCluster}
            </div>
          )}
          {userEmbedding && (
            <div className="mt-4 pt-4 border-t-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 -mx-2 px-3 py-3 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">⭐</span>
                <span className="font-bold text-gray-900">Your Embedding</span>
              </div>
              <div className="text-xs text-gray-700 space-y-1">
                <div><strong>Name:</strong> {userEmbedding.name}</div>
                <div><strong>Cluster:</strong> {userEmbedding.cluster_label}</div>
                <div className="text-yellow-700 font-semibold mt-2">
                  🌟 Look for the GOLD trajectory!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Info Card */}
      <div className="absolute top-6 right-6 bg-white bg-opacity-95 backdrop-blur-md p-5 rounded-xl shadow-elevated border border-gray-200 text-xs max-w-xs">
        <div className="font-bold mb-3 text-gray-900 flex items-center">
          <span className="text-lg mr-2">💡</span>
          Visualization Guide
        </div>
        <div className="text-gray-700 space-y-2 leading-relaxed">
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Colored lines</strong> radiate from center to each person</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Small spheres</strong> mark endpoint positions</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Each color</strong> represents a distinct career cluster</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Hover</strong> over spheres to preview biography</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Click</strong> to view full life trajectory details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationView;
