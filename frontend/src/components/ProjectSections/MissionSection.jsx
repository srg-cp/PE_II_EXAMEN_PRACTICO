import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BaseSection from './BaseSection';
import axios from 'axios';

const MissionSection = ({ projectId, sectionKey }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [projectId, sectionKey]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/projects/${projectId}/sections/${sectionKey}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setContent(response.data.content || '');
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent, shouldSave = true) => {
    setContent(newContent);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <BaseSection
      projectId={projectId}
      sectionKey={sectionKey}
      title="Misión del Proyecto"
      content={content}
      onContentChange={handleContentChange}
    >
      <ReactQuill
        theme="snow"
        value={content}
        placeholder="Define la misión de tu proyecto. ¿Cuál es el propósito fundamental y la razón de ser de este proyecto?"
        style={{ 
          height: '100%',
          '& .ql-editor': {
            minHeight: '400px',
            fontSize: '16px',
            lineHeight: '1.6'
          }
        }}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['link', 'blockquote'],
            [{ 'align': [] }],
            ['clean']
          ]
        }}
      />
    </BaseSection>
  );
};

export default MissionSection;