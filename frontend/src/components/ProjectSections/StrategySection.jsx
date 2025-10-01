import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const StrategySection = ({ projectId, sectionData, onDataUpdate }) => {
  const content = sectionData?.content || '';

  const handleContentChange = (newContent) => {
    onDataUpdate({ ...sectionData, content: newContent });
  };

  return (
    <ReactQuill
      theme="snow"
      value={content}
      onChange={handleContentChange}
      placeholder="Escriba en el siguiente recuadro la estrategia identificada en la Matriz FODA"
      style={{ 
        height: '400px',
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
  );
};

export default StrategySection;