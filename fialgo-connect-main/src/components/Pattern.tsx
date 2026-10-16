import React from 'react';
import styled from 'styled-components';

const Pattern = () => {
  return (
    <StyledWrapper>
      <div className="futuristic-pattern">
        <span className="ripple-overlay" />
        <svg className="texture-filter">
          <filter id="advanced-texture">
            <feTurbulence result="noise" numOctaves={3} baseFrequency="0.7" type="fractalNoise" />
            <feSpecularLighting result="specular" lightingColor="#fff" specularExponent={20} specularConstant="0.8" surfaceScale={2} in="noise">
              <fePointLight z={100} y={50} x={50} />
            </feSpecularLighting>
            <feComposite result="litNoise" operator="in" in2="SourceGraphic" in="specular" />
            <feBlend mode="overlay" in2="litNoise" in="SourceGraphic" />
          </filter>
        </svg>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.6; /* Adjust opacity as needed */

  .futuristic-pattern {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      145deg,
      rgba(59, 43, 124, 0.9),
      rgba(106, 76, 169, 0.9),
      rgba(155, 108, 214, 0.9)
    );
    filter: url(#advanced-texture);
  }

  .texture-filter {
    display: none;
  }
`;

export default Pattern;
