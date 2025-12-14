import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 overflow-y-auto">
      <div className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="text-6xl">🧬</span>
          </div>
          <h1 className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            LifeEmbedding
          </h1>
          <p className="text-3xl text-gray-700 mb-6 font-medium">
            Vector-Based Life Trajectory Analysis
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Transform biographical narratives into high-dimensional vector embeddings. 
            Explore how 790 notable individuals cluster together based on their 
            education, careers, and achievements in an interactive 3D visualization.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-10 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Exploring
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl shadow-elevated border border-gray-200 hover:shadow-float transition-shadow">
            <div className="text-5xl mb-5">🌐</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">3D Visualization</h3>
            <p className="text-gray-600 leading-relaxed">
              Interactive 3D scatter plot showing 790 persons across 15 distinct clusters. 
              Rotate, zoom, and explore the embedding space with intuitive controls.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-elevated border border-gray-200 hover:shadow-float transition-shadow">
            <div className="text-5xl mb-5">🎯</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Cluster Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
              Discover meaningful patterns: baseball players, computer scientists, actors, 
              philosophers, and more naturally cluster together in embedding space.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-elevated border border-gray-200 hover:shadow-float transition-shadow">
            <div className="text-5xl mb-5">🔍</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Deep Insights</h3>
            <p className="text-gray-600 leading-relaxed">
              Click on any person to view their detailed biography, life events timeline, 
              and see how they compare to similar individuals.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 mb-20 shadow-float">
          <h2 className="text-4xl font-bold mb-10 text-center text-white">Dataset at a Glance</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-5xl font-extrabold text-white mb-3">790</div>
              <div className="text-blue-100 font-medium text-lg">Persons</div>
              <div className="text-blue-200 text-sm mt-1">Notable individuals</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-5xl font-extrabold text-white mb-3">15</div>
              <div className="text-purple-100 font-medium text-lg">Clusters</div>
              <div className="text-purple-200 text-sm mt-1">Career groups</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-5xl font-extrabold text-white mb-3">10.5K</div>
              <div className="text-green-100 font-medium text-lg">Life Events</div>
              <div className="text-green-200 text-sm mt-1">Total datapoints</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-5xl font-extrabold text-white mb-3">768</div>
              <div className="text-yellow-100 font-medium text-lg">Dimensions</div>
              <div className="text-yellow-200 text-sm mt-1">Vector size</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">How It Works</h2>
          <div className="space-y-8">
            <div className="flex items-start bg-white p-6 rounded-xl shadow-card border border-gray-200">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-14 h-14 flex items-center justify-center font-bold text-white text-xl mr-6 flex-shrink-0 shadow-md">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Data Collection</h3>
                <p className="text-gray-600 leading-relaxed">
                  Biographical data extracted from Wikidata including education, employment, 
                  awards, and other significant life events. 10,455 events across 790 individuals 
                  from 50+ occupations spanning 150 years.
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white p-6 rounded-xl shadow-card border border-gray-200">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full w-14 h-14 flex items-center justify-center font-bold text-white text-xl mr-6 flex-shrink-0 shadow-md">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Embedding Generation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Life narratives are converted into 768-dimensional semantic vectors using 
                  Google's text-embedding-004 model via Vertex AI. Each vector captures the 
                  essence of a person's life trajectory.
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white p-6 rounded-xl shadow-card border border-gray-200">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full w-14 h-14 flex items-center justify-center font-bold text-white text-xl mr-6 flex-shrink-0 shadow-md">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Dimensionality Reduction</h3>
                <p className="text-gray-600 leading-relaxed">
                  PCA reduces embeddings from 768D to 50D (preserving 53% variance), then UMAP 
                  projects to 3D for visualization while maintaining semantic relationships between 
                  similar life paths.
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white p-6 rounded-xl shadow-card border border-gray-200">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full w-14 h-14 flex items-center justify-center font-bold text-white text-xl mr-6 flex-shrink-0 shadow-md">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Clustering & Visualization</h3>
                <p className="text-gray-600 leading-relaxed">
                  K-means clustering identifies 15 distinct career groups with silhouette score 
                  of 0.42. Explore the interactive 3D space with intuitive controls: rotate, zoom, 
                  and click for details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <Link
            to="/explore"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-5 px-12 rounded-xl text-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Explore the Visualization</span>
            <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <p className="text-gray-500 mt-6 text-sm">
            Powered by BigQuery, Vertex AI, and React
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
