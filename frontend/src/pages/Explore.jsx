import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import VisualizationView from '../components/VisualizationView';
import ClusterLegend from '../components/ClusterLegend';
import PersonDetail from '../components/PersonDetail';
import UserEmbeddingInput from '../components/UserEmbeddingInput';
import UserEmbeddingResults from '../components/UserEmbeddingResults';

const Explore = () => {
  const [persons, setPersons] = useState([]);
  const [allPersons, setAllPersons] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [userEmbedding, setUserEmbedding] = useState(null);
  const [showUserInput, setShowUserInput] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load visualization data and clusters in parallel
        const [vizData, clustersData] = await Promise.all([
          apiService.getVisualizationData(),
          apiService.getClusters(),
        ]);

        setAllPersons(vizData.persons || []);
        setPersons(vizData.persons || []);
        setClusters(clustersData.clusters || []);
      } catch (err) {
        setError('Failed to load data. Make sure the backend is running on port 8081.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter persons by cluster
  useEffect(() => {
    if (selectedCluster === null) {
      setPersons(allPersons);
    } else {
      setPersons(allPersons.filter((p) => p.cluster_id === selectedCluster));
    }
  }, [selectedCluster, allPersons]);

  const handleClusterSelect = (clusterId) => {
    setSelectedCluster(clusterId);
    setSelectedPersonId(null); // Clear selection when changing cluster
  };

  const handlePersonClick = (person) => {
    setSelectedPersonId(person.person_id);
  };

  const handleCloseDetail = () => {
    setSelectedPersonId(null);
  };

  const handleUserEmbeddingGenerated = (embedding) => {
    try {
      console.log('User embedding generated:', embedding);
      setUserEmbedding(embedding);
      setShowUserInput(false);
      // Auto-zoom to user's position (optional, for better UX)
      setSelectedCluster(null); // Show all clusters to see user in context
    } catch (err) {
      console.error('Error handling user embedding:', err);
      setError('Failed to display your embedding. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        <div className="text-center bg-white p-12 rounded-2xl shadow-elevated border border-gray-200">
          <div className="spinner mx-auto mb-6"></div>
          <div className="text-gray-900 text-xl font-semibold mb-2">Loading Life Embeddings</div>
          <div className="text-gray-500 text-sm">Fetching 790 persons from database...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-10 py-8 rounded-2xl max-w-lg shadow-elevated">
          <div className="flex items-center mb-4">
            <svg className="w-10 h-10 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold">Connection Error</h2>
          </div>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Cluster Legend */}
        <div className="w-80 overflow-y-auto">
          <ClusterLegend
            clusters={clusters}
            selectedCluster={selectedCluster}
            onClusterSelect={handleClusterSelect}
          />
        </div>

        {/* Visualization */}
        <div className="flex-1 relative">
          <VisualizationView
            persons={persons}
            clusters={clusters}
            onPersonClick={handlePersonClick}
            selectedPersonId={selectedPersonId}
            selectedCluster={selectedCluster}
            userEmbedding={userEmbedding}
          />
          
          {/* Floating Action Button - Generate Your Embedding */}
          <button
            onClick={() => setShowUserInput(true)}
            className="absolute bottom-8 right-8 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold px-8 py-4 rounded-full shadow-float hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-3 z-30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-lg">
              {userEmbedding ? '✨ Update Your Embedding' : '✨ Generate Your Embedding'}
            </span>
          </button>

          {/* User Embedding Results Display */}
          {userEmbedding && (
            <UserEmbeddingResults
              userEmbedding={userEmbedding}
              onClose={() => setUserEmbedding(null)}
            />
          )}
        </div>
      </div>

      {/* Person Detail Modal */}
      {selectedPersonId && (
        <PersonDetail personId={selectedPersonId} onClose={handleCloseDetail} />
      )}

      {/* User Embedding Input Modal */}
      {showUserInput && (
        <UserEmbeddingInput
          onEmbeddingGenerated={handleUserEmbeddingGenerated}
          onClose={() => setShowUserInput(false)}
        />
      )}
    </div>
  );
};

export default Explore;
