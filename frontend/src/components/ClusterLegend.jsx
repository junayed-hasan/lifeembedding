import React from 'react';
import { getClusterColor, DEFAULT_CLUSTER_LABELS } from '../utils/colors';

const ClusterLegend = ({ clusters, selectedCluster, onClusterSelect }) => {
  // Use clusters from API or fall back to defaults
  const clusterList = clusters.length > 0
    ? clusters.map(c => ({
        id: c.cluster_id,
        label: c.cluster_label || DEFAULT_CLUSTER_LABELS[c.cluster_id] || `Cluster ${c.cluster_id}`,
        count: c.person_count,
      }))
    : Object.entries(DEFAULT_CLUSTER_LABELS).map(([id, label]) => ({
        id: parseInt(id),
        label,
        count: 0,
      }));

  return (
    <div className="bg-white border-r border-gray-200 p-5 overflow-y-auto max-h-full shadow-sm">
      <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">🎨</span>
          Career Clusters
        </h3>
        <p className="text-xs text-gray-500 mt-1">Click to filter visualization</p>
      </div>
      
      <div className="space-y-2">
        {/* Show All option */}
        <div
          className={`cursor-pointer p-3 rounded-lg transition-all border-2 ${
            selectedCluster === null
              ? 'bg-blue-50 border-blue-500 shadow-sm'
              : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-300'
          }`}
          onClick={() => onClusterSelect(null)}
        >
          <div className="flex items-center">
            <div
              className="w-5 h-5 rounded-full mr-3 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            />
            <div className="flex-1">
              <div className="font-bold text-sm text-gray-900">All Clusters</div>
              <div className="text-xs text-gray-500">Show complete dataset</div>
            </div>
            {selectedCluster === null && (
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>

        {/* Individual clusters */}
        {clusterList.map((cluster) => {
          const color = getClusterColor(cluster.id);
          const isSelected = selectedCluster === cluster.id;
          
          return (
            <div
              key={cluster.id}
              className={`cursor-pointer p-3 rounded-lg transition-all border-2 ${
                isSelected
                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => onClusterSelect(cluster.id)}
            >
              <div className="flex items-center">
                <div
                  className="w-5 h-5 rounded-full mr-3 shadow-sm border-2 border-white"
                  style={{
                    backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {cluster.label}
                  </div>
                  {cluster.count > 0 && (
                    <div className="text-xs text-gray-500">
                      {cluster.count} {cluster.count === 1 ? 'person' : 'persons'}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClusterLegend;
