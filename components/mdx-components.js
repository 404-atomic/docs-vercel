import React from 'react'

// Custom components for MDX
const mdxComponents = {
  iframe: (props) => (
    <div style={{ 
      position: 'relative',
      paddingTop: '56.25%', // 16:9 Aspect Ratio
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      <iframe
        {...props}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          ...props.style
        }}
      />
    </div>
  )
}

export default mdxComponents 