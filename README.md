# React Spread Particle Image
React component to make interact with image into spread particle animation, which mainly inspired from This Youtube Video [Recreating The Hover Effect That Shocked Frontend Devs](https://www.youtube.com/watch?v=W78MY7_q_6A)

## Install
```bash
$ npm install react-spread-particle-image
# or
$ yarn add react-spread-particle-image
```

## Usage
### Basic Usage
```tsx
import SpreadParticleImage from 'react-spread-particle-image';

const myCoolImage = 'https://mycdn/mycoolimage.jpg';

const App = () => {
  return (
    <SpreadParticleImage src={myCoolImage} />
  );
};

export default App;
```

### Options
```ts
type Options = {
  quality?: number; // default: 4, image quality to determine the particle DIAMETER
  radius?: number; // default: 50, hover circle radius
  forceSpeed?: number; // default: 5, speed of particle leaving your touch point
  returnSpeed?: number; // default: 0.1, speed of particle returning to it's original point
};
```

## License
Licensed under the MIT License, Copyright © 2023-present Johnny Wang [johnnywang1994](https://github.com/johnnywang1994).
