import './theme/fonts';
import React from 'react';
import {Composition} from 'remotion';
import {
  RawaqDesignSystemShowcase,
  SHOWCASE_DURATION,
} from './showcase/RawaqDesignSystemShowcase';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="RawaqDesignSystemShowcase"
        component={RawaqDesignSystemShowcase}
        durationInFrames={SHOWCASE_DURATION}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
