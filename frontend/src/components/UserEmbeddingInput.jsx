import React, { useState } from 'react';
import { apiService } from '../services/api';

const UserEmbeddingInput = ({ onEmbeddingGenerated, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    occupation: '',
    education: [],
    employment: [],
    awards: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSection, setCurrentSection] = useState('basic'); // basic, education, employment, awards

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add array items
  const addArrayItem = (field, item) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], item.trim()]
      }));
      return true;
    }
    return false;
  };

  // Remove array items
  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.occupation) {
      setError('Name and occupation are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the generate-embedding API
      const response = await apiService.generateEmbedding({
        name: formData.name,
        description: formData.occupation, // Use occupation as description
        life_events: [
          ...formData.education.map(e => ({ 
            event_type: 'education', 
            event_title: e,
            event_description: e 
          })),
          ...formData.employment.map(e => ({ 
            event_type: 'employment', 
            event_title: e,
            event_description: e 
          })),
          ...formData.awards.map(e => ({ 
            event_type: 'award', 
            event_title: e,
            event_description: e 
          })),
        ]
      });

      // Transform API response to match expected format
      // API returns: user_coordinates, nearest_cluster, similar_persons
      // We need: coordinates (array), cluster_id, cluster_label, similar_persons
      onEmbeddingGenerated({
        name: formData.name,
        occupation: formData.occupation,
        coordinates: [
          response.user_coordinates.x,
          response.user_coordinates.y,
          response.user_coordinates.z
        ],
        cluster_id: response.nearest_cluster.cluster_id,
        cluster_label: response.nearest_cluster.cluster_label,
        similar_persons: response.similar_persons,
        isUserGenerated: true,
      });

    } catch (err) {
      setError(err.message || 'Failed to generate embedding. Please try again.');
      console.error('Embedding generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-float max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Generate Your Life Embedding</h2>
              <p className="text-blue-100">See where you fit in the career trajectory space</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {['basic', 'education', 'employment', 'awards'].map((section, index) => (
              <div key={section} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    currentSection === section
                      ? 'bg-blue-600 text-white'
                      : formData[section]?.length > 0 || (section === 'basic' && formData.name)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:inline">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </span>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            {currentSection === 'basic' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Occupation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="e.g., Software Engineer, Teacher, Researcher"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    required
                  />
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>Next steps:</strong> Add your education, work experience, and awards to generate 
                    a more accurate embedding. The more information you provide, the better the comparison!
                  </p>
                </div>
              </div>
            )}

            {/* Education Section */}
            {currentSection === 'education' && (
              <EducationArrayInput
                items={formData.education}
                onAdd={(item) => addArrayItem('education', item)}
                onRemove={(index) => removeArrayItem('education', index)}
              />
            )}

            {/* Employment Section */}
            {currentSection === 'employment' && (
              <EmploymentArrayInput
                items={formData.employment}
                onAdd={(item) => addArrayItem('employment', item)}
                onRemove={(index) => removeArrayItem('employment', index)}
              />
            )}

            {/* Awards Section */}
            {currentSection === 'awards' && (
              <AwardsArrayInput
                items={formData.awards}
                onAdd={(item) => addArrayItem('awards', item)}
                onRemove={(index) => removeArrayItem('awards', index)}
              />
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const sections = ['basic', 'education', 'employment', 'awards'];
              const currentIndex = sections.indexOf(currentSection);
              if (currentIndex > 0) setCurrentSection(sections[currentIndex - 1]);
            }}
            disabled={currentSection === 'basic'}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              currentSection === 'basic'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Previous
          </button>

          <div className="flex items-center space-x-3">
            {currentSection !== 'awards' ? (
              <button
                type="button"
                onClick={() => {
                  const sections = ['basic', 'education', 'employment', 'awards'];
                  const currentIndex = sections.indexOf(currentSection);
                  if (currentIndex < sections.length - 1) setCurrentSection(sections[currentIndex + 1]);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.name || !formData.occupation}
                className={`px-8 py-3 rounded-lg font-bold transition-all ${
                  loading || !formData.name || !formData.occupation
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '✨ Generate My Embedding'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Education Array Input Component
const EducationArrayInput = ({ items, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (onAdd(input)) {
      setInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Education Background
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Add your degrees, institutions, and fields of study
        </p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder="e.g., PhD in Computer Science, Stanford University"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-gray-900">{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Employment Array Input Component
const EmploymentArrayInput = ({ items, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (onAdd(input)) {
      setInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Work Experience
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Add your jobs, positions, and organizations
        </p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder="e.g., Senior Software Engineer at Google"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-gray-900">{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Awards Array Input Component
const AwardsArrayInput = ({ items, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (onAdd(input)) {
      setInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Awards & Achievements
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Add your notable awards, honors, and recognitions
        </p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder="e.g., ACM Fellow, National Science Foundation Grant"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-gray-900">{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <p className="text-sm text-gray-700">
          <strong>Almost done!</strong> Click "Generate My Embedding" to see where you fit in the career trajectory space.
        </p>
      </div>
    </div>
  );
};

export default UserEmbeddingInput;
