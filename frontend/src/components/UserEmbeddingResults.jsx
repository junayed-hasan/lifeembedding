import React from 'react';
import { getClusterColor } from '../utils/colors';

const UserEmbeddingResults = ({ userEmbedding, onClose }) => {
  if (!userEmbedding) return null;

  const clusterColor = getClusterColor(userEmbedding.cluster_id);

  return (
    <div className="absolute top-24 right-8 bg-white bg-opacity-98 backdrop-blur-md rounded-2xl shadow-float border-2 border-yellow-400 p-6 max-w-md z-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-3">⭐</span>
          <h3 className="text-2xl font-bold text-gray-900">Your Results</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Your Info */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 mb-5">
        <div className="font-bold text-lg text-gray-900 mb-2">{userEmbedding.name}</div>
        <div className="text-sm text-gray-700 mb-3">
          <strong>Occupation:</strong> {userEmbedding.occupation}
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-2 border-2 border-white shadow-sm"
            style={{ backgroundColor: `rgb(${clusterColor[0]}, ${clusterColor[1]}, ${clusterColor[2]})` }}
          />
          <div className="text-sm">
            <strong>Assigned Cluster:</strong> {userEmbedding.cluster_label}
          </div>
        </div>
      </div>

      {/* Similar Persons */}
      {userEmbedding.similar_persons && userEmbedding.similar_persons.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Most Similar Persons
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {userEmbedding.similar_persons.slice(0, 5).map((person, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-gray-900 text-sm">{person.name}</div>
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {(person.similarity * 100).toFixed(1)}% match
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {person.occupation?.join(', ') || 'Various occupations'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Guide */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-700 space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Look for the <strong className="text-yellow-700">GOLD trajectory</strong> in the visualization</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 shadow-lg"></div>
            <span>Your position is marked with a <strong className="text-yellow-700">larger sphere</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEmbeddingResults;
