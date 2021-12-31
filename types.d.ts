import * as React from 'react';

export interface ColorPickerProps extends React.Props<ColorPicker> {
  /** Use row or vertical layout */
  row?: boolean,
  /** Enables snapping on the center of wheel and edges of wheel and slider */
  noSnap?: boolean,
  /** Wheel color thumb size */
  thumbSize?: number,
  /** Slider and slider color thumb size */
  sliderSize?: number,
  /** Gap size between wheel & slider */
  gapSize?: number,
  /** Use swatchs of shades instead of slider */
  discrete?: boolean,
  /** Number of swatchs of shades */
  discreteLength?: number,
  /** If true the slider is hidden */
  sliderHidden?: boolean,
  /** Show color swatches */
  swatches?: boolean,
  /** If false swatches are shown before wheel */
  swatchesLast?: boolean,
  /** Show swatch only and hide wheel and slider */
  swatchesOnly?: boolean,
  /** Defines how far the touch event can start away from the swatch */
  swatchesHitSlop?: {top: number, left: number, bottom: number, right: number},
  /** Color of the color picker */
  color?: string,
  /** Palette colors of swatches */
  palette?: string[],
  /** If true the wheel thumb color is shaded */
  shadeWheelThumb?: boolean,
  /** If true the slider thumb color is shaded */
  shadeSliderThumb?: boolean,
  /** If true the slider thumb is reset to 0 value when wheel thumb is moved */
  autoResetSlider?: boolean,
  /** Callback function triggered when user begins dragging slider/wheel */
  onInteractionStart?: () => void,
  /** Callback function providing current color while user is actively dragging slider/wheel */
  onColorChange?: (color: string) => void,
  /** Callback function providing final color when user stops dragging slider/wheel */
  onColorChangeComplete?: (color: string) => void,
}

declare class ColorPicker extends React.Component<ColorPickerProps, any> {
  revert(): void;
}

declare module 'react-native-wheel-color-picker-master' {
}

export default ColorPicker;